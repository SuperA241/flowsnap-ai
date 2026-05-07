// Server-only. Uses the service-role client so uploads are not gated by RLS.
import { createAdminClient } from "@/lib/db/admin";
import { logger } from "@/lib/logger/logger";

const AUDIO_BUCKET = "generated-audio";

/**
 * Uploads raw audio bytes to Supabase Storage and returns the public URL.
 *
 * Path convention: {widgetId}/{runId}.mp3
 * The bucket must exist and be configured for public read access.
 */
export async function uploadAudio(
  widgetId: string,
  runId: string,
  audioBytes: Uint8Array
): Promise<string> {
  const supabase = createAdminClient();
  const storagePath = `${widgetId}/${runId}.mp3`;

  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(storagePath, audioBytes, {
      contentType: "audio/mpeg",
      upsert: false,
    });

  if (error) {
    logger.error("uploadAudio: storage upload failed", {
      widgetId,
      runId,
      message: error.message,
    });
    throw new Error("Audio upload failed.");
  }

  const { data } = supabase.storage
    .from(AUDIO_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}
