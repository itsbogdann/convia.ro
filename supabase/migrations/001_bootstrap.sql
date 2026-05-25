-- ============================================================================
-- CONVIA — BOOTSTRAP SCHEMA
-- ============================================================================
-- File 1 of 3 (run in this order):
--   001_bootstrap.sql  ← this file: tables, enums, indexes, triggers
--   002_rls.sql        ← Row-Level Security policies
--   003_billing.sql    ← Stripe subscriptions, usage tracking
--
-- Run in Supabase: Dashboard → SQL Editor → New Query → paste → Run.
-- ============================================================================

-- ─── Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- pgvector for RAG (Supabase-native vector search; no Pinecone needed)
CREATE EXTENSION IF NOT EXISTS "vector";

-- ─── Enums ──────────────────────────────────────────────────────────────────

-- 4 fixed roles per Convia RBAC: Owner / Admin / Developer / Human Agent.
-- Human Agent role can be scoped to specific bots via team_members.assigned_agent_ids.
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'developer', 'human_agent');

CREATE TYPE agent_status AS ENUM ('draft', 'active', 'paused', 'archived');

CREATE TYPE channel_type AS ENUM ('web', 'whatsapp');
CREATE TYPE channel_status AS ENUM ('disconnected', 'connecting', 'connected', 'error');

CREATE TYPE message_sender AS ENUM ('user', 'assistant', 'system', 'human_agent');
CREATE TYPE message_content_type AS ENUM ('text', 'image', 'file', 'tool_result', 'ui_component');

CREATE TYPE conversation_status AS ENUM ('active', 'waiting', 'human_takeover', 'ended', 'archived');
CREATE TYPE document_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- ─── 1. profiles ────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with Convia-specific fields.
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  locale          TEXT DEFAULT 'ro' CHECK (locale IN ('ro', 'en')),
  preferences     JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile when an auth.users row is created.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── 2. teams ───────────────────────────────────────────────────────────────
-- Convia uses "team" in code, "Workspace" in UI.
CREATE TABLE teams (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  -- Free | Business | Premium. Enforced via check constraint (expandable).
  plan            TEXT NOT NULL DEFAULT 'gratuit'
                  CHECK (plan IN ('gratuit', 'business', 'premium', 'enterprise')),
  settings        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-generate unique slug from name on insert.
CREATE OR REPLACE FUNCTION generate_team_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := TRIM(BOTH '-' FROM base_slug);
  IF base_slug = '' THEN base_slug := 'team'; END IF;
  new_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM teams WHERE slug = new_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := new_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_team_insert
  BEFORE INSERT ON teams
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_team_slug();

-- ─── 3. team_members ────────────────────────────────────────────────────────
CREATE TABLE team_members (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id              UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role                 team_role NOT NULL DEFAULT 'developer',
  -- For 'human_agent' role only: which bots this user can handle.
  -- Empty array = all bots in the team (default for other roles too).
  assigned_agent_ids   UUID[] DEFAULT '{}'::uuid[],
  invited_by           UUID REFERENCES profiles(id),
  invited_at           TIMESTAMPTZ DEFAULT NOW(),
  accepted_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, user_id)
);

-- ─── 4. team_invitations ────────────────────────────────────────────────────
CREATE TABLE team_invitations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  role            team_role NOT NULL DEFAULT 'developer',
  invited_by      UUID NOT NULL REFERENCES profiles(id),
  token           TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, email)
);

-- ─── 5. agents (UI label: "Bots") ───────────────────────────────────────────
CREATE TABLE agents (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id              UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  description          TEXT,
  status               agent_status NOT NULL DEFAULT 'draft',
  -- Onboarding-derived context
  industry             TEXT, -- 'hotel' | 'restaurant' | 'ecommerce' | 'servicii' | 'other'
  language             TEXT DEFAULT 'ro' CHECK (language IN ('ro', 'en')),
  -- AI configuration
  system_prompt        TEXT,
  model                TEXT DEFAULT 'gpt-4o-mini',
  temperature          DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature BETWEEN 0 AND 2),
  max_tokens           INTEGER DEFAULT 1000,
  -- Appearance (light theme defaults)
  appearance           JSONB DEFAULT '{
    "primaryColor": "#1D4ED8",
    "position": "bottom-right",
    "avatarUrl": null,
    "chatTitle": "Asistent",
    "welcomeMessage": "Salut! Cu ce te ajut?",
    "inputPlaceholder": "Scrie un mesaj...",
    "showBranding": true
  }'::jsonb,
  -- Domains where the widget is allowed (empty = any domain on dev, must be set in prod)
  allowed_domains      TEXT[] DEFAULT '{}'::text[],
  -- Per-agent API key for the embed widget.
  api_key              TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  -- Onboarding state
  is_published         BOOLEAN NOT NULL DEFAULT FALSE,
  published_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 6. channels ────────────────────────────────────────────────────────────
-- Each agent can have one or more channels (web widget, WhatsApp).
CREATE TABLE channels (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id        UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  type            channel_type NOT NULL,
  status          channel_status NOT NULL DEFAULT 'disconnected',
  -- Channel-specific config:
  --   web: { domains: ['example.com'] }
  --   whatsapp: { phone_number_id, business_account_id, encrypted_token }
  config          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, type)
);

-- ─── 7. knowledge_bases ─────────────────────────────────────────────────────
-- One KB per agent in Convia MVP. Schema supports multi-KB for the future.
CREATE TABLE knowledge_bases (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id           UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  agent_id          UUID REFERENCES agents(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  embedding_model   TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  chunk_size        INTEGER NOT NULL DEFAULT 1000,
  chunk_overlap     INTEGER NOT NULL DEFAULT 200,
  document_count    INTEGER NOT NULL DEFAULT 0,
  total_chunks      INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 8. documents ───────────────────────────────────────────────────────────
CREATE TABLE documents (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id   UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  team_id             UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  -- 'pdf' | 'docx' | 'xlsx' | 'csv' | 'txt' | 'md' | 'url' | 'raw_text'
  source_type         TEXT NOT NULL,
  source_url          TEXT,
  file_size           BIGINT,
  status              document_status NOT NULL DEFAULT 'pending',
  error_message       TEXT,
  raw_content         TEXT,
  chunk_count         INTEGER NOT NULL DEFAULT 0,
  metadata            JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at        TIMESTAMPTZ
);

-- ─── 9. document_chunks ─────────────────────────────────────────────────────
-- Embeddings stored locally via pgvector. 1536 dims = OpenAI text-embedding-3-small.
-- Swap to vector(3072) if you ever move to text-embedding-3-large.
CREATE TABLE document_chunks (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id         UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  knowledge_base_id   UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  content             TEXT NOT NULL,
  chunk_index         INTEGER NOT NULL,
  embedding           vector(1536),
  metadata            JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 10. conversations ──────────────────────────────────────────────────────
-- One conversation = one session = activity within 30-min inactivity window.
-- The session boundary is enforced in application code (when last_activity_at
-- is older than CONVERSATION_SESSION_TIMEOUT_MINUTES, start a new conversation).
CREATE TABLE conversations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id            UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  team_id             UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  channel_id          UUID REFERENCES channels(id) ON DELETE SET NULL,
  status              conversation_status NOT NULL DEFAULT 'active',
  -- Visitor (anonymous)
  visitor_id          TEXT NOT NULL,
  visitor_metadata    JSONB DEFAULT '{}'::jsonb,
  -- Session tracking
  session_id          TEXT NOT NULL,
  last_activity_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Takeover
  assigned_to         UUID REFERENCES profiles(id),
  taken_over_at       TIMESTAMPTZ,
  -- Conversation context / extracted variables
  variables           JSONB DEFAULT '{}'::jsonb,
  context             JSONB DEFAULT '{}'::jsonb,
  -- Stats
  message_count       INTEGER NOT NULL DEFAULT 0,
  -- Source
  source              TEXT NOT NULL DEFAULT 'web', -- 'web' | 'whatsapp' | 'api' | 'test'
  source_url          TEXT,
  -- Billing flag: set when this conversation pushed the team over its included cap.
  is_overage          BOOLEAN NOT NULL DEFAULT FALSE,
  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at            TIMESTAMPTZ,
  UNIQUE (agent_id, session_id)
);

-- ─── 11. messages ───────────────────────────────────────────────────────────
CREATE TABLE messages (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender              message_sender NOT NULL,
  sender_id           UUID REFERENCES profiles(id), -- when sender = 'human_agent'
  content_type        message_content_type NOT NULL DEFAULT 'text',
  content             TEXT NOT NULL,
  -- AI metadata
  model               TEXT,
  tokens_used         INTEGER,
  -- Tool/UI payloads (kept simple for MVP)
  tool_name           TEXT,
  tool_result         JSONB,
  ui_component        JSONB,
  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at        TIMESTAMPTZ,
  read_at             TIMESTAMPTZ
);

-- ─── 12. usage_logs ─────────────────────────────────────────────────────────
-- Raw event log. Aggregated daily into usage_periods (see 003_billing.sql).
CREATE TABLE usage_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id         UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  -- 'conversation_started' | 'message_sent' | 'tokens_used'
  event_type      TEXT NOT NULL,
  tokens_used     INTEGER DEFAULT 0,
  model           TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX idx_profiles_email           ON profiles (email);

CREATE INDEX idx_teams_slug               ON teams (slug);
CREATE INDEX idx_teams_plan               ON teams (plan);

CREATE INDEX idx_team_members_team        ON team_members (team_id);
CREATE INDEX idx_team_members_user        ON team_members (user_id);
CREATE INDEX idx_team_members_role        ON team_members (role);

CREATE INDEX idx_team_invitations_team    ON team_invitations (team_id);
CREATE INDEX idx_team_invitations_email   ON team_invitations (email);
CREATE INDEX idx_team_invitations_token   ON team_invitations (token);

CREATE INDEX idx_agents_team              ON agents (team_id);
CREATE INDEX idx_agents_status            ON agents (status);
CREATE INDEX idx_agents_api_key           ON agents (api_key);

CREATE INDEX idx_channels_agent           ON channels (agent_id);
CREATE INDEX idx_channels_team            ON channels (team_id);
CREATE INDEX idx_channels_type            ON channels (type);

CREATE INDEX idx_knowledge_bases_team     ON knowledge_bases (team_id);
CREATE INDEX idx_knowledge_bases_agent    ON knowledge_bases (agent_id);

CREATE INDEX idx_documents_kb             ON documents (knowledge_base_id);
CREATE INDEX idx_documents_team           ON documents (team_id);
CREATE INDEX idx_documents_status         ON documents (status);

CREATE INDEX idx_document_chunks_doc      ON document_chunks (document_id);
CREATE INDEX idx_document_chunks_kb       ON document_chunks (knowledge_base_id);
-- HNSW index for fast cosine-similarity search over pgvector embeddings.
-- m=16, ef_construction=64 is the Supabase-recommended starting point for <1M chunks.
CREATE INDEX idx_document_chunks_embedding
  ON document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_conversations_agent      ON conversations (agent_id);
CREATE INDEX idx_conversations_team       ON conversations (team_id);
CREATE INDEX idx_conversations_visitor    ON conversations (visitor_id);
CREATE INDEX idx_conversations_session    ON conversations (session_id);
CREATE INDEX idx_conversations_status     ON conversations (status);
CREATE INDEX idx_conversations_created    ON conversations (created_at DESC);
CREATE INDEX idx_conversations_last_act   ON conversations (last_activity_at DESC);
CREATE INDEX idx_conversations_overage    ON conversations (team_id, is_overage) WHERE is_overage = TRUE;

CREATE INDEX idx_messages_conversation    ON messages (conversation_id);
CREATE INDEX idx_messages_created         ON messages (created_at DESC);

CREATE INDEX idx_usage_logs_team          ON usage_logs (team_id);
CREATE INDEX idx_usage_logs_created       ON usage_logs (created_at DESC);
CREATE INDEX idx_usage_logs_event         ON usage_logs (event_type);

-- ─── Generic updated_at trigger ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at         BEFORE UPDATE ON profiles         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_teams_updated_at            BEFORE UPDATE ON teams            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_agents_updated_at           BEFORE UPDATE ON agents           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_channels_updated_at         BEFORE UPDATE ON channels         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_knowledge_bases_updated_at  BEFORE UPDATE ON knowledge_bases  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_documents_updated_at        BEFORE UPDATE ON documents        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_conversations_updated_at    BEFORE UPDATE ON conversations    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Message count + last_activity_at maintenance ───────────────────────────
CREATE OR REPLACE FUNCTION on_message_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET message_count = message_count + 1,
      last_activity_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_message_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET message_count = GREATEST(message_count - 1, 0)
  WHERE id = OLD.conversation_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_insert_trg
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION on_message_insert();

CREATE TRIGGER on_message_delete_trg
  AFTER DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION on_message_delete();

-- ─── Knowledge base counters ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION on_document_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE knowledge_bases
    SET document_count = document_count + 1
    WHERE id = NEW.knowledge_base_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE knowledge_bases
    SET document_count = GREATEST(document_count - 1, 0)
    WHERE id = OLD.knowledge_base_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_document_change_trg
  AFTER INSERT OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION on_document_change();

-- ─── Vector similarity search RPC ───────────────────────────────────────────
-- Called by the API to fetch the top-N chunks most similar to a query embedding,
-- scoped to a single knowledge base. Uses cosine distance.
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding   vector(1536),
  match_kb_id       UUID,
  match_count       INT     DEFAULT 5,
  match_threshold   FLOAT8  DEFAULT 0.7
)
RETURNS TABLE (
  id           UUID,
  document_id  UUID,
  content      TEXT,
  similarity   FLOAT8,
  metadata     JSONB
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding)::FLOAT8 AS similarity,
    dc.metadata
  FROM document_chunks dc
  WHERE dc.knowledge_base_id = match_kb_id
    AND dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

-- ─── Comments ───────────────────────────────────────────────────────────────
COMMENT ON TABLE profiles          IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE teams             IS 'Teams (UI label: "Workspaces") that own agents and resources';
COMMENT ON TABLE team_members      IS 'Team membership + role; human_agent role can be scoped to specific agents via assigned_agent_ids';
COMMENT ON TABLE team_invitations  IS 'Pending invitations to join a team';
COMMENT ON TABLE agents            IS 'AI chatbot configurations (UI label: "Bots")';
COMMENT ON TABLE channels          IS 'Deployment surfaces for an agent (web widget or WhatsApp)';
COMMENT ON TABLE knowledge_bases   IS 'Knowledge base containers for RAG; one per agent in Convia MVP';
COMMENT ON TABLE documents         IS 'Source documents uploaded or crawled into a knowledge base';
COMMENT ON TABLE document_chunks   IS 'Chunked document content + pointer to Pinecone vector';
COMMENT ON TABLE conversations     IS 'Chat sessions with visitors; new session every 30-min inactivity window';
COMMENT ON TABLE messages          IS 'Individual messages within a conversation';
COMMENT ON TABLE usage_logs        IS 'Raw event log, aggregated daily into usage_periods';
