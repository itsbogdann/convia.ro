import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from './document.entity';
import { KnowledgeBase } from './knowledge-base.entity';

/**
 * One chunk of a document — the unit that gets embedded and searched.
 *
 * The `embedding` column is `vector(1536)` (pgvector) for OpenAI's
 * text-embedding-3-small. TypeORM doesn't know about pgvector, so we
 * declare it as `unknown` and treat it as a raw string when writing
 * (formatted as `[0.123, -0.456, ...]`).
 *
 * Reads typically go through the `match_document_chunks()` SQL function,
 * which returns the similarity score and never the raw embedding — so
 * client code rarely needs to deserialize the vector.
 */
@Entity('document_chunks')
export class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid', { name: 'document_id' })
  documentId!: string;

  @Index()
  @Column('uuid', { name: 'knowledge_base_id' })
  knowledgeBaseId!: string;

  @Column('text')
  content!: string;

  @Column('integer', { name: 'chunk_index' })
  chunkIndex!: number;

  /**
   * pgvector(1536) — not selectable as a TypeORM column type out of the box.
   * Stored as the pgvector literal `[0.1, 0.2, ...]`. TypeORM's `select: false`
   * keeps it out of normal SELECT queries; we hit it via raw SQL/RPC only.
   */
  @Column('text', { nullable: true, select: false })
  embedding!: string | null;

  @Column('jsonb', { default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document?: Document;

  @ManyToOne(() => KnowledgeBase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'knowledge_base_id' })
  knowledgeBase?: KnowledgeBase;
}
