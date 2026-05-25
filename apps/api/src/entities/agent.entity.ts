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
import { AgentStatus, Industry, WidgetPosition } from '@convia/shared-types';
import { Team } from './team.entity';

/**
 * UI label: "Bot". Code: "agent".
 * Each bot belongs to a single team and can be deployed across multiple
 * channels (web widget, WhatsApp). The api_key is used by the widget for
 * anonymous endpoints (no JWT needed when calling /api/widget/*).
 */
@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid', { name: 'team_id' })
  teamId!: string;

  @Column('text')
  name!: string;

  @Column('text', { nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.DRAFT,
  })
  status!: AgentStatus;

  // Onboarding context — drives default tone, suggested use cases
  @Column('text', { nullable: true })
  industry!: Industry | null;

  @Column('text', { default: 'ro' })
  language!: 'ro' | 'en';

  // AI configuration
  @Column('text', { name: 'system_prompt', nullable: true })
  systemPrompt!: string | null;

  @Column('text', { default: 'gpt-4o-mini' })
  model!: string;

  @Column('decimal', { precision: 3, scale: 2, default: 0.7 })
  temperature!: number;

  @Column('integer', { name: 'max_tokens', default: 1000 })
  maxTokens!: number;

  // Appearance / widget defaults
  @Column('jsonb', {
    default: () =>
      `'${JSON.stringify({
        primaryColor: '#1D4ED8',
        position: WidgetPosition.BOTTOM_RIGHT,
        avatarUrl: null,
        chatTitle: 'Asistent',
        welcomeMessage: 'Salut! Cu ce te ajut?',
        inputPlaceholder: 'Scrie un mesaj...',
        showBranding: true,
      })}'::jsonb`,
  })
  appearance!: AgentAppearance;

  // Security: domains the widget script may load from. Empty = any (dev only).
  @Column('text', {
    name: 'allowed_domains',
    array: true,
    default: () => "'{}'::text[]",
  })
  allowedDomains!: string[];

  // Anonymous API key for widget calls. Treat as semi-secret (per-agent, rotatable).
  @Index({ unique: true })
  @Column('text', { name: 'api_key' })
  apiKey!: string;

  // Lifecycle
  @Column('boolean', { name: 'is_published', default: false })
  isPublished!: boolean;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team?: Team;
}

export interface AgentAppearance {
  primaryColor: string;
  position: WidgetPosition;
  avatarUrl: string | null;
  chatTitle: string;
  welcomeMessage: string;
  inputPlaceholder: string;
  showBranding: boolean;
}
