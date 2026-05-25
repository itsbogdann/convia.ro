import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { OpenAIService } from './openai.service';
import { ChunkData, VectorSearchResult } from './pinecone.service';

/**
 * Supabase Vector Service
 *
 * Drop-in replacement for PineconeService using pgvector + OpenAI embeddings.
 * Uses the vector_chunks table and match_vector_chunks RPC functions.
 */
@Injectable()
export class SupabaseVectorService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseVectorService.name);
  private _isConfigured = false;
  private _initPromise: Promise<void> | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private openaiService: OpenAIService,
    private configService: ConfigService,
  ) {}

  get isConfigured(): boolean {
    // If not yet configured, optimistically return true so callers
    // proceed to call search/upsert which will ensureReady() properly.
    // This handles the factory creation timing issue where onModuleInit
    // runs before SupabaseService is ready.
    return true;
  }

  async onModuleInit() {
    // Defer init — SupabaseService may not be ready yet when created via factory
    this._initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    const client = this.supabaseService.getClient();
    if (!client) {
      this.logger.warn('Supabase client not available yet, will retry on first use');
      return;
    }

    // Retry a few times — PostgREST's schema cache can take 30-60s to rebuild
    // after a new table is created, returning PGRST002 in the meantime.
    const delaysMs = [0, 2000, 5000, 10000];
    let lastError: unknown = null;

    for (let i = 0; i < delaysMs.length; i++) {
      if (delaysMs[i] > 0) {
        await new Promise((r) => setTimeout(r, delaysMs[i]));
      }

      try {
        const { error } = await client.from('vector_chunks').select('id').limit(1);
        if (!error) {
          this._isConfigured = true;
          this.logger.log('Supabase Vector Service initialized (pgvector)');
          return;
        }
        lastError = error;
        // PGRST002 = PostgREST schema cache still rebuilding — keep retrying.
        // Anything else is a real problem; stop retrying.
        if (error.code !== 'PGRST002') break;
      } catch (err) {
        lastError = err;
        break;
      }
    }

    this.logger.warn(
      `Supabase Vector Service init deferred (will retry on first use). Last error: ${JSON.stringify(lastError)}`,
    );
  }

  /**
   * Ensure the service is initialized before use.
   * Handles the case where onModuleInit ran before SupabaseService was ready.
   */
  private async ensureReady(): Promise<boolean> {
    if (this._isConfigured) return true;

    // Retry initialization
    await this.initialize();
    return this._isConfigured;
  }

  isReady(): boolean {
    return this._isConfigured;
  }

  /**
   * Upsert document chunks with OpenAI embeddings
   */
  async upsertChunks(
    chunks: ChunkData[],
    namespace?: string,
  ): Promise<{ upsertedCount: number }> {
    if (!(await this.ensureReady())) {
      this.logger.warn('Supabase vector not configured, skipping upsert');
      return { upsertedCount: 0 };
    }

    try {
      const batchSize = 96;
      let upsertedCount = 0;
      const client = this.supabaseService.getClient();

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        // Truncate any text exceeding embedding model's token limit (~8192 tokens ≈ 28000 chars)
        const MAX_EMBED_CHARS = 28000;
        const texts = batch.map((chunk) =>
          chunk.content.length > MAX_EMBED_CHARS
            ? chunk.content.substring(0, MAX_EMBED_CHARS)
            : chunk.content,
        );

        // Generate embeddings via OpenAI
        const embeddings = await this.openaiService.generateEmbeddings(texts);

        const rows = batch.map((chunk, j) => ({
          id: chunk.id,
          content: chunk.content,
          embedding: JSON.stringify(embeddings[j]),
          document_id: chunk.metadata.documentId || null,
          document_name: chunk.metadata.documentName || null,
          knowledge_base_id: chunk.metadata.knowledgeBaseId || null,
          chunk_index: chunk.metadata.chunkIndex ?? null,
          file_id: chunk.metadata.fileId || null,
          file_name: chunk.metadata.fileName || null,
          website_source_id: chunk.metadata.websiteSourceId || null,
          agent_id: chunk.metadata.agentId || null,
          url: chunk.metadata.url || null,
          title: chunk.metadata.title || null,
          type: chunk.metadata.type || null,
          namespace: namespace || '',
          extra_metadata: this.extractExtraMetadata(chunk.metadata),
        }));

        const { error } = await client.from('vector_chunks').upsert(rows);

        if (error) {
          this.logger.error(`Upsert batch failed: ${error.message}`);
          throw error;
        }

        upsertedCount += rows.length;

        if (chunks.length > batchSize) {
          this.logger.log(`Supabase vector progress: ${upsertedCount}/${chunks.length} vectors`);
        }
      }

      this.logger.log(`Upserted ${upsertedCount} vectors to Supabase`);
      return { upsertedCount };
    } catch (error) {
      this.logger.error('Failed to upsert chunks:', error.message);
      throw error;
    }
  }

  /**
   * Search for similar chunks using pgvector cosine similarity
   */
  async search(
    query: string,
    options: {
      knowledgeBaseIds?: string[];
      filter?: Record<string, unknown>;
      limit?: number;
      namespace?: string;
      minScore?: number;
    } = {},
  ): Promise<VectorSearchResult[]> {
    if (!(await this.ensureReady())) {
      this.logger.warn('Supabase vector not configured, returning empty results');
      return [];
    }

    const { knowledgeBaseIds, filter: customFilter, limit = 5, namespace, minScore = 0.05 } = options;

    try {
      // Generate query embedding via OpenAI
      const queryEmbedding = await this.openaiService.generateEmbedding(query);

      const client = this.supabaseService.getClient();
      let results: any[];

      // Check if we need the OR-based RPC (complex $or filter from agents-knowledge)
      if (customFilter && '$or' in customFilter) {
        results = await this.searchWithOrFilter(client, queryEmbedding, customFilter, limit, minScore, namespace);
      } else {
        // Use the standard AND-based RPC
        const rpcParams: Record<string, unknown> = {
          query_embedding: JSON.stringify(queryEmbedding),
          match_limit: limit,
          min_score: minScore,
          filter_namespace: namespace || '',
        };

        if (knowledgeBaseIds?.length) {
          rpcParams.filter_kb_ids = knowledgeBaseIds;
        }

        // Handle simple custom filters
        if (customFilter) {
          this.applySimpleFilters(customFilter, rpcParams);
        }

        const { data, error } = await client.rpc('match_vector_chunks', rpcParams);

        if (error) {
          this.logger.error(`Vector search failed: ${error.message}`);
          return [];
        }

        results = data || [];
      }

      return results.map((r: any) => ({
        id: r.id,
        score: r.score || 0,
        content: r.content || '',
        metadata: {
          documentId: r.document_id || '',
          documentName: r.document_name || '',
          knowledgeBaseId: r.knowledge_base_id || '',
          chunkIndex: r.chunk_index || 0,
          fileId: r.file_id || '',
          fileName: r.file_name || '',
          websiteSourceId: r.website_source_id || '',
          agentId: r.agent_id || '',
          url: r.url || '',
          title: r.title || '',
          type: r.type || '',
          ...(r.extra_metadata || {}),
        },
      }));
    } catch (error) {
      this.logger.error('Failed to search:', error.message);
      return [];
    }
  }

  /**
   * Delete vectors by IDs
   */
  async deleteByIds(ids: string[], namespace?: string): Promise<void> {
    if (!(await this.ensureReady())) return;

    try {
      const client = this.supabaseService.getClient();
      const batchSize = 1000;

      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        let query = client.from('vector_chunks').delete().in('id', batch);
        if (namespace !== undefined) {
          query = query.eq('namespace', namespace);
        }
        const { error } = await query;
        if (error) {
          this.logger.error(`Delete batch failed: ${error.message}`);
        }
      }

      this.logger.log(`Deleted ${ids.length} vectors from Supabase`);
    } catch (error) {
      this.logger.error('Failed to delete vectors:', error.message);
    }
  }

  /**
   * Delete all vectors for a knowledge base
   */
  async deleteByKnowledgeBase(
    knowledgeBaseId: string,
    namespace?: string,
  ): Promise<void> {
    if (!(await this.ensureReady())) return;

    try {
      const client = this.supabaseService.getClient();
      let query = client
        .from('vector_chunks')
        .delete()
        .eq('knowledge_base_id', knowledgeBaseId);

      if (namespace !== undefined) {
        query = query.eq('namespace', namespace);
      }

      const { error } = await query;
      if (error) {
        this.logger.error(`Delete by KB failed: ${error.message}`);
      }

      this.logger.log(`Deleted all vectors for knowledge base ${knowledgeBaseId}`);
    } catch (error) {
      this.logger.error('Failed to delete vectors for knowledge base:', error.message);
    }
  }

  /**
   * Delete all vectors for a document
   */
  async deleteByDocument(
    documentId: string,
    namespace?: string,
  ): Promise<void> {
    if (!(await this.ensureReady())) return;

    try {
      const client = this.supabaseService.getClient();
      let query = client
        .from('vector_chunks')
        .delete()
        .eq('document_id', documentId);

      if (namespace !== undefined) {
        query = query.eq('namespace', namespace);
      }

      const { error } = await query;
      if (error) {
        this.logger.error(`Delete by document failed: ${error.message}`);
      }

      this.logger.log(`Deleted all vectors for document ${documentId}`);
    } catch (error) {
      this.logger.error('Failed to delete vectors for document:', error.message);
    }
  }

  /**
   * Get index statistics
   */
  async getStats(): Promise<{
    totalVectors: number;
    dimension: number;
  } | null> {
    if (!(await this.ensureReady())) return null;

    try {
      const client = this.supabaseService.getClient();
      const { count, error } = await client
        .from('vector_chunks')
        .select('id', { count: 'exact', head: true });

      if (error) return null;

      return {
        totalVectors: count || 0,
        dimension: 1536,
      };
    } catch (error) {
      this.logger.error('Failed to get stats:', error.message);
      return null;
    }
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  /**
   * Handle complex $or filters used by agents-knowledge service.
   * Runs multiple AND-based RPC calls and merges results, sorted by score.
   */
  private async searchWithOrFilter(
    client: any,
    queryEmbedding: number[],
    filter: Record<string, unknown>,
    limit: number,
    minScore: number,
    namespace?: string,
  ): Promise<any[]> {
    const orClauses = filter.$or as Record<string, unknown>[];
    if (!orClauses || orClauses.length === 0) return [];

    let fileIds: string[] | null = null;
    let websiteIds: string[] | null = null;
    let kbId: string | null = null;

    for (const clause of orClauses) {
      if (clause.type === 'file' && clause.fileId) {
        const fileFilter = clause.fileId as Record<string, unknown>;
        fileIds = (fileFilter.$in as string[]) || null;
      } else if (clause.type === 'website' && clause.websiteSourceId) {
        const wsFilter = clause.websiteSourceId as Record<string, unknown>;
        websiteIds = (wsFilter.$in as string[]) || null;
      } else if (clause.knowledgeBaseId) {
        const kbFilter = clause.knowledgeBaseId as Record<string, unknown>;
        kbId = (kbFilter.$eq as string) || (clause.knowledgeBaseId as string) || null;
      }
    }

    const embeddingStr = JSON.stringify(queryEmbedding);
    const baseParams = {
      query_embedding: embeddingStr,
      match_limit: limit,
      min_score: minScore,
      filter_namespace: namespace || '',
    };

    // Run parallel AND queries for each OR clause, then merge
    const queries: Promise<any[]>[] = [];

    if (fileIds?.length) {
      queries.push(
        client.rpc('match_vector_chunks', { ...baseParams, filter_file_ids: fileIds })
          .then(({ data, error }: any) => {
            if (error) this.logger.error(`File search failed: ${error.message}`);
            return data || [];
          }),
      );
    }

    if (websiteIds?.length) {
      queries.push(
        client.rpc('match_vector_chunks', { ...baseParams, filter_ws_ids: websiteIds })
          .then(({ data, error }: any) => {
            if (error) this.logger.error(`Website search failed: ${error.message}`);
            return data || [];
          }),
      );
    }

    if (kbId) {
      queries.push(
        client.rpc('match_vector_chunks', { ...baseParams, filter_knowledge_base_id: kbId })
          .then(({ data, error }: any) => {
            if (error) this.logger.error(`KB search failed: ${error.message}`);
            return data || [];
          }),
      );
    }

    const results = await Promise.all(queries);
    const allRows = results.flat();

    // Deduplicate by id, keep highest score
    const seen = new Map<string, any>();
    for (const row of allRows) {
      const existing = seen.get(row.id);
      if (!existing || row.score > existing.score) {
        seen.set(row.id, row);
      }
    }

    const merged = Array.from(seen.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return merged;
  }

  /**
   * Apply simple Pinecone-style filters to RPC params
   */
  private applySimpleFilters(
    filter: Record<string, unknown>,
    rpcParams: Record<string, unknown>,
  ): void {
    // Handle { knowledgeBaseId: { $eq: 'xxx' } }
    if (filter.knowledgeBaseId) {
      const kbFilter = filter.knowledgeBaseId as Record<string, unknown>;
      if (kbFilter.$eq) {
        rpcParams.filter_knowledge_base_id = kbFilter.$eq;
      } else if (kbFilter.$in) {
        rpcParams.filter_kb_ids = kbFilter.$in;
      }
    }

    // Handle { documentId: { $eq: 'xxx' } }
    if (filter.documentId) {
      const docFilter = filter.documentId as Record<string, unknown>;
      if (docFilter.$eq) {
        rpcParams.filter_document_id = docFilter.$eq;
      }
    }

    // Handle { fileId: { $in: [...] } }
    if (filter.fileId) {
      const fileFilter = filter.fileId as Record<string, unknown>;
      if (fileFilter.$in) {
        rpcParams.filter_file_ids = fileFilter.$in;
      }
    }

    // Handle { websiteSourceId: { $in: [...] } }
    if (filter.websiteSourceId) {
      const wsFilter = filter.websiteSourceId as Record<string, unknown>;
      if (wsFilter.$in) {
        rpcParams.filter_ws_ids = wsFilter.$in;
      }
    }
  }

  /**
   * Extract extra metadata fields not covered by dedicated columns
   */
  private extractExtraMetadata(
    metadata: Record<string, unknown>,
  ): Record<string, unknown> {
    const knownKeys = new Set([
      'documentId', 'documentName', 'knowledgeBaseId', 'chunkIndex',
      'fileId', 'fileName', 'websiteSourceId', 'agentId',
      'url', 'title', 'type', 'content',
    ]);

    const extra: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (!knownKeys.has(key) && value !== undefined) {
        extra[key] = value;
      }
    }
    return extra;
  }
}
