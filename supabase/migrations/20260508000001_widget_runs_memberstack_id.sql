-- =============================================================================
-- FlowWidgets — Add memberstack_member_id to widget_runs
-- Migration: 20260508000001_widget_runs_memberstack_id.sql
--
-- Stores the Memberstack member ID alongside each generation run.
-- Used to count per-member usage and enforce plan tier limits.
-- Nullable — runs without a member ID are still valid (no-limit widgets).
-- =============================================================================

ALTER TABLE widget_runs
  ADD COLUMN IF NOT EXISTS memberstack_member_id TEXT;

-- Index for fast per-member count queries used in limit enforcement.
CREATE INDEX IF NOT EXISTS widget_runs_memberstack_member_id_idx
  ON widget_runs (memberstack_member_id)
  WHERE memberstack_member_id IS NOT NULL;
