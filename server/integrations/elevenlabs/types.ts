/**
 * Input accepted by FlowWidgets before being mapped to the ElevenLabs API shape.
 * All optional fields match ElevenLabs defaults when omitted.
 */
export interface ElevenLabsSfxInput {
  /** The text prompt that describes the sound to generate. Required. */
  text: string;
  /** ElevenLabs model ID. Defaults to eleven_text_to_sound_v2. */
  model_id?: string;
  /**
   * Duration in seconds (0.5–30).
   * Omit to let ElevenLabs infer the optimal duration from the prompt.
   */
  duration_seconds?: number;
  /**
   * Controls how closely generation follows the prompt (0–1).
   * Higher values reduce variability. Defaults to 0.3.
   */
  prompt_influence?: number;
  /**
   * Whether to produce a seamlessly looping sound effect.
   * Only supported by eleven_text_to_sound_v2. Defaults to false.
   */
  loop?: boolean;
  /**
   * Output audio format as a query parameter.
   * Format: codec_samplerate_bitrate, e.g. mp3_44100_128.
   * Omit to use the ElevenLabs default (mp3_44100_128).
   */
  output_format?: string;
}

/**
 * The request body shape sent directly to the ElevenLabs sound generation API.
 * Undefined-value fields are stripped by the mapper before sending.
 */
export interface ElevenLabsSfxRequest {
  text: string;
  model_id?: string;
  duration_seconds?: number;
  prompt_influence?: number;
  loop?: boolean;
}

/**
 * Successful output from the ElevenLabs adapter.
 */
export interface ElevenLabsSfxOutput {
  /** Raw audio bytes returned by the API. */
  audioBytes: Uint8Array;
  /** Character count from the x-character-count response header, or null if absent. */
  characterCount: number | null;
  /** Request ID from the request-id response header, or null if absent. */
  requestId: string | null;
}

/**
 * Error returned by the adapter when the API call fails.
 */
export interface ElevenLabsAdapterError {
  /** HTTP status code as a string, or a non-HTTP code like "NETWORK_ERROR". */
  code: string;
  message: string;
}

export type ElevenLabsAdapterResult = ElevenLabsSfxOutput | ElevenLabsAdapterError;

/** Discriminator: true if the result is an error. */
export function isAdapterError(
  result: ElevenLabsAdapterResult
): result is ElevenLabsAdapterError {
  return "code" in result && "message" in result && !("audioBytes" in result);
}
