-- ============================================================================
-- CONVIA — VECTOR CHUNKS (pgvector RAG storage)
-- ============================================================================
-- File 4 of 4. Run AFTER 001_bootstrap.sql, 002_rls.sql, 003_billing.sql.
--
-- Replaces the placeholder `document_chunks` table from 001_bootstrap.sql with
-- the denormalized `vector_chunks` table that SupabaseVectorService expects.
-- Denormalizing metadata (document_name, file_name, url, etc.) avoids JOINs
-- on every similarity query — important for sub-100ms RAG latency.
--
-- Embeddings: 1536 dims = OpenAI text-embedding-3-small.
-- Switch to vector(3072) if you migrate to text-embedding-3-large.
-- ============================================================================

-- ─── Drop the placeholder table (we replace it with vector_chunks) ──────────
DROP TABLE IF EXISTS document_chunks CASCADE;

-- ─── 1. vector_chunks ───────────────────────────────────────────────────────
CREATE TABLE vector_chunks (
  -- Application-generated id (e.g. "${documentId}_${chunkIndex}") so re-indexing
  -- the same chunk overwrites cleanly via UPSERT.
  id                  TEXT PRIMARY KEY,
  content             TEXT NOT NULL,
  embedding           vector(1536),

  -- Foreign keys (cascade on parent delete)
  knowledge_base_id   UUID REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  document_id         UUID REFERENCES documents(id) ON DELETE CASCADE,
  agent_id            UUID REFERENCES agents(id) ON DELETE CASCADE,

  -- Denormalized metadata (avoids JOINs on similarity queries)
  document_name       TEXT,
  chunk_index         INTEGER,
  file_id             TEXT,
  file_name           TEXT,
  website_source_id   TEXT,
  url                 TEXT,
  title               TEXT,
  type                TEXT,

  -- Logical partition (use '' for default; reserved for future multi-tenant slicing)
  namespace           TEXT NOT NULL DEFAULT '',
  -- Anything not captured by named columns
  extra_metadata      JSONB DEFAULT '{}'::jsonb,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────────────────────
-- HNSW for fast approximate cosine-similarity search.
-- m=16, ef_construction=64 is the Supabase-recommended starting point for <1M chunks.
CREATE INDEX idx_vector_chunks_embedding
  ON vector_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Filter indexes — match the RPC's WHERE predicates
CREATE INDEX idx_vector_chunks_kb         ON vector_chunks (knowledge_base_id);
CREATE INDEX idx_vector_chunks_document   ON vector_chunks (document_id);
CREATE INDEX idx_vector_chunks_agent      ON vector_chunks (agent_id);
CREATE INDEX idx_vector_chunks_file       ON vector_chunks (file_id) WHERE file_id IS NOT NULL;
CREATE INDEX idx_vector_chunks_website    ON vector_chunks (website_source_id) WHERE website_source_id IS NOT NULL;
CREATE INDEX idx_vector_chunks_namespace  ON vector_chunks (namespace);

-- Auto-bump updated_at (reuses helper defined in 001_bootstrap.sql)
CREATE TRIGGER set_vector_chunks_updated_at
  BEFORE UPDATE ON vector_chunks
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ─── 2. match_vector_chunks RPC ─────────────────────────────────────────────
-- Returns the top-k chunks ordered by cosine similarity (1 - cosine_distance),
-- optionally filtered by namespace, knowledge base(s), document, file(s), or
-- website source(s). The JS client sends `query_embedding` as a JSON-stringified
-- array, so we accept TEXT and cast to vector inside the function.
CREATE OR REPLACE FUNCTION match_vector_chunks(
  query_embedding           TEXT,
  match_limit               INTEGER DEFAULT 5,
  min_score                 FLOAT   DEFAULT 0.05,
  filter_namespace          TEXT    DEFAULT '',
  filter_kb_ids             UUID[]  DEFAULT NULL,
  filter_knowledge_base_id  UUID    DEFAULT NULL,
  filter_document_id        UUID    DEFAULT NULL,
  filter_file_ids           TEXT[]  DEFAULT NULL,
  filter_ws_ids             TEXT[]  DEFAULT NULL
)
RETURNS TABLE (
  id                TEXT,
  content           TEXT,
  score             FLOAT,
  knowledge_base_id UUID,
  document_id       UUID,
  document_name     TEXT,
  chunk_index       INTEGER,
  agent_id          UUID,
  file_id           TEXT,
  file_name         TEXT,
  website_source_id TEXT,
  url               TEXT,
  title             TEXT,
  type              TEXT,
  extra_metadata    JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  q_vector vector(1536);
BEGIN
  q_vector := query_embedding::vector(1536);

  RETURN QUERY
  SELECT
    vc.id,
    vc.content,
    (1 - (vc.embedding <=> q_vector))::FLOAT AS score,
    vc.knowledge_base_id,
    vc.document_id,
    vc.document_name,
    vc.chunk_index,
    vc.agent_id,
    vc.file_id,
    vc.file_name,
    vc.website_source_id,
    vc.url,
    vc.title,
    vc.type,
    vc.extra_metadata
  FROM vector_chunks vc
  WHERE vc.embedding IS NOT NULL
    AND vc.namespace = filter_namespace
    AND (filter_kb_ids            IS NULL OR vc.knowledge_base_id = ANY(filter_kb_ids))
    AND (filter_knowledge_base_id IS NULL OR vc.knowledge_base_id = filter_knowledge_base_id)
    AND (filter_document_id       IS NULL OR vc.document_id = filter_document_id)
    AND (filter_file_ids          IS NULL OR vc.file_id = ANY(filter_file_ids))
    AND (filter_ws_ids            IS NULL OR vc.website_source_id = ANY(filter_ws_ids))
    AND (1 - (vc.embedding <=> q_vector)) >= min_score
  ORDER BY vc.embedding <=> q_vector
  LIMIT match_limit;
END;
$$;

-- ─── 3. Row-Level Security ──────────────────────────────────────────────────
ALTER TABLE vector_chunks ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read chunks that belong to one of their teams.
-- Reachable either via knowledge_base_id (team-scoped) or agent_id (team-scoped).
CREATE POLICY vchunks_member_read ON vector_chunks FOR SELECT TO authenticated
  USING (
    (knowledge_base_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM knowledge_bases kb
      WHERE kb.id = vector_chunks.knowledge_base_id
        AND is_team_member(kb.team_id)
    ))
    OR
    (agent_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM agents a
      WHERE a.id = vector_chunks.agent_id
        AND is_team_member(a.team_id)
    ))
  );

-- Writes happen exclusively from the backend (service key) during indexing.
-- No INSERT/UPDATE/DELETE policy for the `authenticated` role → blocked by RLS.

-- Allow the match RPC to be called by authenticated users (backend uses service
-- key anyway, but this keeps the door open for direct browser calls if needed).
GRANT EXECUTE ON FUNCTION match_vector_chunks(
  TEXT, INTEGER, FLOAT, TEXT, UUID[], UUID, UUID, TEXT[], TEXT[]
) TO authenticated;
