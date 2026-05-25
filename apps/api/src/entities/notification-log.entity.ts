import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { NotificationKind } from '@convia/shared-types';
import { Team } from './team.entity';
import { UsagePeriod } from './usage-period.entity';

/**
 * One row per usage notification sent. UNIQUE constraint on (team, kind,
 * usage_period) prevents sending the same alert twice during a single
 * billing cycle.
 */
@Entity('notifications_log')
@Unique(['teamId', 'kind', 'usagePeriodId'])
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid', { name: 'team_id' })
  teamId!: string;

  @Index()
  @Column({ type: 'enum', enum: NotificationKind })
  kind!: NotificationKind;

  @Column('uuid', { name: 'usage_period_id', nullable: true })
  usagePeriodId!: string | null;

  @Column('text', { name: 'sent_to_email' })
  sentToEmail!: string;

  @CreateDateColumn({ name: 'sent_at', type: 'timestamptz' })
  sentAt!: Date;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team?: Team;

  @ManyToOne(() => UsagePeriod, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usage_period_id' })
  usagePeriod?: UsagePeriod;
}
