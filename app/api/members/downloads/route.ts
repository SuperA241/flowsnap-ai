import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/db/admin";
import { logger } from "@/lib/logger/logger";

const ALLOWED_ORIGIN = "https://a-list-v2.webflow.io";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

const bodySchema = z.object({
  mid:       z.string().min(1, "Member ID is required."),
  trackName: z.string().min(1, "Track name is required.").max(300),
  type:      z.enum(["wav", "stems"]),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400, headers: corsHeaders() }
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400, headers: corsHeaders() }
    );
  }

  const { mid, trackName, type } = parsed.data;

  const supabase = createAdminClient();

  const { error } = await supabase.from("music_downloads").insert({
    memberstack_member_id: mid,
    track_name: trackName,
    file_type: type,
  });

  if (error) {
    logger.error("music_downloads insert failed", { message: error.message });
    return NextResponse.json(
      { error: "Failed to record download." },
      { status: 500, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ ok: true }, { headers: corsHeaders() });
}
