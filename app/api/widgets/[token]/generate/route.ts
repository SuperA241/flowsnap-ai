import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger/logger";
import { generateForWidget } from "@/server/services/generation";

const requestSchema = z.object({
  prompt: z.string().min(1).max(500),
  /** Memberstack member ID — forwarded from the widget client for limit tracking. */
  mid: z.string().optional(),
  /** Memberstack price ID — used to look up the matching plan tier. */
  plan: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const { prompt, mid, plan } = parsed.data;

  logger.info("widget.generate: request received", { token, hasMid: !!mid, hasPlan: !!plan });

  const result = await generateForWidget(token, prompt, mid, plan);

  if ("error" in result) {
    logger.warn("widget.generate: generation failed", {
      token,
      status: result.status,
      error: result.error,
    });
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  logger.info("widget.generate: generation succeeded", { token });
  return NextResponse.json({ audioUrl: result.audioUrl });
}
