import { NextRequest, NextResponse } from "next/server";

import { fetchWidgetByToken } from "@/features/widget-runtime/queries/widget-by-token";
import { logger } from "@/lib/logger/logger";
import { countMemberRunsThisMonth } from "@/server/services/generation";

interface PlanLimitEntry {
  price_id: string;
  name: string;
  monthly_limit: number;
}

function parsePlanLimits(configJson: Record<string, unknown>): PlanLimitEntry[] {
  const raw = configJson.plan_limits;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is PlanLimitEntry =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).price_id === "string" &&
      typeof (item as Record<string, unknown>).monthly_limit === "number"
  );
}

/**
 * GET /api/widgets/[token]/usage?mid=<memberstackId>&plan=<priceId>
 *
 * Returns the current month's usage for a Memberstack member on this widget.
 * Always returns HTTP 200 — the widget UI reads `blocked` to decide whether
 * to allow generation.
 *
 * Response shape:
 * {
 *   count:       number,          // runs this calendar month (0 when blocked/unlimited)
 *   limit:       number | null,   // null → no limit (widget has no tiers configured)
 *   planName:    string | null,
 *   remaining:   number | null,   // null when no limit
 *   blocked:     boolean,         // true → widget should be locked
 *   blockReason: string | null    // human-readable message shown in the widget
 * }
 *
 * Blocking rules (only apply when the widget has plan_limits configured):
 *   - No mid supplied          → 401-style block ("Please log in…")
 *   - mid present, no matching tier → 403-style block ("Your plan does not include…")
 *   - Limit reached            → block with limit-exceeded message
 * When the widget has NO plan_limits, everyone is allowed regardless of mid/plan.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const { token } = await params;
  const url = new URL(request.url);
  const mid = url.searchParams.get("mid") ?? undefined;
  const plan = url.searchParams.get("plan") ?? undefined;

  // Resolve widget
  const { widget, error: resolveError } = await fetchWidgetByToken(token);
  if (resolveError || !widget) {
    return NextResponse.json({ error: "Widget not found." }, { status: 404 });
  }

  const planLimits = parsePlanLimits(widget.configJson);

  // Widget has no tiers → open to everyone
  if (planLimits.length === 0) {
    return NextResponse.json({
      count: 0,
      limit: null,
      planName: null,
      remaining: null,
      blocked: false,
      blockReason: null,
    });
  }

  // Widget has tiers — require a logged-in member
  if (!mid) {
    return NextResponse.json({
      count: 0,
      limit: null,
      planName: null,
      remaining: null,
      blocked: true,
      blockReason: "Please log in to use this widget.",
    });
  }

  // Member must have a matching plan tier
  const tier = planLimits.find((t) => t.price_id === plan);
  if (!tier) {
    return NextResponse.json({
      count: 0,
      limit: null,
      planName: null,
      remaining: null,
      blocked: true,
      blockReason: "Your current plan does not include access to this widget.",
    });
  }

  // Count this month's runs
  let count = 0;
  try {
    count = await countMemberRunsThisMonth(widget.widgetId, mid);
  } catch {
    logger.error("usage route: failed to count member runs", { token, mid });
    return NextResponse.json({ error: "Failed to retrieve usage." }, { status: 500 });
  }

  const remaining = Math.max(0, tier.monthly_limit - count);
  const limitReached = count >= tier.monthly_limit;

  return NextResponse.json({
    count,
    limit: tier.monthly_limit,
    planName: tier.name,
    remaining,
    blocked: limitReached,
    blockReason: limitReached
      ? `You have reached your ${tier.name} plan limit of ${tier.monthly_limit} generation${tier.monthly_limit === 1 ? "" : "s"} this month.`
      : null,
  });
}
