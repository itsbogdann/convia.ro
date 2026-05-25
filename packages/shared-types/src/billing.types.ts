import { PlanId } from "./enums";
import type { BillingCycle, NotificationKind, SubscriptionStatus } from "./enums";

/** Convia's plan catalog (pricing in RON, all + TVA) */
export interface PlanDescriptor {
  id: PlanId;
  name: string;
  monthlyPriceRon: number;
  yearlyPriceRonPerMonth: number;
  includedConversations: number;
  /** Per-conversation overage cost in RON. 0 for Free (hard-capped). */
  overageRonPerConv: number;
  features: string[];
}

/** Static plan catalog used by the dashboard and onboarding */
export const PLANS: Record<PlanId, PlanDescriptor> = {
  [PlanId.GRATUIT]: {
    id: PlanId.GRATUIT,
    name: "Gratuit",
    monthlyPriceRon: 0,
    yearlyPriceRonPerMonth: 0,
    includedConversations: 100,
    overageRonPerConv: 0,
    features: [
      "1 chatbot",
      "100 conversații pe lună",
      "Conectare site web",
      "Model AI standard",
      "Branding Convia",
      "Suport prin email",
    ],
  },
  [PlanId.BUSINESS]: {
    id: PlanId.BUSINESS,
    name: "Business",
    monthlyPriceRon: 149,
    yearlyPriceRonPerMonth: 119,
    includedConversations: 1000,
    overageRonPerConv: 0.25,
    features: [
      "3 chatboți",
      "1.000 conversații pe lună incluse",
      "Site web + WhatsApp",
      "Modele AI premium (OpenAI și Anthropic)",
      "Branding personalizat",
      "Preluare umană",
      "Suport prioritar în română",
    ],
  },
  [PlanId.PREMIUM]: {
    id: PlanId.PREMIUM,
    name: "Premium",
    monthlyPriceRon: 349,
    yearlyPriceRonPerMonth: 279,
    includedConversations: 5000,
    overageRonPerConv: 0.12,
    features: [
      "Chatboți nelimitați",
      "5.000 conversații pe lună incluse",
      "Toate canalele",
      "Modele AI premium + acces prioritar la modele noi",
      "Statistici avansate",
      "Integrare cu CRM și calendar",
      "Manager de cont dedicat",
    ],
  },
  [PlanId.ENTERPRISE]: {
    id: PlanId.ENTERPRISE,
    name: "Enterprise",
    monthlyPriceRon: 0, // custom
    yearlyPriceRonPerMonth: 0,
    includedConversations: 0, // unlimited / negotiated
    overageRonPerConv: 0,
    features: [
      "Conversații nelimitate",
      "Chatboți nelimitați",
      "DPA semnabil",
      "SLA garantat",
      "Onboarding cu echipa noastră",
      "Integrări custom",
    ],
  },
};

export interface Subscription {
  id: string;
  teamId: string;
  plan: PlanId;
  cycle: BillingCycle;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionItemId: string | null;
  stripeMeterId: string | null;
  stripePriceId: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsagePeriod {
  id: string;
  teamId: string;
  plan: PlanId;
  periodStart: string;
  periodEnd: string;
  includedConversations: number;
  usedConversations: number;
  overageConversations: number;
  overagePushedToStripe: number;
  lastPushedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Shape returned by GET /teams/:id/usage — drives the dashboard usage card */
export interface CurrentUsage {
  teamId: string;
  plan: PlanId;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usagePeriodId: string | null;
  includedConversations: number;
  usedConversations: number;
  overageConversations: number;
  /** 0–999 (capped for display) */
  percentUsed: number;
  /** Estimated overage cost in RON if usage continues at current rate */
  estimatedOverageRon: number;
}

export interface NotificationLogEntry {
  id: string;
  teamId: string;
  kind: NotificationKind;
  usagePeriodId: string | null;
  sentToEmail: string;
  sentAt: string;
}
