import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ConversationStatus } from '@convia/shared-types';
import { Agent } from './agent.entity';
import { Channel } from './channel.entity';
import { Profile } from './profile.entity';
import { Team } from './team.entity';

/**
 * One conversation = one session.
 *
 * A "session" is a continuous burst of activity by a single visitor.
 * When the visitor's last_activity_at is older than CONVERSATION_SESSION_TIMEOUT_MINUTES
 * (default 30 min), the next incoming message starts a new conversation row.
 *
 * The unique(agentId, sessionId) constraint guarantees idempotency on retries
 * from the widget while a session is still warm.
 */
@Entity('conversations')
@Unique(['agentId', 'sessionId'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid', { name: 'agent_id' })
  agentId!: string;

  @Index()
  @Column('uuid', { name: 'team_id' })
  teamId!: string;

  @Column('uuid', { name: 'channel_id', nullable: true })
  channelId!: string | null;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.ACTIVE,
  })
  status!: ConversationStatus;

  @Index()
  @Column('text', { name: 'visitor_id' })
  visitorId!: string;

  @Column('jsonb', { name: 'visitor_metadata', default: () => "'{}'::jsonb" })
  visitorMetadata!: Record<string, unknown>;

  @Column('text', { name: 'session_id' })
  sessionId!: string;

  @Index()
  @Column({ name: 'last_activity_at', type: 'timestamptz', default: () => 'NOW()' })
  lastActivityAt!: Date;

  // Takeover state
  @Column('uuid', { name: 'assigned_to', nullable: true })
  assignedTo!: string | null;

  @Column({ name: 'taken_over_at', type: 'timestamptz', nullable: true })
  takenOverAt!: Date | null;

  // Conversation-scoped variables (extracted during chat) + context
  @Column('jsonb', { default: () => "'{}'::jsonb" })
  variables!: Record<string, unknown>;

  @Column('jsonb', { default: () => "'{}'::jsonb" })
  context!: Record<string, unknown>;

  @Column('integer', { name: 'message_count', default: 0 })
  messageCount!: number;

  // Source — drives some UI display and analytics
  @Column('text', { default: 'web' })
  source!: 'web' | 'whatsapp' | 'api' | 'test';

  @Column('text', { name: 'source_url', nullable: true })
  sourceUrl!: string | null;

  // Billing flag: TRUE if this conversation was billed as overage (team was
  // over their included monthly cap when it was created).
  @Index()
  @Column('boolean', { name: 'is_overage', default: false })
  isOverage!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt!: Date | null;

  @ManyToOne(() => Agent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent?: Agent;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team?: Team;

  @ManyToOne(() => Channel, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'channel_id' })
  channel?: Channel;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'assigned_to' })
  assignedToUser?: Profile;
}
