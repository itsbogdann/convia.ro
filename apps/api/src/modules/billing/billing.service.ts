import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type Stripe from 'stripe';
import {
  BillingCycle,
  PlanId,
  SubscriptionStatus,
} from '@convia/shared-types';
import { BillingEventLog } from '../../entities/billing-event-log.entity';
import { Profile } from '../../entities/profile.entity';
import { Subscription } from '../../entities/subscription.entity';
import { Team } from '../../entities/team.entity';
import { TeamMember } from '../../entities/team-member.entity';
import { UsagePeriod } from '../../entities/usage-period.entity';
import { StripeService } from '../../common/services/stripe.service';

export interface CurrentUsageView {
  plan: PlanId;
  cycle: BillingCycle;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  includedConversations: number;
  usedConversations: number;
  overageConversations: number;
  percentUsed: number;
  /** Estimated RON cost in overage so far in the current period. */
  estimatedOverageRon: number;
}

const OVERAGE_RATE_BY_PLAN: Record<PlanId, number> = {
  [PlanId.GRATUIT]: 0,
  [PlanId.BUSINESS]: 0.25,
  [PlanId.PREMIUM]: 0.12,
  [PlanId.ENTERPRISE]: 0,
};

const INCLUDED_BY_PLAN: Record<PlanId, number> = {
  [PlanId.GRATUIT]: 100,
  [PlanId.BUSINESS]: 1_000,
  [PlanId.PREMIUM]: 5_000,
  [PlanId.ENTERPRISE]: 0, // unlimited
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptions: Repository<Subscription>,
    @InjectRepository(UsagePeriod)
    private readonly usagePeriods: Repository<UsagePeriod>,
    @InjectRepository(BillingEventLog)
    private readonly events: Repository<BillingEventLog>,
    @InjectRepository(Team)
    private readonly teams: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly members: Repository<TeamMember>,
    @InjectRepository(Profile)
    private readonly profiles: Repository<Profile>,
    private readonly stripe: StripeService,
    private readonly config: ConfigService,
  ) {}

  // ───────────────────────────────────────────────────────────────────────
  // Public read API (dashboard)
  // ───────────────────────────────────────────────────────────────────────

  async getCurrentUsage(teamId: string): Promise<CurrentUsageView> {
    const sub = await this.subscriptions.findOne({ where: { teamId } });
    if (!sub) throw new NotFoundException('Subscription not found');

    const period = await this.usagePeriods.findOne({
      where: { teamId },
      order: { periodStart: 'DESC' },
    });

    const used = period?.usedConversations ?? 0;
    const overage = period?.overageConversations ?? 0;
    const included = period?.includedConversations ?? INCLUDED_BY_PLAN[sub.plan];

    const percentUsed =
      included > 0
        ? Math.min(999, Math.round((100 * used) / included))
        : 0;

    const estimatedOverageRon = overage * OVERAGE_RATE_BY_PLAN[sub.plan];

    return {
      plan: sub.plan,
      cycle: sub.cycle,
      subscriptionStatus: sub.status,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      includedConversations: included,
      usedConversations: used,
      overageConversations: overage,
      percentUsed,
      estimatedOverageRon: Math.round(estimatedOverageRon * 100) / 100,
    };
  }

  async getSubscription(teamId: string): Promise<Subscription> {
    const sub = await this.subscriptions.findOne({ where: { teamId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  // ───────────────────────────────────────────────────────────────────────
  // Checkout + Portal
  // ───────────────────────────────────────────────────────────────────────

  async createCheckout(
    teamId: string,
    userId: string,
    plan: PlanId,
    cycle: BillingCycle,
  ): Promise<{ url: string }> {
    if (plan === PlanId.GRATUIT || plan === PlanId.ENTERPRISE) {
      throw new BadRequestException(
        `Plan "${plan}" is not self-service. Contact sales for Enterprise; Free is the default for new teams.`,
      );
    }

    const priceId = this.resolvePriceId(plan, cycle);
    if (!priceId) {
      throw new BadRequestException(
        `Stripe price for plan=${plan} cycle=${cycle} is not configured. Run scripts/setup-stripe.ts and update env vars.`,
      );
    }

    const team = await this.teams.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    const user = await this.profiles.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const sub = await this.getOrCreateLocalSubscription(team.id);

    const customer = await this.stripe.getOrCreateCustomer(
      user.email,
      user.fullName || user.email,
      team.id,
      sub.stripeCustomerId || undefined,
    );

    if (sub.stripeCustomerId !== customer.id) {
      sub.stripeCustomerId = customer.id;
      await this.subscriptions.save(sub);
    }

    const session = await this.stripe.createCheckoutSession({
      customerId: customer.id,
      priceId,
      teamId: team.id,
      teamName: team.name,
      email: user.email,
      planId: plan,
      billingCycle: cycle,
    });

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }
    return { url: session.url };
  }

  async createPortalSession(teamId: string): Promise<{ url: string }> {
    const sub = await this.subscriptions.findOne({ where: { teamId } });
    if (!sub?.stripeCustomerId) {
      throw new BadRequestException(
        'No Stripe customer for this team yet. Start a checkout first to register one.',
      );
    }
    const returnUrl =
      this.config.get<string>('urls.web') + '/settings/billing';
    const session = await this.stripe.createBillingPortalSession(
      sub.stripeCustomerId,
      returnUrl,
    );
    if (!session.url) throw new Error('Stripe did not return a portal URL');
    return { url: session.url };
  }

  // ───────────────────────────────────────────────────────────────────────
  // Webhook handler
  // ───────────────────────────────────────────────────────────────────────

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const event = this.stripe.constructWebhookEvent(rawBody, signature);

    // Idempotency: insert into billing_events_log first. If we've seen this
    // event id before, the UNIQUE constraint fails and we bail silently.
    try {
      await this.events.insert({
        stripeEventId: event.id,
        eventType: event.type,
        payload: event.data?.object as any,
        teamId: this.extractTeamIdFromEvent(event),
      });
    } catch (err) {
      this.logger.debug(`Webhook ${event.id} already processed, skipping`);
      return;
    }

    try {
      await this.dispatchEvent(event);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Webhook ${event.id} (${event.type}) failed: ${message}`);
      await this.events.update(
        { stripeEventId: event.id },
        { errorMessage: message.slice(0, 1000) },
      );
      throw err; // let Stripe retry
    }
  }

  private async dispatchEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.onSubscriptionUpsert(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'customer.subscription.deleted':
        await this.onSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'invoice.paid':
        await this.onInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.onInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        this.logger.debug(`Ignoring webhook event ${event.type}`);
    }
  }

  private async onSubscriptionUpsert(s: Stripe.Subscription): Promise<void> {
    const teamId = (s.metadata?.teamId as string) || null;
    if (!teamId) {
      this.logger.warn(`Subscription ${s.id} has no teamId in metadata`);
      return;
    }
    const planId = (s.metadata?.planId as PlanId) || PlanId.BUSINESS;
    const cycle =
      (s.metadata?.billingCycle as BillingCycle) || BillingCycle.MONTHLY;

    const sub = await this.getOrCreateLocalSubscription(teamId);
    sub.plan = planId;
    sub.cycle = cycle;
    sub.status = mapStripeStatus(s.status);
    sub.stripeCustomerId = (s.customer as string) || sub.stripeCustomerId;
    sub.stripeSubscriptionId = s.id;
    sub.cancelAtPeriodEnd = s.cancel_at_period_end;
    sub.canceledAt = s.canceled_at ? new Date(s.canceled_at * 1000) : null;
    sub.currentPeriodStart = new Date(s.current_period_start * 1000);
    sub.currentPeriodEnd = new Date(s.current_period_end * 1000);
    sub.trialStart = s.trial_start ? new Date(s.trial_start * 1000) : null;
    sub.trialEnd = s.trial_end ? new Date(s.trial_end * 1000) : null;

    const flatItem = s.items?.data?.find(
      (i) => !i.price?.recurring || i.price.recurring.usage_type !== 'metered',
    );
    const meteredItem = s.items?.data?.find(
      (i) => i.price?.recurring?.usage_type === 'metered',
    );
    sub.stripeSubscriptionItemId = flatItem?.id || null;
    sub.stripePriceId = flatItem?.price?.id || null;
    sub.stripeMeterId =
      (meteredItem?.price?.metadata?.meter_id as string) || null;

    await this.subscriptions.save(sub);
    await this.ensureUsagePeriod(sub);
  }

  private async onSubscriptionDeleted(s: Stripe.Subscription): Promise<void> {
    const teamId = (s.metadata?.teamId as string) || null;
    if (!teamId) return;
    const sub = await this.subscriptions.findOne({ where: { teamId } });
    if (!sub) return;
    sub.status = SubscriptionStatus.CANCELED;
    sub.canceledAt = new Date();
    sub.plan = PlanId.GRATUIT;
    sub.cycle = BillingCycle.MONTHLY;
    sub.stripeSubscriptionId = null;
    sub.stripeSubscriptionItemId = null;
    sub.stripePriceId = null;
    sub.stripeMeterId = null;
    await this.subscriptions.save(sub);
  }

  private async onInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) return;
    const subId = invoice.subscription as string;
    const sub = await this.subscriptions.findOne({
      where: { stripeSubscriptionId: subId },
    });
    if (!sub) return;
    sub.status = SubscriptionStatus.ACTIVE;
    await this.subscriptions.save(sub);
    // The subscription.updated event handles period rollover; ensure a
    // fresh usage_period exists for the new cycle.
    await this.ensureUsagePeriod(sub);
  }

  private async onInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) return;
    const subId = invoice.subscription as string;
    const sub = await this.subscriptions.findOne({
      where: { stripeSubscriptionId: subId },
    });
    if (!sub) return;
    sub.status = SubscriptionStatus.PAST_DUE;
    await this.subscriptions.save(sub);
  }

  // ───────────────────────────────────────────────────────────────────────
  // Daily cron: push overage usage to Stripe Meters
  // ───────────────────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async pushOverageToStripe(): Promise<void> {
    this.logger.log('Running daily overage push to Stripe');
    const stripe = this.stripe.getStripe();

    const periods = await this.usagePeriods
      .createQueryBuilder('up')
      .innerJoin(Subscription, 's', 's.team_id = up.team_id')
      .where('up.overage_conversations > up.overage_pushed_to_stripe')
      .andWhere("s.plan IN ('business', 'premium')")
      .andWhere('s.stripe_customer_id IS NOT NULL')
      .andWhere('up.period_end > NOW()')
      .getMany();

    for (const period of periods) {
      try {
        const sub = await this.subscriptions.findOne({
          where: { teamId: period.teamId },
        });
        if (!sub?.stripeCustomerId) continue;

        const delta = period.overageConversations - period.overagePushedToStripe;
        if (delta <= 0) continue;

        await stripe.billing.meterEvents.create({
          event_name: 'convia_conversation_overage',
          payload: {
            value: String(delta),
            stripe_customer_id: sub.stripeCustomerId,
            plan: sub.plan,
            team_id: period.teamId,
          },
          timestamp: Math.floor(Date.now() / 1000),
        });

        period.overagePushedToStripe = period.overageConversations;
        period.lastPushedAt = new Date();
        await this.usagePeriods.save(period);

        this.logger.log(
          `Pushed ${delta} overage events for team=${period.teamId} (${sub.plan})`,
        );
      } catch (err) {
        this.logger.error(
          `Failed pushing overage for period=${period.id}: ${
            err instanceof Error ? err.message : err
          }`,
        );
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────────────────────────────

  private async getOrCreateLocalSubscription(teamId: string): Promise<Subscription> {
    let sub = await this.subscriptions.findOne({ where: { teamId } });
    if (!sub) {
      sub = this.subscriptions.create({
        teamId,
        plan: PlanId.GRATUIT,
        cycle: BillingCycle.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      sub = await this.subscriptions.save(sub);
    }
    return sub;
  }

  /**
   * Make sure a usage_period exists for the subscription's current period.
   * Called on subscription upsert + invoice.paid so we never miss a rollover.
   */
  private async ensureUsagePeriod(sub: Subscription): Promise<void> {
    const existing = await this.usagePeriods.findOne({
      where: { teamId: sub.teamId, periodStart: sub.currentPeriodStart },
    });
    if (existing) return;

    await this.usagePeriods.save(
      this.usagePeriods.create({
        teamId: sub.teamId,
        plan: sub.plan,
        periodStart: sub.currentPeriodStart,
        periodEnd: sub.currentPeriodEnd,
        includedConversations: INCLUDED_BY_PLAN[sub.plan] || 0,
        usedConversations: 0,
        overageConversations: 0,
        overagePushedToStripe: 0,
      }),
    );
  }

  private extractTeamIdFromEvent(event: Stripe.Event): string | null {
    const obj = event.data?.object as any;
    return (obj?.metadata?.teamId as string) || null;
  }

  private resolvePriceId(plan: PlanId, cycle: BillingCycle): string | undefined {
    if (plan === PlanId.BUSINESS) {
      return cycle === BillingCycle.YEARLY
        ? this.config.get<string>('stripe.prices.businessYearly')
        : this.config.get<string>('stripe.prices.businessMonthly');
    }
    if (plan === PlanId.PREMIUM) {
      return cycle === BillingCycle.YEARLY
        ? this.config.get<string>('stripe.prices.premiumYearly')
        : this.config.get<string>('stripe.prices.premiumMonthly');
    }
    return undefined;
  }
}

function mapStripeStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
  switch (s) {
    case 'trialing':
      return SubscriptionStatus.TRIALING;
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'canceled':
      return SubscriptionStatus.CANCELED;
    case 'incomplete':
      return SubscriptionStatus.INCOMPLETE;
    case 'incomplete_expired':
      return SubscriptionStatus.INCOMPLETE_EXPIRED;
    case 'unpaid':
      return SubscriptionStatus.UNPAID;
    default:
      return SubscriptionStatus.ACTIVE;
  }
}
