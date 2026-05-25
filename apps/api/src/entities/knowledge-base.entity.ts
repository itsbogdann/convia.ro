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
import { Agent } from './agent.entity';
import { Team } from './team.entity';

/**
 * A knowledge base groups documents for an agent. Convia MVP creates exactly
 * one KB per agent (auto-created when the first document is added). The schema
 * supports multiple KBs per agent for future use.
 */
@Entity('knowledge_bases')
export class KnowledgeBase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid', { name: 'team_id' })
  teamId!: string;

  @Index()
  @Column('uuid', { name: 'agent_id', nullable: true })
  agentId!: string | null;

  @Column('text')
  name!: string;

  @Column('text', { nullable: true })
  description!: string | null;

  @Column('text', { name: 'embedding_model', default: 'text-embedding-3-small' })
  embeddingModel!: string;

  @Column('integer', { name: 'chunk_size', default: 1000 })
  chunkSize!: number;

  @Column('integer', { name: 'chunk_overlap', default: 200 })
  chunkOverlap!: number;

  @Column('integer', { name: 'document_count', default: 0 })
  documentCount!: number;

  @Column('integer', { name: 'total_chunks', default: 0 })
  totalChunks!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team?: Team;

  @ManyToOne(() => Agent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent?: Agent;
}
