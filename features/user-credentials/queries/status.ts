import { createAdminClient } from "@/lib/db/admin";
import { logger } from "@/lib/logger/logger";

export interface UserCredentialStatus {
  /** Map of integration_id → true if the user has stored a key */
  hasKey: Record<string, boolean>;
}

/**
 * Returns which of the given integration IDs have a user-supplied credential
 * stored for the given user. Uses the service-role client to read
 * integration_credentials (no client policies on that table).
 */
export async function fetchUserCredentialStatus(
  userId: string,
  integrationIds: string[]
): Promise<UserCredentialStatus> {
  if (!userId || integrationIds.length === 0) {
    return { hasKey: {} };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("integration_credentials")
    .select("integration_id")
    .eq("user_id", userId)
    .in("integration_id", integrationIds);

  if (error) {
    logger.error("fetchUserCredentialStatus failed", {
      userId,
      message: error.message,
    });
    // Non-fatal: return all false so the page still renders
    return {
      hasKey: Object.fromEntries(integrationIds.map((id) => [id, false])),
    };
  }

  const storedIds = new Set((data ?? []).map((row) => row.integration_id));

  return {
    hasKey: Object.fromEntries(
      integrationIds.map((id) => [id, storedIds.has(id)])
    ),
  };
}
