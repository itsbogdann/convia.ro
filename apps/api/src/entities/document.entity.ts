import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DocumentSourceType, DocumentStatus } from '@convia/shared-types';
import { KnowledgeBase } from './knowledge-base.entity';
import { Team } from './team.entity';

/**
 * A document is a single source ingested into a knowledge base — a URL,
 * uploaded file, or raw text snippet. Chunking + embedding happens
 * asynchronously after the row is created; status reflects progress.
 */
@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid', { name: 'knowledge_base_id' })
  knowledgeBaseId!: string;

  @Index()
  @Column('uuid', { name: 'team_id' })
  teamId!: string;

  @Column('text')
  name!: string;

  @Column('text', { name: 'source_type' })
  sourceType!: DocumentSourceType;

  @Column('text', { name: 'source_url', nullable: true })
  sourceUrl!: string | null;

  @Column('bigint', { name: 'file_size', nullable: true })
  fileSize!: number | null;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status!: DocumentStatus;

  @Column('text', { name: 'error_message', nullable: true })
  errorMessage!: string | null;

  @Column('text', { name: 'raw_content', nullable: true })
  rawContent!: string | null;

  @Column('integer', { name: 'chunk_count', default: 0 })
  chunkCount!: number;

  @Column('jsonb', { default: () => "'{}'::jsonb" })
  metadata!: DocumentMetadata;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt!: Date | null;

  @ManyToOne(() => KnowledgeBase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'knowledge_base_id' })
  knowledgeBase?: KnowledgeBase;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team?: Team;
}

export interface DocumentMetadata {
  pageCount?: number;
  language?: string;
  wordCount?: number;
  crawledAt?: string;
  /** Hash of the source content; lets us skip re-indexing unchanged sources. */
  contentHash?: string;
  /** For URL sources: extracted title from the page */
  pageTitle?: string;
}
