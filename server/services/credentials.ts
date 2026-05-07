// Server-only. Never import this in client components or browser code.
// All credential operations use the service-role client to bypass RLS.
import { createAdminClient } from "@/lib/db/admin";
import { decrypt, encrypt } from "@/lib/encryption/encrypt";
import { logger } from "@/lib/logger/logger";

/**
 * Encrypts the plaintext API key and upserts it as a platform-owned credential
 * (user_id IS NULL) for the given integration.
 *
 * Relies on the partial unique index `integration_credentials_platform_unique`
 * to safely resolve conflicts on (integration_id) WHERE user_id IS NULL.
 */
export async function storePlatformCredential(
  integrationId: string,
  plaintext: string
): Promise<void> {
  const encrypted_secret = encrypt(plaintext);
  const supabase = createAdminClient();

  // Supabase's upsert() generates ON CONFLICT (column) which requires a full unique
  // constraint, not a partial index. We use delete-then-insert instead so the
  // partial unique index on (integration_id) WHERE user_id IS NULL handles integrity.
  const { error: deleteError } = await supabase
    .from("integration_credentials")
    .delete()
    .eq("integration_id", integrationId)
    .is("user_id", null);

  if (deleteError) {
    logger.error("storePlatformCredential delete failed", { integrationId, message: deleteError.message });
    throw new Error("Failed to store credential.");
  }

  const { error: insertError } = await supabase
    .from("integration_credentials")
    .insert({
      integration_id: integrationId,
      user_id: null,
      encrypted_secret,
    });

  if (insertError) {
    logger.error("storePlatformCredential insert failed", { integrationId, message: insertError.message });
    throw new Error("Failed to store credential.");
  }
}

/**
 * Fetches and decrypts the platform-owned API key for the given integration.
 * Returns null if no platform credential exists.
 * The decrypted key must never be forwarded to the client.
 */
export async function getPlatformApiKey(
  integrationId: string
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("integration_credentials")
    .select("encrypted_secret")
    .eq("integration_id", integrationId)
    .is("user_id", null)
    .maybeSingle();

  if (error) {
    logger.error("getPlatformApiKey failed", { integrationId, message: error.message });
    throw new Error("Failed to retrieve credential.");
  }

  if (!data) return null;

  return decrypt(data.encrypted_secret);
}

/**
 * Returns true if a platform-owned credential exists for the given integration.
 * Safe to call from server components — does not decrypt or return the key.
 */
export async function hasPlatformCredential(
  integrationId: string
): Promise<boolean> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("integration_credentials")
    .select("id", { count: "exact", head: true })
    .eq("integration_id", integrationId)
    .is("user_id", null);

  if (error) {
    logger.error("hasPlatformCredential failed", { integrationId, message: error.message });
    return false;
  }

  return (count ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// User-owned credentials (BYOK)
// ---------------------------------------------------------------------------

/**
 * Encrypts and stores a user-supplied API key for the given integration.
 * Relies on the partial unique index `integration_credentials_user_unique`
 * on (integration_id, user_id) WHERE user_id IS NOT NULL.
 */
export async function storeUserCredential(
  integrationId: string,
  userId: string,
  plaintext: string
): Promise<void> {
  const encrypted_secret = encrypt(plaintext);
  const supabase = createAdminClient();

  const { error: deleteError } = await supabase
    .from("integration_credentials")
    .delete()
    .eq("integration_id", integrationId)
    .eq("user_id", userId);

  if (deleteError) {
    logger.error("storeUserCredential delete failed", { integrationId, userId, message: deleteError.message });
    throw new Error("Failed to store credential.");
  }

  const { error: insertError } = await supabase
    .from("integration_credentials")
    .insert({
      integration_id: integrationId,
      user_id: userId,
      encrypted_secret,
    });

  if (insertError) {
    logger.error("storeUserCredential insert failed", { integrationId, userId, message: insertError.message });
    throw new Error("Failed to store credential.");
  }
}

/**
 * Fetches and decrypts the user-supplied API key for the given integration.
 * Returns null if the user has not stored a key.
 * The decrypted key must never be forwarded to the client.
 */
export async function getUserApiKey(
  integrationId: string,
  userId: string
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("integration_credentials")
    .select("encrypted_secret")
    .eq("integration_id", integrationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logger.error("getUserApiKey failed", { integrationId, userId, message: error.message });
    throw new Error("Failed to retrieve credential.");
  }

  if (!data) return null;

  return decrypt(data.encrypted_secret);
}

/**
 * Returns true if the user has stored a credential for the given integration.
 * Safe to call from server components — does not decrypt or return the key.
 */
export async function hasUserCredential(
  integrationId: string,
  userId: string
): Promise<boolean> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("integration_credentials")
    .select("id", { count: "exact", head: true })
    .eq("integration_id", integrationId)
    .eq("user_id", userId);

  if (error) {
    logger.error("hasUserCredential failed", { integrationId, userId, message: error.message });
    return false;
  }

  return (count ?? 0) > 0;
}
