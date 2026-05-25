import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLog } from '../../entities/notification-log.entity';
import { Subscription } from '../../entities/subscription.entity';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { UsagePeriod } from '../../entities/usage-period.entity';
import { NotificationsService } from './notifications.service';

/**
 * NotificationsModule
 *
 * Runs an hourly cron that scans active usage_periods and sends:
 *   - 80% usage warning (informative)
 *   - 100% reached (free → upgrade CTA, paid → overage notice)
 *   - High overage cost warning (when projected overage > 100 RON / period)
 *
 * Idempotent — UNIQUE(team_id, kind, usage_period_id) in notifications_log
 * prevents duplicate sends within a billing cycle.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationLog,
      Subscription,
      Team,
      TeamMember,
      UsagePeriod,
    ]),
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
