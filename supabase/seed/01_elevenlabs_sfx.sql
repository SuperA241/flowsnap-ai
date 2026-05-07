-- =============================================================================
-- Seed: ElevenLabs Sound FX integration
-- File: supabase/seed/01_elevenlabs_sfx.sql
--
-- Run once in Supabase Studio → SQL Editor for your hosted project.
-- Safe to re-run: all inserts use ON CONFLICT DO NOTHING (idempotent).
--
-- Deterministic UUIDs are used so foreign keys resolve correctly across runs.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Integration catalog entry
-- ---------------------------------------------------------------------------
INSERT INTO integrations (
  id,
  name,
  category,
  status,
  docs_url,
  created_at,
  updated_at
)
VALUES (
  'a1b2c3d4-0000-4000-8000-000000000001',
  'ElevenLabs Sound FX',
  'audio',
  'published',
  'https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Integration version
--
-- server_adapter_key is a string reference to the adapter registry defined at
-- server/integrations/registry/integration-registry.ts.
-- It is NOT executable code — it selects which adapter function to call.
--
-- schema_json defines the config fields the widget builder exposes to users.
-- It follows JSON Schema conventions and is validated server-side before
-- being passed to the ElevenLabs adapter.
-- ---------------------------------------------------------------------------
INSERT INTO integration_versions (
  id,
  integration_id,
  version,
  schema_json,
  runtime_template,
  server_adapter_key,
  created_at
)
VALUES (
  'a1b2c3d4-0000-4000-8000-000000000002',
  'a1b2c3d4-0000-4000-8000-000000000001',
  '1',
  '{
    "type": "object",
    "required": ["text"],
    "properties": {
      "text": {
        "type": "string",
        "description": "Sound effect description prompt"
      },
      "duration_seconds": {
        "type": "number",
        "minimum": 0.5,
        "maximum": 30,
        "description": "Duration in seconds. Omit to let ElevenLabs auto-detect."
      },
      "prompt_influence": {
        "type": "number",
        "minimum": 0,
        "maximum": 1,
        "description": "How closely to follow the prompt (0–1). Defaults to 0.3."
      },
      "loop": {
        "type": "boolean",
        "description": "Whether to produce a seamlessly looping sound effect."
      }
    }
  }',
  'sound_fx_generator',
  'elevenlabs-sfx-v1',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
