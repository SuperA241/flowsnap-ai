"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getWidgetThemeTokens,
  type WidgetTheme,
} from "@/features/widget-runtime/lib/theme";

const PROMPT_PLACEHOLDER =
  "Example: Upbeat Afrobeat rhythm, clean guitar picking, light percussion. Optimistic and modern — made for a product launch.";

interface Props {
  token: string;
  defaultPrompt?: string;
  theme?: WidgetTheme;
  mid?: string;
  plan?: string;
}

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

type GenerateState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; audioUrl: string }
  | { status: "error"; message: string };

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlayIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden>
      <path d="M0 0L10 6L0 12V0Z" fill={color} />
    </svg>
  );
}

function PauseIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden>
      <rect x="0" y="0" width="3" height="12" fill={color} />
      <rect x="7" y="0" width="3" height="12" fill={color} />
    </svg>
  );
}

interface PreviewPlayerProps {
  audioUrl: string;
  theme: WidgetTheme;
  autoPlay?: boolean;
}

function PreviewPlayer({ audioUrl, theme, autoPlay }: PreviewPlayerProps) {
  const t = getWidgetThemeTokens(theme);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    if (autoPlay) {
      audio.play().catch(() => undefined);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl, autoPlay]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => undefined);
    else audio.pause();
  }, []);

  const displayDuration = duration > 0 ? duration : currentTime;

  return (
    <section aria-label="Preview sound effect">
      <p
        style={{
          margin: "0 0 10px 4px",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: t.textMuted,
        }}
      >
        Preview FX
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "14px 20px",
          borderRadius: "20px",
          background: t.surface,
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 400,
            color: t.text,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.02em",
          }}
        >
          {formatTime(currentTime)} / {formatTime(displayDuration)}
        </span>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause preview" : "Play preview"}
          style={{
            flexShrink: 0,
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background: t.playButtonBg,
            padding: 0,
          }}
        >
          {isPlaying ? (
            <PauseIcon color={t.playButtonIcon} />
          ) : (
            <PlayIcon color={t.playButtonIcon} />
          )}
        </button>
      </div>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </section>
  );
}

export function SoundFxWidget({
  token,
  defaultPrompt,
  theme = "light",
  mid,
  plan,
}: Props) {
  const t = getWidgetThemeTokens(theme);
  const [prompt, setPrompt] = useState(defaultPrompt ?? "");
  const [generateState, setGenerateState] = useState<GenerateState>({ status: "idle" });
  const [usageState, setUsageState] = useState<UsageState>({ status: "loading" });
  const [autoPlayPreview, setAutoPlayPreview] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (mid) params.set("mid", mid);
    if (plan) params.set("plan", plan);

    fetch(`/api/widgets/${token}/usage?${params.toString()}`)
      .then((r) => r.json() as Promise<UsageApiResponse>)
      .then((data) => {
        if (data.error) {
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
        setUsageState({ status: "unlimited" });
      });
  }, [token, mid, plan]);

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

        if (res.status === 429 || res.status === 401 || res.status === 403) {
          setUsageState({ status: "blocked", reason: message });
        }
        return;
      }

      setGenerateState({ status: "success", audioUrl: json.audioUrl });
      setAutoPlayPreview(true);

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

  const usageLabel =
    usageState.status === "active"
      ? `${usageState.count} generated · ${usageState.remaining} left`
      : null;

  return (
    <div
      style={{
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
        boxSizing: "border-box",
        background: "transparent",
      }}
    >
      <style>{`.fw-sfx-prompt::placeholder { color: ${t.textPlaceholder}; opacity: 1; }`}</style>
      {isBlocked ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "24px 28px",
            borderRadius: "24px",
            background: t.surface,
          }}
        >
          <span style={{ fontSize: "18px", lineHeight: 1, color: t.blockedIcon }} aria-hidden>
            🔒
          </span>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              lineHeight: 1.5,
              color: t.textMuted,
            }}
          >
            {usageState.reason}
          </p>
        </div>
      ) : (
        <form onSubmit={handleGenerate}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              padding: "28px",
              borderRadius: "24px",
              background: t.surface,
            }}
          >
            <textarea
              className="fw-sfx-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={PROMPT_PLACEHOLDER}
              rows={5}
              disabled={isLoading || isUsageLoading}
              style={{
                width: "100%",
                minHeight: "120px",
                resize: "none",
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "15px",
                lineHeight: 1.55,
                fontFamily: "inherit",
                color: t.text,
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              {usageLabel ? (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: t.textMuted,
                  }}
                >
                  {usageLabel}
                </span>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={!canGenerate}
                style={{
                  flexShrink: 0,
                  padding: "12px 28px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderRadius: "999px",
                  border: "none",
                  cursor: canGenerate ? "pointer" : "not-allowed",
                  background: canGenerate ? t.buttonBg : t.buttonDisabledBg,
                  color: canGenerate ? t.buttonText : t.buttonDisabledText,
                  transition: "opacity 0.15s",
                }}
              >
                {isLoading ? "Generating…" : "Generate"}
              </button>
            </div>
          </div>
        </form>
      )}

      {generateState.status === "error" && !isBlocked && (
        <p style={{ margin: 0, fontSize: "13px", color: t.error }}>{generateState.message}</p>
      )}

      {generateState.status === "success" && (
        <PreviewPlayer
          key={generateState.audioUrl}
          audioUrl={generateState.audioUrl}
          theme={theme}
          autoPlay={autoPlayPreview}
        />
      )}
    </div>
  );
}
