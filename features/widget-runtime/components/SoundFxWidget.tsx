"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  token: string;
  widgetName: string;
  defaultPrompt?: string;
  /** Memberstack member ID injected by the Webflow embed script. */
  mid?: string;
  /** Memberstack price ID injected by the Webflow embed script. */
  plan?: string;
}

// ---- Usage state machine ----

type UsageState =
  | { status: "loading" }
  | { status: "unlimited" }
  | { status: "blocked"; reason: string }
  | {
      status: "active";
      count: number;
      limit: number;
      planName: string;
      remaining: number;
    };

interface UsageApiResponse {
  count: number;
  limit: number | null;
  planName: string | null;
  remaining: number | null;
  blocked: boolean;
  blockReason: string | null;
  error?: string;
}

// ---- Generate state machine ----

type GenerateState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; audioUrl: string }
  | { status: "error"; message: string };

export function SoundFxWidget({ token, widgetName, defaultPrompt, mid, plan }: Props) {
  const [prompt, setPrompt] = useState(defaultPrompt ?? "");
  const [generateState, setGenerateState] = useState<GenerateState>({ status: "idle" });
  const [usageState, setUsageState] = useState<UsageState>({ status: "loading" });
  const audioRef = useRef<HTMLAudioElement>(null);

  // ---- Fetch usage on mount ----
  useEffect(() => {
    const params = new URLSearchParams();
    if (mid) params.set("mid", mid);
    if (plan) params.set("plan", plan);

    fetch(`/api/widgets/${token}/usage?${params.toString()}`)
      .then((r) => r.json() as Promise<UsageApiResponse>)
      .then((data) => {
        if (data.error) {
          // Fail open — don't block the user on a usage fetch error
          setUsageState({ status: "unlimited" });
          return;
        }
        if (data.blocked) {
          setUsageState({ status: "blocked", reason: data.blockReason ?? "Access restricted." });
          return;
        }
        if (data.limit === null) {
          setUsageState({ status: "unlimited" });
          return;
        }
        setUsageState({
          status: "active",
          count: data.count,
          limit: data.limit,
          planName: data.planName ?? "",
          remaining: data.remaining ?? 0,
        });
      })
      .catch(() => {
        // Fail open
        setUsageState({ status: "unlimited" });
      });
  }, [token, mid, plan]);

  // ---- Generate handler ----
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = prompt.trim();
    if (!trimmed) return;

    setGenerateState({ status: "loading" });

    try {
      const res = await fetch(`/api/widgets/${token}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, mid, plan }),
      });

      const json = (await res.json()) as { audioUrl: string } | { error: string };

      if (!res.ok || "error" in json) {
        const message = "error" in json ? json.error : `Request failed (${res.status})`;
        setGenerateState({ status: "error", message });

        // If the server returned 429/blocked, refresh usage state to reflect new limit
        if (res.status === 429 || res.status === 401 || res.status === 403) {
          setUsageState({ status: "blocked", reason: message });
        }
        return;
      }

      setGenerateState({ status: "success", audioUrl: json.audioUrl });
      setTimeout(() => audioRef.current?.play(), 50);

      // Optimistically update counter
      setUsageState((prev) => {
        if (prev.status !== "active") return prev;
        const newCount = prev.count + 1;
        const newRemaining = Math.max(0, prev.remaining - 1);
        return newRemaining === 0
          ? {
              status: "blocked",
              reason: `You have reached your ${prev.planName} plan limit of ${prev.limit} generation${prev.limit === 1 ? "" : "s"} this month.`,
            }
          : { ...prev, count: newCount, remaining: newRemaining };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error. Please retry.";
      setGenerateState({ status: "error", message });
    }
  }

  const isLoading = generateState.status === "loading";
  const isBlocked = usageState.status === "blocked";
  const isUsageLoading = usageState.status === "loading";
  const canGenerate = !isLoading && !isBlocked && !isUsageLoading && !!prompt.trim();

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "16px",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {/* Header row: name + usage counter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 600,
            color: "#111827",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {widgetName}
        </p>

        {/* Usage pill — only shown when a plan limit is active */}
        {usageState.status === "active" && (
          <span
            style={{
              flexShrink: 0,
              fontSize: "11px",
              color: usageState.remaining <= 1 ? "#b45309" : "#6b7280",
              background: usageState.remaining <= 1 ? "#fef3c7" : "#f3f4f6",
              borderRadius: "999px",
              padding: "2px 8px",
              whiteSpace: "nowrap",
            }}
          >
            {usageState.count} generated · {usageState.remaining} left
          </span>
        )}
      </div>

      {/* Blocked state */}
      {isBlocked ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 12px",
            borderRadius: "8px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
          }}
        >
          <span style={{ fontSize: "16px", lineHeight: 1 }}>🔒</span>
          <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", lineHeight: 1.4 }}>
            {usageState.reason}
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleGenerate}
          style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your sound effect…"
            rows={2}
            disabled={isLoading || isUsageLoading}
            style={{
              flex: 1,
              resize: "none",
              fontSize: "13px",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              outline: "none",
              fontFamily: "inherit",
              color: "#111827",
              background: isLoading || isUsageLoading ? "#f9fafb" : "#fff",
            }}
          />
          <button
            type="submit"
            disabled={!canGenerate}
            style={{
              flexShrink: 0,
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 500,
              borderRadius: "6px",
              border: "none",
              cursor: canGenerate ? "pointer" : "not-allowed",
              background: canGenerate ? "#111827" : "#e5e7eb",
              color: canGenerate ? "#fff" : "#9ca3af",
              transition: "background 0.15s",
            }}
          >
            {isLoading ? "Generating…" : "Generate"}
          </button>
        </form>
      )}

      {generateState.status === "success" && (
        <audio
          ref={audioRef}
          controls
          src={generateState.audioUrl}
          style={{ width: "100%", height: "36px" }}
        />
      )}

      {generateState.status === "error" && !isBlocked && (
        <p style={{ margin: 0, fontSize: "12px", color: "#dc2626" }}>
          {generateState.message}
        </p>
      )}
    </div>
  );
}
