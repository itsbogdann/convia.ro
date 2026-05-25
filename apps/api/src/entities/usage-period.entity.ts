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
import { PlanId } from '@convia/shared-types';
import { Team } from './team.entity';

/**
 * One row per team per billing cycle. Drives the usage card in the dashboard
 * and the daily-cron-to-Stripe overage push. Created either:
 *   - by the `on_team_insert_create_subscription` trigger on signup, or
 *   - by the billing service when a Stripe subscription period rolls over.
 */
@Entity('usage_periods')
@Unique(['teamId', 'periodStart'])
export class UsagePeriod {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid', { name: 'team_id' })
  teamId!: string;

  @Column('text')
  plan!: PlanId;

  @Index()
  @Column({ name: 'period_start', type: 'timestamptz' })
  periodStart!: Date;

  @Column({ name: 'period_end', type: 'timestamptz' })
  periodEnd!: Date;

  @Column('integer', { name: 'included_conversations' })
  includedConversations!: number;

  @Column('integer', { name: 'used_conversations', default: 0 })
  usedConversations!: number;

  @Column('integer', { name: 'overage_conversations', default: 0 })
  overageConversations!: number;

  @Column('integer', { name: 'overage_pushed_to_stripe', default: 0 })
  overagePushedToStripe!: number;

  @Column({ name: 'last_pushed_at', type: 'timestamptz', nullable: true })
  lastPushedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team?: Team;
}
