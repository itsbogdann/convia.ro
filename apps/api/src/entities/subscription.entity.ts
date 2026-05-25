import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BillingCycle, PlanId, SubscriptionStatus } from '@convia/shared-types';
import { Team } from './team.entity';

/**
 * One row per team. Free-plan teams have a row too (Stripe fields NULL);
 * the row is auto-created by the `on_team_insert_create_subscription`
 * Postgres trigger.
 */
@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column('uuid', { name: 'team_id' })
  teamId!: string;

  @Column('text', { default: PlanId.GRATUIT })
  plan!: PlanId;

  @Column({ type: 'enum', enum: BillingCycle, default: BillingCycle.MONTHLY })
  cycle!: BillingCycle;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  // Stripe references (NULL for free plan)
  @Index()
  @Column('text', { name: 'stripe_customer_id', nullable: true })
  stripeCustomerId!: string | null;

  @Index({ unique: true })
  @Column('text', { name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId!: string | null;

  @Column('text', { name: 'stripe_subscription_item_id', nullable: true })
  stripeSubscriptionItemId!: string | null;

  @Column('text', { name: 'stripe_meter_id', nullable: true })
  stripeMeterId!: string | null;

  @Column('text', { name: 'stripe_price_id', nullable: true })
  stripePriceId!: string | null;

  // Period tracking (sync from Stripe webhooks)
  @Column({ name: 'current_period_start', type: 'timestamptz', default: () => 'NOW()' })
  currentPeriodStart!: Date;

  @Column({ name: 'current_period_end', type: 'timestamptz', default: () => "NOW() + INTERVAL '1 month'" })
  currentPeriodEnd!: Date;

  @Column('boolean', { name: 'cancel_at_period_end', default: false })
  cancelAtPeriodEnd!: boolean;

  @Column({ name: 'canceled_at', type: 'timestamptz', nullable: true })
  canceledAt!: Date | null;

  @Column({ name: 'trial_start', type: 'timestamptz', nullable: true })
  trialStart!: Date | null;

  @Column({ name: 'trial_end', type: 'timestamptz', nullable: true })
  trialEnd!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team?: Team;
}
