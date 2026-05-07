import { logger } from "@/lib/logger/logger";
import { mapToElevenLabsRequest } from "./mapper";
import type {
  ElevenLabsAdapterResult,
  ElevenLabsSfxInput,
  ElevenLabsSfxOutput,
} from "./types";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/sound-generation";

/**
 * Calls the ElevenLabs POST /v1/sound-generation endpoint and returns either
 * raw audio bytes or a typed error. The API key is accepted as a parameter and
 * is never logged or included in any returned value.
 */
export async function execute(
  input: ElevenLabsSfxInput,
  apiKey: string
): Promise<ElevenLabsAdapterResult> {
  const requestBody = mapToElevenLabsRequest(input);

  const url = new URL(ELEVENLABS_API_URL);
  if (input.output_format !== undefined) {
    url.searchParams.set("output_format", input.output_format);
  }

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown network error";
    logger.error("ElevenLabs adapter: network error", { message });
    return { code: "NETWORK_ERROR", message };
  }

  if (!response.ok) {
    let errorMessage = `ElevenLabs API returned ${response.status}`;

    try {
      const errorBody = await response.json();
      if (
        typeof errorBody === "object" &&
        errorBody !== null &&
        "detail" in errorBody
      ) {
        errorMessage = JSON.stringify(errorBody.detail);
      }
    } catch {
      // Response body was not JSON; keep the default message.
    }

    logger.error("ElevenLabs adapter: API error", {
      status: response.status,
      message: errorMessage,
    });

    return {
      code: String(response.status),
      message: errorMessage,
    };
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioBytes = new Uint8Array(arrayBuffer);

  const characterCountHeader = response.headers.get("x-character-count");
  const characterCount =
    characterCountHeader !== null ? Number(characterCountHeader) : null;

  const requestId = response.headers.get("request-id");

  const output: ElevenLabsSfxOutput = {
    audioBytes,
    characterCount: Number.isNaN(characterCount) ? null : characterCount,
    requestId,
  };

  logger.info("ElevenLabs adapter: generation succeeded", {
    characterCount: output.characterCount,
    requestId: output.requestId,
    bytesLength: audioBytes.byteLength,
  });

  return output;
}
