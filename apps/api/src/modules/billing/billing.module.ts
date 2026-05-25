import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingEventLog } from '../../entities/billing-event-log.entity';
import { Profile } from '../../entities/profile.entity';
import { Subscription } from '../../entities/subscription.entity';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { UsagePeriod } from '../../entities/usage-period.entity';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

/**
 * BillingModule
 *
 *   GET  /api/teams/:teamId/billing/subscription   (admin+)
 *   GET  /api/teams/:teamId/billing/usage          (any member)
 *   POST /api/teams/:teamId/billing/checkout       (owner)
 *   POST /api/teams/:teamId/billing/portal         (owner)
 *   POST /api/billing/webhooks/stripe              (public, signature-verified)
 *
 * Daily cron at 02:00 pushes accumulated overage to Stripe Meters API for
 * subscriptions on Business / Premium plans.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      BillingEventLog,
      Profile,
      Subscription,
      Team,
      TeamMember,
      UsagePeriod,
    ]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService, TypeOrmModule],
})
export class BillingModule {}
