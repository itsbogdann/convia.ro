import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationKind, PlanId, TeamRole } from '@convia/shared-types';
import { NotificationLog } from '../../entities/notification-log.entity';
import { Subscription } from '../../entities/subscription.entity';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { UsagePeriod } from '../../entities/usage-period.entity';

const OVERAGE_RATE: Record<PlanId, number> = {
  [PlanId.GRATUIT]: 0,
  [PlanId.BUSINESS]: 0.25,
  [PlanId.PREMIUM]: 0.12,
  [PlanId.ENTERPRISE]: 0,
};

const HIGH_OVERAGE_THRESHOLD_RON = 100;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly fromEmail: string;

  constructor(
    @InjectRepository(NotificationLog)
    private readonly logs: Repository<NotificationLog>,
    @InjectRepository(UsagePeriod)
    private readonly periods: Repository<UsagePeriod>,
    @InjectRepository(Subscription)
    private readonly subscriptions: Repository<Subscription>,
    @InjectRepository(Team)
    private readonly teams: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly members: Repository<TeamMember>,
    config: ConfigService,
  ) {
    this.fromEmail = config.get<string>('email.fromEmail') || 'salut@convia.ro';
  }

  /**
   * Hourly cron: scan active usage periods and send the right notifications.
   * Idempotent — the (team_id, kind, usage_period_id) unique key in
   * notifications_log makes duplicate sends impossible.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkUsageAlerts(): Promise<void> {
    this.logger.debug('Running usage-alerts scan');

    const active = await this.periods
      .createQueryBuilder('up')
      .where('up.period_end > NOW()')
      .andWhere('up.period_start <= NOW()')
      .andWhere('up.used_conversations > 0')
      .getMany();

    for (const period of active) {
      try {
        await this.evaluate(period);
      } catch (err) {
        this.logger.error(
          `Failed evaluating usage alerts for team=${period.teamId}: ${
            err instanceof Error ? err.message : err
          }`,
        );
      }
    }
  }

  private async evaluate(period: UsagePeriod): Promise<void> {
    const sub = await this.subscriptions.findOne({
      where: { teamId: period.teamId },
    });
    if (!sub) return;

    const ratio =
      period.includedConversations > 0
        ? period.usedConversations / period.includedConversations
        : 0;

    // 80% notification — informative
    if (ratio >= 0.8 && ratio < 1) {
      await this.maybeSend(
        period,
        NotificationKind.USAGE_80_PERCENT,
        `Ești la ${Math.round(ratio * 100)}% din conversațiile incluse luna asta`,
      );
    }

    // 100% reached — different message for free vs paid
    if (ratio >= 1 && sub.plan === PlanId.GRATUIT) {
      await this.maybeSend(
        period,
        NotificationKind.USAGE_100_PERCENT_FREE,
        'Botul a atins limita lunară de 100 conversații. Treci pe Business pentru mai mult.',
      );
    } else if (ratio >= 1) {
      await this.maybeSend(
        period,
        NotificationKind.USAGE_100_PERCENT_PAID,
        'Ai depășit conversațiile incluse. Conversațiile suplimentare se taxează automat.',
      );
    }

    // Bill-shock prevention
    const estimatedOverageRon =
      period.overageConversations * OVERAGE_RATE[sub.plan];
    if (estimatedOverageRon >= HIGH_OVERAGE_THRESHOLD_RON) {
      await this.maybeSend(
        period,
        NotificationKind.HIGH_OVERAGE_WARNING,
        `Cost estimat pentru conversații suplimentare luna asta: ${estimatedOverageRon.toFixed(
          2,
        )} RON.`,
      );
    }
  }

  private async maybeSend(
    period: UsagePeriod,
    kind: NotificationKind,
    summary: string,
  ): Promise<void> {
    const recipients = await this.getRecipients(period.teamId);
    if (recipients.length === 0) return;

    // Single row per (team, kind, period) — sending to multiple admins still
    // creates one log entry; we use the first recipient as the "anchor".
    const anchor = recipients[0];
    try {
      await this.logs.insert({
        teamId: period.teamId,
        kind,
        usagePeriodId: period.id,
        sentToEmail: anchor,
      });
    } catch (err) {
      // Unique constraint violation = already sent this period
      return;
    }

    for (const email of recipients) {
      await this.sendEmail(email, kind, summary, period);
    }

    this.logger.log(
      `Sent ${kind} to ${recipients.length} recipient(s) for team=${period.teamId}`,
    );
  }

  private async getRecipients(teamId: string): Promise<string[]> {
    const owners = await this.members
      .createQueryBuilder('m')
      .innerJoin('m.user', 'p')
      .select('p.email', 'email')
      .where('m.team_id = :teamId', { teamId })
      .andWhere('m.role IN (:...roles)', {
        roles: [TeamRole.OWNER, TeamRole.ADMIN],
      })
      .andWhere('m.accepted_at IS NOT NULL')
      .getRawMany();
    return owners.map((o) => o.email).filter(Boolean);
  }

  /**
   * Placeholder for the email send. Wiring an actual provider (Supabase
   * Edge Function with an SMTP backend, or a transactional email provider)
   * happens later — for MVP we log + record into notifications_log so we
   * can verify the cron logic without burning email quotas.
   */
  private async sendEmail(
    to: string,
    kind: NotificationKind,
    summary: string,
    period: UsagePeriod,
  ): Promise<void> {
    this.logger.log(
      `[email:${kind}] to=${to} from=${this.fromEmail} team=${period.teamId} :: ${summary}`,
    );
    // TODO: wire actual delivery via Supabase Edge / Resend / SendGrid here
  }
}
