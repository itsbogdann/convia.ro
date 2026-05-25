-- ============================================================================
-- CONVIA — ROW-LEVEL SECURITY POLICIES
-- ============================================================================
-- File 2 of 3. Run AFTER 001_bootstrap.sql.
--
-- Convia's RBAC model:
--   - owner       : full control, billing, delete team
--   - admin       : full control except billing + delete team
--   - developer   : manage bots, knowledge bases, settings (not team members)
--   - human_agent : only inbox + conversations, scoped to assigned_agent_ids
--
-- Backend uses the service key (bypasses RLS). The browser/web app uses the
-- publishable key + signed-in user JWT, which RLS enforces.
-- ============================================================================

-- ─── Helper: is user a member of a team? ───────────────────────────────────
CREATE OR REPLACE FUNCTION is_team_member(p_team_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
      AND accepted_at IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Helper: does the user have at least the given role in the team? ───────
-- Role hierarchy: owner > admin > developer > human_agent
CREATE OR REPLACE FUNCTION has_team_role(p_team_id UUID, p_min_role team_role)
RETURNS BOOLEAN AS $$
DECLARE
  user_role team_role;
  role_rank INTEGER;
  min_rank  INTEGER;
BEGIN
  SELECT role INTO user_role
  FROM team_members
  WHERE team_id = p_team_id
    AND user_id = auth.uid()
    AND accepted_at IS NOT NULL
  LIMIT 1;

  IF user_role IS NULL THEN RETURN FALSE; END IF;

  role_rank := CASE user_role
    WHEN 'owner'       THEN 4
    WHEN 'admin'       THEN 3
    WHEN 'developer'   THEN 2
    WHEN 'human_agent' THEN 1
  END;

  min_rank := CASE p_min_role
    WHEN 'owner'       THEN 4
    WHEN 'admin'       THEN 3
    WHEN 'developer'   THEN 2
    WHEN 'human_agent' THEN 1
  END;

  RETURN role_rank >= min_rank;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── Helper: is the user a human_agent assigned to this specific agent? ────
-- Returns TRUE for any role above human_agent. Only human_agent is restricted.
CREATE OR REPLACE FUNCTION can_access_agent(p_agent_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_team_id    UUID;
  v_role       team_role;
  v_assigned   UUID[];
BEGIN
  SELECT team_id INTO v_team_id FROM agents WHERE id = p_agent_id;
  IF v_team_id IS NULL THEN RETURN FALSE; END IF;

  SELECT role, assigned_agent_ids INTO v_role, v_assigned
  FROM team_members
  WHERE team_id = v_team_id
    AND user_id = auth.uid()
    AND accepted_at IS NOT NULL;

  IF v_role IS NULL THEN RETURN FALSE; END IF;

  -- All roles except human_agent see all agents in their team.
  IF v_role <> 'human_agent' THEN RETURN TRUE; END IF;

  -- human_agent: must be in assigned_agent_ids (empty array = all bots).
  RETURN array_length(v_assigned, 1) IS NULL OR p_agent_id = ANY (v_assigned);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── Enable RLS on all team-scoped tables ──────────────────────────────────
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams             ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels          ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_bases   ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs        ENABLE ROW LEVEL SECURITY;

-- ─── profiles ──────────────────────────────────────────────────────────────
CREATE POLICY profiles_self_read   ON profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_self_update ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- ─── teams ─────────────────────────────────────────────────────────────────
CREATE POLICY teams_member_read    ON teams FOR SELECT TO authenticated USING (is_team_member(id));
CREATE POLICY teams_admin_update   ON teams FOR UPDATE TO authenticated USING (has_team_role(id, 'admin'));
CREATE POLICY teams_owner_delete   ON teams FOR DELETE TO authenticated USING (has_team_role(id, 'owner'));
-- INSERT: any signed-in user can create a team; the API must also create a
-- team_members row with role='owner' immediately after, in a transaction.
CREATE POLICY teams_authed_insert  ON teams FOR INSERT TO authenticated WITH CHECK (TRUE);

-- ─── team_members ──────────────────────────────────────────────────────────
CREATE POLICY team_members_read    ON team_members FOR SELECT TO authenticated USING (is_team_member(team_id) OR user_id = auth.uid());
CREATE POLICY team_members_admin_w ON team_members FOR INSERT TO authenticated WITH CHECK (has_team_role(team_id, 'admin'));
CREATE POLICY team_members_admin_u ON team_members FOR UPDATE TO authenticated USING (has_team_role(team_id, 'admin'));
CREATE POLICY team_members_admin_d ON team_members FOR DELETE TO authenticated USING (has_team_role(team_id, 'admin'));

-- ─── team_invitations ──────────────────────────────────────────────────────
CREATE POLICY invitations_admin_all ON team_invitations FOR ALL TO authenticated
  USING (has_team_role(team_id, 'admin'))
  WITH CHECK (has_team_role(team_id, 'admin'));

-- ─── agents ────────────────────────────────────────────────────────────────
CREATE POLICY agents_member_read   ON agents FOR SELECT TO authenticated USING (can_access_agent(id));
CREATE POLICY agents_dev_insert    ON agents FOR INSERT TO authenticated WITH CHECK (has_team_role(team_id, 'developer'));
CREATE POLICY agents_dev_update    ON agents FOR UPDATE TO authenticated USING (has_team_role(team_id, 'developer') AND can_access_agent(id));
CREATE POLICY agents_admin_delete  ON agents FOR DELETE TO authenticated USING (has_team_role(team_id, 'admin'));

-- ─── channels ──────────────────────────────────────────────────────────────
CREATE POLICY channels_dev_all ON channels FOR ALL TO authenticated
  USING (has_team_role(team_id, 'developer') AND can_access_agent(agent_id))
  WITH CHECK (has_team_role(team_id, 'developer') AND can_access_agent(agent_id));

-- ─── knowledge_bases ───────────────────────────────────────────────────────
CREATE POLICY kb_member_read       ON knowledge_bases FOR SELECT TO authenticated USING (is_team_member(team_id));
CREATE POLICY kb_dev_write         ON knowledge_bases FOR INSERT TO authenticated WITH CHECK (has_team_role(team_id, 'developer'));
CREATE POLICY kb_dev_update        ON knowledge_bases FOR UPDATE TO authenticated USING (has_team_role(team_id, 'developer'));
CREATE POLICY kb_admin_delete      ON knowledge_bases FOR DELETE TO authenticated USING (has_team_role(team_id, 'admin'));

-- ─── documents ─────────────────────────────────────────────────────────────
CREATE POLICY documents_dev_all ON documents FOR ALL TO authenticated
  USING (has_team_role(team_id, 'developer'))
  WITH CHECK (has_team_role(team_id, 'developer'));

-- ─── document_chunks (read-only from UI; service key writes during indexing) ─
CREATE POLICY chunks_member_read ON document_chunks FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM knowledge_bases kb
    WHERE kb.id = document_chunks.knowledge_base_id
      AND is_team_member(kb.team_id)
  ));

-- ─── conversations ─────────────────────────────────────────────────────────
-- Visible to anyone who can access the underlying agent.
CREATE POLICY conv_member_read   ON conversations FOR SELECT TO authenticated USING (can_access_agent(agent_id));
CREATE POLICY conv_member_update ON conversations FOR UPDATE TO authenticated USING (can_access_agent(agent_id));
-- INSERT/DELETE happen via service key (widget API).

-- ─── messages ──────────────────────────────────────────────────────────────
CREATE POLICY messages_member_read ON messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
      AND can_access_agent(c.agent_id)
  ));
-- INSERT for human takeover (humans replying):
CREATE POLICY messages_human_insert ON messages FOR INSERT TO authenticated
  WITH CHECK (
    sender = 'human_agent'
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND can_access_agent(c.agent_id)
    )
  );

-- ─── usage_logs (read-only from UI for admins+) ────────────────────────────
CREATE POLICY usage_admin_read ON usage_logs FOR SELECT TO authenticated
  USING (has_team_role(team_id, 'admin'));

-- ─── Notes for the API ─────────────────────────────────────────────────────
-- The widget endpoint and background workers use the Supabase service key,
-- which bypasses RLS entirely. RLS protects the dashboard (web app) which
-- always uses the user's JWT. Never expose the service key to the browser.
