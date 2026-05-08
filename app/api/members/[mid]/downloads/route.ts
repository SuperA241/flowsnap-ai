import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/db/admin";
import { logger } from "@/lib/logger/logger";

const ALLOWED_ORIGIN = "https://a-list-v2.webflow.io";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

/**
 * GET /api/members/[mid]/downloads
 *
 * Returns the music library download history for a Memberstack member.
 * Returns newest first, capped at 200 entries.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ mid: string }> }
): Promise<NextResponse> {
  const { mid } = await params;

  if (!mid) {
    return NextResponse.json(
      { error: "Member ID is required." },
      { status: 400, headers: corsHeaders() }
    );
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("music_downloads")
    .select("id, track_name, file_type, created_at")
    .eq("memberstack_member_id", mid)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    logger.error("GET /api/members/[mid]/downloads failed", { message: error.message });
    return NextResponse.json(
      { error: "Failed to fetch downloads." },
      { status: 500, headers: corsHeaders() }
    );
  }

  const downloads = (data ?? []).map((row) => ({
    id: row.id,
    trackName: row.track_name,
    fileType: row.file_type,
    createdAt: row.created_at,
  }));

  return NextResponse.json({ downloads }, { headers: corsHeaders() });
}
