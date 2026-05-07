import * as elevenlabsAdapter from "../elevenlabs/adapter";
import type {
  ElevenLabsAdapterResult,
  ElevenLabsSfxInput,
} from "../elevenlabs/types";

/**
 * The canonical signature every registered adapter execute function must match.
 * The input shape is that of the elevenlabs adapter for now; a union type can be
 * introduced when additional adapters are registered.
 */
export type AdapterExecuteFn = (
  input: ElevenLabsSfxInput,
  apiKey: string
) => Promise<ElevenLabsAdapterResult>;

/**
 * Maps server_adapter_key strings (stored in integration_versions.server_adapter_key)
 * to their corresponding adapter execute functions.
 *
 * This is a code reference — not executable content from the database.
 * Adding a new adapter requires a code change and review here.
 */
const registry: Record<string, AdapterExecuteFn> = {
  "elevenlabs-sfx-v1": elevenlabsAdapter.execute,
};

/**
 * Returns the adapter execute function for the given key, or null if not found.
 * Callers should treat a null return as a configuration error.
 */
export function getAdapter(key: string): AdapterExecuteFn | null {
  return registry[key] ?? null;
}
