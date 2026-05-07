import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { generateForWidget } from "@/server/services/generation";

const requestSchema = z.object({
  prompt: z.string().min(1).max(500),
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

  const result = await generateForWidget(token, parsed.data.prompt);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ audioUrl: result.audioUrl });
}
