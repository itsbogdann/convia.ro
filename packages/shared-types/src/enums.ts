/**
 * Convia — Enums
 *
 * These string enums match the PostgreSQL ENUMs and CHECK constraints
 * defined in supabase/migrations/001_bootstrap.sql + 003_billing.sql.
 * Keep them in sync.
 */

/**
 * Team member roles. 4 fixed values.
 * Hierarchy: OWNER > ADMIN > DEVELOPER > HUMAN_AGENT.
 * HUMAN_AGENT is scoped to specific bots via team_members.assigned_agent_ids.
 */
export enum TeamRole {
  /** Full access including billing and team deletion */
  OWNER = "owner",
  /** Full access except billing + team deletion */
  ADMIN = "admin",
  /** Manage bots, knowledge bases, settings; no team management */
  DEVELOPER = "developer",
  /** Inbox-only access, scoped to assigned bots */
  HUMAN_AGENT = "human_agent",
}

/** Bot lifecycle status */
export enum AgentStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  ARCHIVED = "archived",
}

/** Channel deployment surface for a bot */
export enum ChannelType {
  WEB = "web",
  WHATSAPP = "whatsapp",
}

/** Health of a channel connection */
export enum ChannelStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  ERROR = "error",
}

/** Who sent a message */
export enum MessageSender {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
  HUMAN_AGENT = "human_agent",
}

/** Message content payload type */
export enum MessageContentType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  TOOL_RESULT = "tool_result",
  UI_COMPONENT = "ui_component",
}

/** Conversation lifecycle status */
export enum ConversationStatus {
  ACTIVE = "active",
  WAITING = "waiting",
  HUMAN_TAKEOVER = "human_takeover",
  ENDED = "ended",
  ARCHIVED = "archived",
}

/** Document indexing status */
export enum DocumentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

/** Source type for documents */
export enum DocumentSourceType {
  PDF = "pdf",
  DOCX = "docx",
  XLSX = "xlsx",
  CSV = "csv",
  TXT = "txt",
  MD = "md",
  URL = "url",
  RAW_TEXT = "raw_text",
}

/** Subscription plan identifier */
export enum PlanId {
  GRATUIT = "gratuit",
  BUSINESS = "business",
  PREMIUM = "premium",
  ENTERPRISE = "enterprise",
}

/** Billing cycle for paid plans */
export enum BillingCycle {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

/** Stripe subscription status (mirrors Stripe's `status` field) */
export enum SubscriptionStatus {
  TRIALING = "trialing",
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  UNPAID = "unpaid",
}

/** Kind of usage notification we send to admins */
export enum NotificationKind {
  USAGE_80_PERCENT = "usage_80_percent",
  USAGE_100_PERCENT_FREE = "usage_100_percent_free",
  USAGE_100_PERCENT_PAID = "usage_100_percent_paid",
  HIGH_OVERAGE_WARNING = "high_overage_warning",
}

/** Widget position on the host page */
export enum WidgetPosition {
  BOTTOM_RIGHT = "bottom-right",
  BOTTOM_LEFT = "bottom-left",
  TOP_RIGHT = "top-right",
  TOP_LEFT = "top-left",
}

/** Industry preset used during onboarding to tailor defaults */
export enum Industry {
  HOTEL = "hotel",
  RESTAURANT = "restaurant",
  ECOMMERCE = "ecommerce",
  SERVICII = "servicii",
  OTHER = "other",
}
