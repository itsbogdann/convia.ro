-- ============================================================================
-- CONVIA — BILLING SCHEMA
-- ============================================================================
-- File 3 of 3. Run AFTER 002_rls.sql.
--
-- Billing model:
--   - Free plan: hard cap at 100 conversations/month, bot stops responding
--   - Business plan: 1.000 conv/mo included + 0,25 RON per overage conv
--   - Premium plan:  5.000 conv/mo included + 0,12 RON per overage conv
--
-- Stripe handles the math via Meters + graduated pricing. We push usage
-- daily via a cron job. See lib/billing in the API codebase.
-- ============================================================================

-- ─── Enums ──────────────────────────────────────────────────────────────────
CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid'
);

CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');

CREATE TYPE notification_kind AS ENUM (
  'usage_80_percent',
  'usage_100_percent_free',
  'usage_100_percent_paid',
  'high_overage_warning'
);

-- ─── subscriptions ──────────────────────────────────────────────────────────
-- One row per team. Free plan teams also get a row (Stripe fields NULL).
CREATE TABLE subscriptions (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id                     UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  -- Plan & billing cycle
  plan                        TEXT NOT NULL CHECK (plan IN ('gratuit', 'business', 'premium', 'enterprise')),
  cycle                       billing_cycle NOT NULL DEFAULT 'monthly',
  status                      subscription_status NOT NULL DEFAULT 'active',
  -- Stripe references (NULL for free plan)
  stripe_customer_id          TEXT,
  stripe_subscription_id      TEXT UNIQUE,
  stripe_subscription_item_id TEXT,   -- The flat-fee subscription item (price for base)
  stripe_meter_id             TEXT,   -- The meter for overage events
  stripe_price_id             TEXT,
  -- Period tracking (sync from Stripe via webhook)
  current_period_start        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  cancel_at_period_end        BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at                 TIMESTAMPTZ,
  -- Trial window (if used)
  trial_start                 TIMESTAMPTZ,
  trial_end                   TIMESTAMPTZ,
  -- Timestamps
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_team   ON subscriptions (team_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions (stripe_customer_id);

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── usage_periods ──────────────────────────────────────────────────────────
-- One row per team per billing cycle. Source of truth for billing math.
-- Created at the start of each cycle by the API (or via Stripe webhook).
CREATE TABLE usage_periods (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id                     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  plan                        TEXT NOT NULL,
  period_start                TIMESTAMPTZ NOT NULL,
  period_end                  TIMESTAMPTZ NOT NULL,
  included_conversations      INTEGER NOT NULL,
  used_conversations          INTEGER NOT NULL DEFAULT 0,
  overage_conversations       INTEGER NOT NULL DEFAULT 0,
  overage_pushed_to_stripe    INTEGER NOT NULL DEFAULT 0,
  last_pushed_at              TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, period_start)
);

CREATE INDEX idx_usage_periods_team   ON usage_periods (team_id);
CREATE INDEX idx_usage_periods_period ON usage_periods (period_start, period_end);

CREATE TRIGGER set_usage_periods_updated_at
  BEFORE UPDATE ON usage_periods
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── billing_events_log ─────────────────────────────────────────────────────
-- Audit log for Stripe webhook events we've processed.
-- Used to make webhook handling idempotent.
CREATE TABLE billing_events_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id             UUID REFERENCES teams(id) ON DELETE SET NULL,
  stripe_event_id     TEXT UNIQUE NOT NULL,
  event_type          TEXT NOT NULL,
  payload             JSONB NOT NULL,
  processed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error_message       TEXT
);

CREATE INDEX idx_billing_events_team       ON billing_events_log (team_id);
CREATE INDEX idx_billing_events_stripe_id  ON billing_events_log (stripe_event_id);
CREATE INDEX idx_billing_events_type       ON billing_events_log (event_type);
CREATE INDEX idx_billing_events_processed  ON billing_events_log (processed_at DESC);

-- ─── notifications_log ──────────────────────────────────────────────────────
-- One row per usage-notification sent. Prevents duplicate emails per period.
CREATE TABLE notifications_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  kind            notification_kind NOT NULL,
  usage_period_id UUID REFERENCES usage_periods(id) ON DELETE CASCADE,
  sent_to_email   TEXT NOT NULL,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, kind, usage_period_id)
);

CREATE INDEX idx_notifications_team ON notifications_log (team_id);
CREATE INDEX idx_notifications_kind ON notifications_log (kind);

-- ─── Convenience view: current period per team ─────────────────────────────
CREATE OR REPLACE VIEW current_usage AS
SELECT
  s.team_id,
  s.plan,
  s.status                                                AS subscription_status,
  s.current_period_start,
  s.current_period_end,
  up.id                                                   AS usage_period_id,
  COALESCE(up.included_conversations, 0)                  AS included_conversations,
  COALESCE(up.used_conversations, 0)                      AS used_conversations,
  COALESCE(up.overage_conversations, 0)                   AS overage_conversations,
  -- Percent used of the included amount (capped at 999 for display)
  CASE
    WHEN COALESCE(up.included_conversations, 0) > 0
      THEN LEAST(999, ROUND(100.0 * up.used_conversations / up.included_conversations))
    ELSE 0
  END                                                     AS percent_used
FROM subscriptions s
LEFT JOIN usage_periods up
  ON up.team_id = s.team_id
  AND up.period_start = s.current_period_start;

-- ─── RLS for billing tables ────────────────────────────────────────────────
ALTER TABLE subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_periods       ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log   ENABLE ROW LEVEL SECURITY;

-- Only admins+ can see subscription details. Owner can update via Stripe Customer Portal.
CREATE POLICY subs_admin_read ON subscriptions FOR SELECT TO authenticated
  USING (has_team_role(team_id, 'admin'));

-- Usage data is visible to all team members (so devs can see if they're near the cap).
CREATE POLICY usage_member_read ON usage_periods FOR SELECT TO authenticated
  USING (is_team_member(team_id));

-- Events log: admins only, read-only.
CREATE POLICY events_admin_read ON billing_events_log FOR SELECT TO authenticated
  USING (team_id IS NULL OR has_team_role(team_id, 'admin'));

-- Notifications log: admins only, read-only.
CREATE POLICY notifications_admin_read ON notifications_log FOR SELECT TO authenticated
  USING (has_team_role(team_id, 'admin'));

-- ─── Bootstrap a Free subscription when a team is created ──────────────────
CREATE OR REPLACE FUNCTION on_team_insert_create_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (
    team_id, plan, cycle, status,
    current_period_start, current_period_end
  ) VALUES (
    NEW.id, 'gratuit', 'monthly', 'active',
    NOW(), NOW() + INTERVAL '1 month'
  );

  INSERT INTO usage_periods (
    team_id, plan, period_start, period_end, included_conversations
  ) VALUES (
    NEW.id, 'gratuit', NOW(), NOW() + INTERVAL '1 month', 100
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_team_insert_subscription_trg
  AFTER INSERT ON teams
  FOR EACH ROW EXECUTE FUNCTION on_team_insert_create_subscription();

-- ─── Comments ──────────────────────────────────────────────────────────────
COMMENT ON TABLE subscriptions      IS 'One row per team. Tracks Stripe subscription state for paid plans.';
COMMENT ON TABLE usage_periods      IS 'Per-team, per-billing-cycle conversation counters. Source of truth for billing.';
COMMENT ON TABLE billing_events_log IS 'Idempotency log of processed Stripe webhook events.';
COMMENT ON TABLE notifications_log  IS 'One row per usage notification sent (80%, 100%, etc.). Prevents duplicates.';
COMMENT ON VIEW  current_usage      IS 'Convenience view joining subscription + current usage_period per team.';
