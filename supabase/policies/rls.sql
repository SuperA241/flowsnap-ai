-- =============================================================================
-- FlowWidgets — Row Level Security Policies (reference copy)
-- Source of truth: supabase/migrations/20260312000001_initial_schema.sql
-- This file is for audit/review only. Do not apply it directly.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- Users may read and update their own row only.
-- ---------------------------------------------------------------------------
CREATE POLICY "profiles: users read own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: users update own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);


-- ---------------------------------------------------------------------------
-- integrations
-- Published integrations are readable by anyone (anon and authenticated).
-- Write access is via service role only (admin backend).
-- ---------------------------------------------------------------------------
CREATE POLICY "integrations: public read published"
  ON integrations FOR SELECT
  USING (status = 'published');


-- ---------------------------------------------------------------------------
-- integration_versions
-- Published integration versions are readable by anyone.
-- Write access is via service role only.
-- ---------------------------------------------------------------------------
CREATE POLICY "integration_versions: public read published"
  ON integration_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM integrations i
      WHERE i.id = integration_versions.integration_id
        AND i.status = 'published'
    )
  );


-- ---------------------------------------------------------------------------
-- integration_credentials
-- No client access at all.
-- RLS blocks all anon/authenticated requests by default.
-- All operations use the service role key inside server/.
-- ---------------------------------------------------------------------------


-- ---------------------------------------------------------------------------
-- widgets
-- Users have full CRUD on their own widgets.
-- ---------------------------------------------------------------------------
CREATE POLICY "widgets: users read own"
  ON widgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "widgets: users insert own"
  ON widgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "widgets: users update own"
  ON widgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "widgets: users delete own"
  ON widgets FOR DELETE
  USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- widget_runs
-- Users may read runs for their own widgets.
-- INSERT is done by the API route via service role — no client insert policy.
-- ---------------------------------------------------------------------------
CREATE POLICY "widget_runs: users read own"
  ON widget_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM widgets w
      WHERE w.id = widget_runs.widget_id
        AND w.user_id = auth.uid()
    )
  );


-- ---------------------------------------------------------------------------
-- generated_assets
-- Users may read assets for runs belonging to their own widgets.
-- INSERT is done by the API route via service role — no client insert policy.
-- ---------------------------------------------------------------------------
CREATE POLICY "generated_assets: users read own"
  ON generated_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM widget_runs wr
      JOIN widgets w ON w.id = wr.widget_id
      WHERE wr.id = generated_assets.widget_run_id
        AND w.user_id = auth.uid()
    )
  );


-- ---------------------------------------------------------------------------
-- admin_integration_drafts
-- No client access at all.
-- RLS blocks all anon/authenticated requests by default.
-- AI agents and admin operations use the service role key inside server/.
-- ---------------------------------------------------------------------------
