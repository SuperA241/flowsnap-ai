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
 * GET /api/members/[mid]/sounds
 *
 * Returns the generated sound FX history for a Memberstack member.
 * Joins widget_runs → generated_assets → widgets.
 * Returns newest first, capped at 100 entries.
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
    .from("widget_runs")
    .select(`
      id,
      prompt_input,
      created_at,
      widgets ( name ),
      generated_assets ( storage_path )
    `)
    .eq("memberstack_member_id", mid)
    .eq("status", "success")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    logger.error("GET /api/members/[mid]/sounds failed", { message: error.message });
    return NextResponse.json(
      { error: "Failed to fetch sounds." },
      { status: 500, headers: corsHeaders() }
    );
  }

  const sounds = (data ?? []).map((row) => {
    const assets = row.generated_assets as { storage_path: string }[] | null;
    const storagePath = assets?.[0]?.storage_path ?? null;

    const audioUrl = storagePath
      ? supabase.storage.from("generated-audio").getPublicUrl(storagePath).data.publicUrl
      : null;

    const widget = Array.isArray(row.widgets)
      ? (row.widgets[0] as { name: string } | undefined) ?? null
      : (row.widgets as { name: string } | null);

    return {
      id: row.id,
      prompt: row.prompt_input,
      widgetName: widget?.name ?? null,
      audioUrl,
      createdAt: row.created_at,
    };
  });

  return NextResponse.json({ sounds }, { headers: corsHeaders() });
}
