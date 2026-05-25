import type { DocumentSourceType, DocumentStatus } from "./enums";

export interface KnowledgeBase {
  id: string;
  teamId: string;
  agentId: string | null;
  name: string;
  description: string | null;
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  documentCount: number;
  totalChunks: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocument {
  id: string;
  knowledgeBaseId: string;
  teamId: string;
  name: string;
  sourceType: DocumentSourceType;
  sourceUrl: string | null;
  fileSize: number | null;
  status: DocumentStatus;
  errorMessage: string | null;
  rawContent: string | null;
  chunkCount: number;
  metadata: DocumentMetadata;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
}

/** Soft metadata about a document (page count, etc.) */
export interface DocumentMetadata {
  pageCount?: number;
  language?: string;
  wordCount?: number;
  /** For URL-sourced documents, original crawl info */
  crawledAt?: string;
  /** Hash used to detect content changes */
  contentHash?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  knowledgeBaseId: string;
  content: string;
  chunkIndex: number;
  /** Embeddings live in Supabase via pgvector; not returned to clients. */
  metadata: Record<string, unknown>;
  createdAt: string;
}

/** Shape returned by the match_document_chunks() RPC */
export interface ChunkSimilarityMatch {
  id: string;
  documentId: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

/** Payload for uploading a new source to a knowledge base */
export interface CreateDocumentPayload {
  knowledgeBaseId: string;
  sourceType: DocumentSourceType;
  name: string;
  /** Either a URL (for URL/web sources) or a Supabase Storage path (for files) */
  sourceUrl?: string;
  /** Raw text content (for sourceType === RAW_TEXT) */
  content?: string;
}
