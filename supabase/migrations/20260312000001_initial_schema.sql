-- =============================================================================
-- FlowWidgets — Initial Schema
-- Migration: 20260312000001_initial_schema.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles
-- One row per authenticated user, linked to auth.users.
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. integrations
-- Platform catalog of available integrations. Admin-owned.
-- ---------------------------------------------------------------------------
CREATE TABLE integrations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  category   TEXT        NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft', 'published', 'deprecated')),
  docs_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 3. integration_versions
-- Versioned config for one integration.
-- server_adapter_key is a string reference — never executable code.
-- ---------------------------------------------------------------------------
CREATE TABLE integration_versions (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id     UUID        NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  version            TEXT        NOT NULL,
  schema_json        JSONB       NOT NULL DEFAULT '{}',
  runtime_template   TEXT        NOT NULL,
  server_adapter_key TEXT        NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4. integration_credentials
-- Encrypted API keys. user_id NULL = platform-owned credential.
-- The raw decrypted secret is never returned to the client.
-- ---------------------------------------------------------------------------
CREATE TABLE integration_credentials (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id   UUID        NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id          UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  encrypted_secret TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 5. widgets
-- User-created instances of an integration version.
-- embed_token is the public lookup key used by the iframe runtime.
-- ---------------------------------------------------------------------------
CREATE TABLE widgets (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  integration_version_id  UUID        NOT NULL REFERENCES integration_versions(id),
  name                    TEXT        NOT NULL,
  config_json             JSONB       NOT NULL DEFAULT '{}',
  embed_token             TEXT        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 6. widget_runs
-- One row per generation event triggered by a site visitor.
-- INSERT is done server-side only — no client insert policy.
-- ---------------------------------------------------------------------------
CREATE TABLE widget_runs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id     UUID        NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  status        TEXT        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'success', 'error')),
  prompt_input  TEXT,
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 7. generated_assets
-- File references for outputs produced by widget runs.
-- storage_path is a Supabase Storage object path.
-- ---------------------------------------------------------------------------
CREATE TABLE generated_assets (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_run_id UUID        NOT NULL REFERENCES widget_runs(id) ON DELETE CASCADE,
  storage_path  TEXT        NOT NULL,
  file_type     TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 8. admin_integration_drafts
-- Staging area for integration ideas. AI agents may write here only.
-- Publishing to integrations always requires platform owner review.
-- ---------------------------------------------------------------------------
CREATE TABLE admin_integration_drafts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  description TEXT,
  notes       JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_versions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_runs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_assets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_integration_drafts ENABLE ROW LEVEL SECURITY;


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
-- No client access. All operations go through service role in server/.
-- ---------------------------------------------------------------------------
-- (No policies added — RLS blocks all anon/authenticated access by default.)


-- ---------------------------------------------------------------------------
-- widgets
-- Users have full access to their own widgets.
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
-- INSERT is via service role (API route) — no client insert policy.
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
-- INSERT is via service role — no client insert policy.
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
-- No client access. Service role only.
-- ---------------------------------------------------------------------------
-- (No policies added — RLS blocks all anon/authenticated access by default.)
