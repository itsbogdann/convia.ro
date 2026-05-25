import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from '../../entities/agent.entity';
import { KnowledgeBase } from '../../entities/knowledge-base.entity';
import { Document } from '../../entities/document.entity';
import { DocumentChunk } from '../../entities/document-chunk.entity';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';

/**
 * KnowledgeBaseModule
 *
 * Owns the RAG pipeline: source ingestion → chunking → OpenAI embeddings →
 * pgvector storage → similarity search.
 *
 * MVP supports two source types out of the box:
 *   - `url`       → fetch a single page, extract main text, chunk + embed
 *   - `raw_text`  → user-pasted text, chunk + embed directly
 *
 * File uploads (PDF / DOCX / XLSX / CSV) come in a follow-up that runs the
 * upload through Supabase Storage + a parser before calling addDocument.
 *
 * Endpoints (all team-scoped under /api/teams/:teamId/agents/:agentId):
 *   GET    /knowledge-base
 *   PATCH  /knowledge-base                                      (developer+)
 *
 *   GET    /knowledge-base/documents
 *   POST   /knowledge-base/documents                            (developer+)
 *   GET    /knowledge-base/documents/:documentId
 *   POST   /knowledge-base/documents/:documentId/reindex        (developer+)
 *   DELETE /knowledge-base/documents/:documentId                (developer+)
 *
 *   GET    /knowledge-base/search?q=...                         (developer+)
 *           → debug endpoint for similarity search
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Agent, KnowledgeBase, Document, DocumentChunk]),
  ],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
