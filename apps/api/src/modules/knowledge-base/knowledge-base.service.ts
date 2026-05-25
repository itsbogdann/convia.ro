import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  DocumentSourceType,
  DocumentStatus,
} from '@convia/shared-types';
import { Agent } from '../../entities/agent.entity';
import { KnowledgeBase } from '../../entities/knowledge-base.entity';
import {
  Document,
  DocumentMetadata,
} from '../../entities/document.entity';
import { DocumentChunk } from '../../entities/document-chunk.entity';
import { OpenAIService } from '../../common/services/openai.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateKnowledgeBaseDto } from './dto/update-kb.dto';
import { chunkText } from './utils/chunker';
import { fetchPage, hashContent } from './utils/url-fetcher';

/**
 * Single response shape for the dashboard's similarity-search debug tool
 * (the API also calls the same RPC internally during conversations).
 */
export interface SimilarChunk {
  id: string;
  documentId: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

const EMBED_BATCH_SIZE = 100; // OpenAI accepts up to 2048; 100 is conservative for stability

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(
    @InjectRepository(KnowledgeBase)
    private readonly kbs: Repository<KnowledgeBase>,
    @InjectRepository(Document)
    private readonly documents: Repository<Document>,
    @InjectRepository(DocumentChunk)
    private readonly chunks: Repository<DocumentChunk>,
    @InjectRepository(Agent)
    private readonly agents: Repository<Agent>,
    private readonly openai: OpenAIService,
    private readonly supabase: SupabaseService,
    private readonly dataSource: DataSource,
  ) {}

  // ───────────────────────────────────────────────────────────────────────
  // KB CRUD (one KB per agent, auto-created on first access)
  // ───────────────────────────────────────────────────────────────────────

  async getOrCreateForAgent(
    teamId: string,
    agentId: string,
  ): Promise<KnowledgeBase> {
    const agent = await this.agents.findOne({ where: { id: agentId, teamId } });
    if (!agent) throw new NotFoundException('Bot not found');

    const existing = await this.kbs.findOne({ where: { agentId, teamId } });
    if (existing) return existing;

    const created = this.kbs.create({
      teamId,
      agentId,
      name: `KB pentru ${agent.name}`,
      description: null,
      embeddingModel: 'text-embedding-3-small',
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    return this.kbs.save(created);
  }

  async updateKB(
    teamId: string,
    agentId: string,
    dto: UpdateKnowledgeBaseDto,
  ): Promise<KnowledgeBase> {
    const kb = await this.getOrCreateForAgent(teamId, agentId);
    if (dto.name !== undefined) kb.name = dto.name;
    if (dto.description !== undefined) kb.description = dto.description;
    if (dto.chunkSize !== undefined) kb.chunkSize = dto.chunkSize;
    if (dto.chunkOverlap !== undefined) kb.chunkOverlap = dto.chunkOverlap;
    if (kb.chunkOverlap >= kb.chunkSize) {
      throw new BadRequestException(
        'chunkOverlap must be smaller than chunkSize',
      );
    }
    return this.kbs.save(kb);
  }

  // ───────────────────────────────────────────────────────────────────────
  // Documents
  // ───────────────────────────────────────────────────────────────────────

  async listDocuments(
    teamId: string,
    agentId: string,
  ): Promise<Document[]> {
    const kb = await this.getOrCreateForAgent(teamId, agentId);
    return this.documents.find({
      where: { knowledgeBaseId: kb.id, teamId },
      order: { createdAt: 'DESC' },
    });
  }

  async findDocument(
    teamId: string,
    agentId: string,
    documentId: string,
  ): Promise<Document> {
    const kb = await this.getOrCreateForAgent(teamId, agentId);
    const doc = await this.documents.findOne({
      where: { id: documentId, teamId, knowledgeBaseId: kb.id },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  /**
   * Create a document row in PENDING state and kick off async processing.
   * Returns immediately — caller polls the document status to see progress.
   */
  async addDocument(
    teamId: string,
    agentId: string,
    dto: CreateDocumentDto,
  ): Promise<Document> {
    const kb = await this.getOrCreateForAgent(teamId, agentId);
    this.validateDtoForSourceType(dto);

    const doc = this.documents.create({
      teamId,
      knowledgeBaseId: kb.id,
      name: dto.name,
      sourceType: dto.sourceType,
      sourceUrl: dto.sourceUrl ?? null,
      rawContent: dto.content ?? null,
      status: DocumentStatus.PENDING,
      fileSize:
        dto.content != null ? Buffer.byteLength(dto.content, 'utf8') : null,
      metadata: {},
      chunkCount: 0,
    });
    const saved = await this.documents.save(doc);

    // Fire-and-forget; process in the background. Errors land on the doc row.
    void this.processDocument(saved.id).catch((err) => {
      this.logger.error(
        `Background processing failed for document ${saved.id}: ${err}`,
      );
    });

    return saved;
  }

  /**
   * Re-run chunking + embedding for an existing document. Useful after the
   * source URL changed or chunk settings were updated.
   */
  async reindexDocument(
    teamId: string,
    agentId: string,
    documentId: string,
  ): Promise<Document> {
    const doc = await this.findDocument(teamId, agentId, documentId);
    doc.status = DocumentStatus.PENDING;
    doc.errorMessage = null;
    const saved = await this.documents.save(doc);

    // Clear existing chunks before re-running
    await this.chunks.delete({ documentId: saved.id });

    void this.processDocument(saved.id).catch((err) => {
      this.logger.error(`Reindex failed for document ${saved.id}: ${err}`);
    });
    return saved;
  }

  async deleteDocument(
    teamId: string,
    agentId: string,
    documentId: string,
  ): Promise<void> {
    const doc = await this.findDocument(teamId, agentId, documentId);
    // Cascade FK on document_chunks handles chunk cleanup; the document row
    // deletion triggers a counter decrement on the KB via SQL trigger.
    await this.documents.delete(doc.id);
  }

  // ───────────────────────────────────────────────────────────────────────
  // Background processing
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Fetch (if URL) → chunk → embed → persist. Updates the document row's
   * status field throughout. Safe to call concurrently; the DB has a unique
   * constraint on (document_id, chunk_index) implicitly via the cleanup step.
   */
  private async processDocument(documentId: string): Promise<void> {
    const doc = await this.documents.findOne({ where: { id: documentId } });
    if (!doc) {
      this.logger.warn(`Document ${documentId} disappeared before processing`);
      return;
    }

    doc.status = DocumentStatus.PROCESSING;
    await this.documents.save(doc);

    try {
      const { text, metadata } = await this.extractText(doc);
      const kb = await this.kbs.findOne({ where: { id: doc.knowledgeBaseId } });
      if (!kb) throw new Error('Knowledge base disappeared');

      const chunks = chunkText(text, {
        chunkSize: kb.chunkSize,
        chunkOverlap: kb.chunkOverlap,
      });

      if (chunks.length === 0) {
        throw new Error('No content was extracted from the source');
      }

      this.logger.log(
        `Embedding ${chunks.length} chunks for document ${doc.id} (${doc.name})`,
      );

      // Generate embeddings in batches. OpenAI's batch API returns one
      // embedding per input, in order.
      const embeddings: number[][] = [];
      for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
        const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
        const vectors = await this.openai.generateEmbeddings(batch);
        if (vectors.length !== batch.length) {
          throw new Error(
            `Embedding API returned ${vectors.length} vectors for ${batch.length} inputs`,
          );
        }
        embeddings.push(...vectors);
      }

      // Insert via Supabase client (handles pgvector type natively).
      const supabase = this.supabase.getClient();
      const rows = chunks.map((content, index) => ({
        document_id: doc.id,
        knowledge_base_id: doc.knowledgeBaseId,
        content,
        chunk_index: index,
        embedding: embeddings[index],
        metadata: {},
      }));

      // Chunk the inserts too — Supabase has a default 1MB body limit
      const INSERT_BATCH = 200;
      for (let i = 0; i < rows.length; i += INSERT_BATCH) {
        const batch = rows.slice(i, i + INSERT_BATCH);
        const { error } = await supabase.from('document_chunks').insert(batch);
        if (error) {
          throw new Error(
            `Failed to insert chunks (batch ${i / INSERT_BATCH}): ${error.message}`,
          );
        }
      }

      doc.status = DocumentStatus.COMPLETED;
      doc.chunkCount = chunks.length;
      doc.processedAt = new Date();
      doc.errorMessage = null;
      doc.metadata = { ...doc.metadata, ...metadata };
      await this.documents.save(doc);

      this.logger.log(
        `Document ${doc.id} processed: ${chunks.length} chunks indexed`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Processing failed for ${documentId}: ${message}`);
      doc.status = DocumentStatus.FAILED;
      doc.errorMessage = message.slice(0, 1000);
      await this.documents.save(doc);
    }
  }

  /**
   * Pull raw text out of whatever source the document references.
   * For MVP we handle URLs and raw text. File-typed sources expect the
   * caller to have downloaded + extracted into rawContent before saving.
   */
  private async extractText(
    doc: Document,
  ): Promise<{ text: string; metadata: DocumentMetadata }> {
    if (doc.sourceType === DocumentSourceType.RAW_TEXT) {
      if (!doc.rawContent) {
        throw new Error('Raw text document has no content');
      }
      return {
        text: doc.rawContent,
        metadata: {
          wordCount: countWords(doc.rawContent),
          contentHash: await hashContent(doc.rawContent),
        },
      };
    }

    if (doc.sourceType === DocumentSourceType.URL) {
      if (!doc.sourceUrl) throw new Error('URL document missing sourceUrl');
      const page = await fetchPage(doc.sourceUrl);
      return {
        text: page.text,
        metadata: {
          pageTitle: page.title,
          language: page.language ?? undefined,
          wordCount: countWords(page.text),
          crawledAt: new Date().toISOString(),
          contentHash: await hashContent(page.text),
        },
      };
    }

    // For file-uploaded sources, rawContent should already be populated by
    // a parser that ran before we got here. We'll wire those in a follow-up.
    if (doc.rawContent) {
      return {
        text: doc.rawContent,
        metadata: { wordCount: countWords(doc.rawContent) },
      };
    }

    throw new Error(
      `Source type ${doc.sourceType} is not yet supported (file ingestion is on the roadmap)`,
    );
  }

  private validateDtoForSourceType(dto: CreateDocumentDto): void {
    if (dto.sourceType === DocumentSourceType.RAW_TEXT && !dto.content) {
      throw new BadRequestException('content is required for raw_text documents');
    }
    if (
      dto.sourceType === DocumentSourceType.URL &&
      !dto.sourceUrl
    ) {
      throw new BadRequestException('sourceUrl is required for URL documents');
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // Similarity search (used by the conversations engine during chat)
  // ───────────────────────────────────────────────────────────────────────

  async searchSimilar(
    knowledgeBaseId: string,
    queryText: string,
    options: { topK?: number; threshold?: number } = {},
  ): Promise<SimilarChunk[]> {
    const topK = options.topK ?? 5;
    const threshold = options.threshold ?? 0.7;

    const [queryEmbedding] = await this.openai.generateEmbeddings([queryText]);
    if (!queryEmbedding) {
      throw new Error('Failed to generate query embedding');
    }

    const supabase = this.supabase.getClient();
    const { data, error } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_kb_id: knowledgeBaseId,
      match_count: topK,
      match_threshold: threshold,
    });

    if (error) {
      throw new Error(`Similarity search failed: ${error.message}`);
    }

    return (data ?? []).map((row: any) => ({
      id: row.id,
      documentId: row.document_id,
      content: row.content,
      similarity: row.similarity,
      metadata: row.metadata,
    }));
  }
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
