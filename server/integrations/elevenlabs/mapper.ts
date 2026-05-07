import type { ElevenLabsSfxInput, ElevenLabsSfxRequest } from "./types";

/**
 * Maps a validated FlowWidgets input to the ElevenLabs API request body.
 * Strips undefined fields so the payload stays minimal and avoids sending
 * null-equivalent values that might override ElevenLabs server-side defaults.
 */
export function mapToElevenLabsRequest(
  input: ElevenLabsSfxInput
): ElevenLabsSfxRequest {
  const request: ElevenLabsSfxRequest = { text: input.text };

  if (input.model_id !== undefined) {
    request.model_id = input.model_id;
  }

  if (input.duration_seconds !== undefined) {
    request.duration_seconds = input.duration_seconds;
  }

  if (input.prompt_influence !== undefined) {
    request.prompt_influence = input.prompt_influence;
  }

  if (input.loop !== undefined) {
    request.loop = input.loop;
  }

  return request;
}
