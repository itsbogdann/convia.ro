import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone, Index } from '@pinecone-database/pinecone';

/**
 * Chunk data for upserting to Pinecone
 * Supports both legacy knowledge base format and new file/website format
 */
export interface ChunkData {
  id: string;
  content: string;
  metadata: {
    // Legacy fields (for backward compatibility with knowledge bases)
    documentId?: string;
    documentName?: string;
    knowledgeBaseId?: string;
    chunkIndex?: number;
    // New fields for files
    fileId?: string;
    fileName?: string;
    // New fields for websites
    websiteSourceId?: string;
    agentId?: string;
    url?: string;
    title?: string;
    // Type discriminator
    type?: 'knowledge_base' | 'file' | 'website';
    [key: string]: unknown;
  };
}

/**
 * Search result from Pinecone
 */
export interface VectorSearchResult {
  id: string;
  score: number;
  content: string;
  metadata: {
    // Legacy fields (for backward compatibility)
    documentId?: string;
    documentName?: string;
    knowledgeBaseId?: string;
    chunkIndex?: number;
    // New fields for files
    fileId?: string;
    fileName?: string;
    // New fields for websites
    websiteSourceId?: string;
    agentId?: string;
    url?: string;
    title?: string;
    // Type discriminator
    type?: 'knowledge_base' | 'file' | 'website';
    [key: string]: unknown;
  };
}

/**
 * Pinecone Service
 *
 * Handles vector operations using Pinecone's integrated embeddings.
 * Uses llama-text-embed-v2 model hosted by Pinecone for embeddings.
 *
 * Key features:
 * - Upsert document chunks with automatic embedding
 * - Semantic search across knowledge bases
 * - Delete vectors when documents are removed
 */
@Injectable()
export class PineconeService implements OnModuleInit {
  private client: Pinecone | null = null;
  private index: Index | null = null;
  private readonly logger = new Logger(PineconeService.name);
  private _isConfigured = false;

  constructor(private configService: ConfigService) {}

  /**
   * Check if Pinecone is properly configured and ready
   */
  get isConfigured(): boolean {
    return this._isConfigured;
  }

  async onModuleInit() {
    const apiKey = this.configService.get<string>('pinecone.apiKey');
    const host = this.configService.get<string>('pinecone.host');

    if (!apiKey || !host) {
      this.logger.warn(
        'Pinecone not configured - vector search will be disabled. ' +
          'Set PINECONE_API_KEY and PINECONE_HOST to enable.',
      );
      return;
    }

    try {
      this.client = new Pinecone({ apiKey });

      // Connect to the index using the host URL
      this.index = this.client.index(
        this.configService.get<string>('pinecone.indexName') || 'loopreply',
        host,
      );

      // Test connection by describing index stats
      const stats = await this.index.describeIndexStats();
      this.logger.log(
        `Pinecone connected! Index has ${stats.totalRecordCount} vectors`,
      );
      this._isConfigured = true;
    } catch (error) {
      this.logger.error('Failed to initialize Pinecone:', error.message);
    }
  }

  /**
   * Check if Pinecone is configured and ready
   */
  isReady(): boolean {
    return this.isConfigured && this.index !== null;
  }

  /**
   * Upsert document chunks to Pinecone
   * Uses integrated embeddings - just send text, Pinecone handles embedding
   */
  async upsertChunks(
    chunks: ChunkData[],
    namespace?: string,
  ): Promise<{ upsertedCount: number }> {
    if (!this.isReady()) {
      this.logger.warn('Pinecone not configured, skipping upsert');
      return { upsertedCount: 0 };
    }

    try {
      // Process in batches to avoid Pinecone's request size limits.
      // Each batch: embed texts → combine with metadata → upsert vectors.
      const batchSize = 96;
      let upsertedCount = 0;

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);

        const records = batch.map((chunk) => ({
          id: chunk.id,
          metadata: {
            ...chunk.metadata,
            content: chunk.content,
          },
        }));

        const texts = batch.map((chunk) => chunk.content);

        const embeddings = await this.client!.inference.embed(
          'llama-text-embed-v2',
          texts,
          { inputType: 'passage' },
        );

        const vectorRecords = records.map((record, j) => {
          const embedding = embeddings.data[j];
          const values = 'values' in embedding ? embedding.values : [];
          return {
            id: record.id,
            values: values as number[],
            metadata: record.metadata,
          };
        });

        const ns = namespace
          ? this.index!.namespace(namespace)
          : this.index!;

        await ns.upsert(vectorRecords);
        upsertedCount += vectorRecords.length;

        if (chunks.length > batchSize) {
          this.logger.log(`Pinecone progress: ${upsertedCount}/${chunks.length} vectors`);
        }
      }

      this.logger.log(`Upserted ${upsertedCount} vectors to Pinecone`);
      return { upsertedCount };
    } catch (error) {
      this.logger.error('Failed to upsert chunks:', error.message);
      throw error;
    }
  }

  /**
   * Search for similar chunks using semantic search
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
    if (!this.isReady()) {
      this.logger.warn('Pinecone not configured, returning empty results');
      return [];
    }

    const { knowledgeBaseIds, filter: customFilter, limit = 5, namespace, minScore = 0.5 } = options;

    try {
      // Embed the query using Pinecone's inference API
      const queryEmbedding = await this.client!.inference.embed(
        'llama-text-embed-v2',
        [query],
        { inputType: 'query' }, // 'query' for search queries
      );

      // Build filter - use custom filter if provided, otherwise use knowledgeBaseIds
      let filter: Record<string, unknown> | undefined;
      if (customFilter) {
        filter = customFilter;
      } else if (knowledgeBaseIds?.length) {
        filter = { knowledgeBaseId: { $in: knowledgeBaseIds } };
      }

      // Extract query vector
      const queryEmbed = queryEmbedding.data[0];
      const queryVector = 'values' in queryEmbed ? queryEmbed.values : [];

      // Query the index
      const ns = namespace ? this.index!.namespace(namespace) : this.index!;

      const results = await ns.query({
        vector: queryVector as number[],
        topK: limit,
        filter,
        includeMetadata: true,
      });

      // Transform results
      return (results.matches || [])
        .filter((match) => (match.score || 0) >= minScore)
        .map((match) => ({
          id: match.id,
          score: match.score || 0,
          content: (match.metadata?.content as string) || '',
          metadata: {
            documentId: (match.metadata?.documentId as string) || '',
            documentName: (match.metadata?.documentName as string) || '',
            knowledgeBaseId: (match.metadata?.knowledgeBaseId as string) || '',
            chunkIndex: (match.metadata?.chunkIndex as number) || 0,
            ...match.metadata,
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
    if (!this.isReady()) {
      this.logger.warn('Pinecone not configured, skipping delete');
      return;
    }

    try {
      const ns = namespace ? this.index!.namespace(namespace) : this.index!;

      // Delete in batches of 1000 (Pinecone limit)
      const batchSize = 1000;
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        await ns.deleteMany(batch);
      }

      this.logger.log(`Deleted ${ids.length} vectors from Pinecone`);
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
    if (!this.isReady()) {
      this.logger.warn('Pinecone not configured, skipping delete');
      return;
    }

    try {
      const ns = namespace ? this.index!.namespace(namespace) : this.index!;

      // Delete by filter
      await ns.deleteMany({
        filter: { knowledgeBaseId: { $eq: knowledgeBaseId } },
      });

      this.logger.log(
        `Deleted all vectors for knowledge base ${knowledgeBaseId}`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to delete vectors for knowledge base:',
        error.message,
      );
    }
  }

  /**
   * Delete all vectors for a document
   */
  async deleteByDocument(
    documentId: string,
    namespace?: string,
  ): Promise<void> {
    if (!this.isReady()) {
      this.logger.warn('Pinecone not configured, skipping delete');
      return;
    }

    try {
      const ns = namespace ? this.index!.namespace(namespace) : this.index!;

      // Delete by filter
      await ns.deleteMany({
        filter: { documentId: { $eq: documentId } },
      });

      this.logger.log(`Deleted all vectors for document ${documentId}`);
    } catch (error) {
      this.logger.error(
        'Failed to delete vectors for document:',
        error.message,
      );
    }
  }

  /**
   * Get index statistics
   */
  async getStats(): Promise<{
    totalVectors: number;
    dimension: number;
  } | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      const stats = await this.index!.describeIndexStats();
      return {
        totalVectors: stats.totalRecordCount || 0,
        dimension: stats.dimension || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get index stats:', error.message);
      return null;
    }
  }
}
