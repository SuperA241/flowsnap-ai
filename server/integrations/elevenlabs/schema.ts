import { z } from "zod";

/**
 * Validates input before it is mapped and sent to the ElevenLabs sound
 * generation API. Ranges and defaults are taken from the live API spec:
 * https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert
 */
export const elevenLabsSfxInputSchema = z.object({
  text: z
    .string()
    .min(1, "text must not be empty")
    .max(5000, "text must be 5000 characters or fewer"),

  model_id: z.string().optional(),

  duration_seconds: z
    .number()
    .min(0.5, "duration_seconds must be at least 0.5")
    .max(30, "duration_seconds must be at most 30")
    .optional(),

  prompt_influence: z
    .number()
    .min(0, "prompt_influence must be between 0 and 1")
    .max(1, "prompt_influence must be between 0 and 1")
    .optional(),

  loop: z.boolean().optional(),

  output_format: z.string().optional(),
});

export type ElevenLabsSfxInputSchema = z.infer<typeof elevenLabsSfxInputSchema>;
