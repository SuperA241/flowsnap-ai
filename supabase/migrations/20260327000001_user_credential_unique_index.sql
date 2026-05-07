-- =============================================================================
-- Migration: 20260327000001_user_credential_unique_index.sql
-- Adds a partial unique index so that each user may have at most one
-- credential per integration (user_id IS NOT NULL). Mirrors the platform
-- credential index added in 20260326000001.
-- =============================================================================

CREATE UNIQUE INDEX integration_credentials_user_unique
  ON integration_credentials (integration_id, user_id)
  WHERE user_id IS NOT NULL;
