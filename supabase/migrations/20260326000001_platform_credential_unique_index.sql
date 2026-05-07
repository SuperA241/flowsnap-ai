-- =============================================================================
-- Migration: 20260326000001_platform_credential_unique_index.sql
-- Adds a partial unique index so that each integration may have at most one
-- platform-owned credential (user_id IS NULL). This makes upsert safe.
-- =============================================================================

CREATE UNIQUE INDEX integration_credentials_platform_unique
  ON integration_credentials (integration_id)
  WHERE user_id IS NULL;
