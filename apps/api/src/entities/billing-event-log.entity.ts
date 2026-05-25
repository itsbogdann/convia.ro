import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from './team.entity';

/**
 * Audit log for Stripe webhook events we've processed. The UNIQUE constraint
 * on `stripe_event_id` makes webhook handling idempotent — Stripe retries are
 * silently no-ops after the first successful processing.
 */
@Entity('billing_events_log')
export class BillingEventLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid', { name: 'team_id', nullable: true })
  teamId!: string | null;

  @Index({ unique: true })
  @Column('text', { name: 'stripe_event_id' })
  stripeEventId!: string;

  @Index()
  @Column('text', { name: 'event_type' })
  eventType!: string;

  @Column('jsonb')
  payload!: Record<string, unknown>;

  @CreateDateColumn({ name: 'processed_at', type: 'timestamptz' })
  processedAt!: Date;

  @Column('text', { name: 'error_message', nullable: true })
  errorMessage!: string | null;

  @ManyToOne(() => Team, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'team_id' })
  team?: Team;
}
