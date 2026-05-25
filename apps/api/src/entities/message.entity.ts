import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageContentType, MessageSender } from '@convia/shared-types';
import { Conversation } from './conversation.entity';
import { Profile } from './profile.entity';

/**
 * Single chat message. Belongs to a conversation. The order is by created_at
 * (ASC). A Postgres trigger increments the parent conversation's
 * message_count + last_activity_at on insert.
 */
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid', { name: 'conversation_id' })
  conversationId!: string;

  @Column({ type: 'enum', enum: MessageSender })
  sender!: MessageSender;

  /** Profile UUID when sender === HUMAN_AGENT */
  @Column('uuid', { name: 'sender_id', nullable: true })
  senderId!: string | null;

  @Column({
    type: 'enum',
    enum: MessageContentType,
    name: 'content_type',
    default: MessageContentType.TEXT,
  })
  contentType!: MessageContentType;

  @Column('text')
  content!: string;

  // LLM provenance (assistant messages only)
  @Column('text', { nullable: true })
  model!: string | null;

  @Column('integer', { name: 'tokens_used', nullable: true })
  tokensUsed!: number | null;

  // Reserved for future structured payloads (tool calls, interactive UI)
  @Column('text', { name: 'tool_name', nullable: true })
  toolName!: string | null;

  @Column('jsonb', { name: 'tool_result', nullable: true })
  toolResult!: Record<string, unknown> | null;

  @Column('jsonb', { name: 'ui_component', nullable: true })
  uiComponent!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index()
  createdAt!: Date;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt!: Date | null;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt!: Date | null;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation?: Conversation;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'sender_id' })
  senderProfile?: Profile;
}
