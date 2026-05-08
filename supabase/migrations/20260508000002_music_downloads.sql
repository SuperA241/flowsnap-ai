-- =============================================================================
-- FlowWidgets — Music download history
-- Migration: 20260508000002_music_downloads.sql
--
-- Tracks which music library tracks a Memberstack member has downloaded.
-- Written by the FlowWidgets API when a member clicks WAV or Stems download.
-- =============================================================================

CREATE TABLE IF NOT EXISTS music_downloads (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memberstack_member_id  TEXT NOT NULL,
  track_name             TEXT NOT NULL,
  file_type              TEXT NOT NULL CHECK (file_type IN ('wav', 'stems')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-member history queries
CREATE INDEX IF NOT EXISTS music_downloads_member_idx
  ON music_downloads (memberstack_member_id, created_at DESC);
