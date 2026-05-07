"use client";

import { useRef, useState } from "react";

interface Props {
  token: string;
  widgetName: string;
  defaultPrompt?: string;
}

type GenerateState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; audioUrl: string }
  | { status: "error"; message: string };

export function SoundFxWidget({ token, widgetName, defaultPrompt }: Props) {
  const [prompt, setPrompt] = useState(defaultPrompt ?? "");
  const [state, setState] = useState<GenerateState>({ status: "idle" });
  const audioRef = useRef<HTMLAudioElement>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = prompt.trim();
    if (!trimmed) return;

    setState({ status: "loading" });

    try {
      const res = await fetch(`/api/widgets/${token}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const json = (await res.json()) as
        | { audioUrl: string }
        | { error: string };

      if (!res.ok || "error" in json) {
        const message =
          "error" in json ? json.error : `Request failed (${res.status})`;
        setState({ status: "error", message });
        return;
      }

      setState({ status: "success", audioUrl: json.audioUrl });

      // Auto-play after a short tick to allow the audio element to pick up the new src
      setTimeout(() => audioRef.current?.play(), 50);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error. Please retry.";
      setState({ status: "error", message });
    }
  }

  const isLoading = state.status === "loading";

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

      <form
        onSubmit={handleGenerate}
        style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your sound effect…"
          rows={2}
          disabled={isLoading}
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
            background: isLoading ? "#f9fafb" : "#fff",
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          style={{
            flexShrink: 0,
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: 500,
            borderRadius: "6px",
            border: "none",
            cursor: isLoading || !prompt.trim() ? "not-allowed" : "pointer",
            background:
              isLoading || !prompt.trim() ? "#e5e7eb" : "#111827",
            color: isLoading || !prompt.trim() ? "#9ca3af" : "#fff",
            transition: "background 0.15s",
          }}
        >
          {isLoading ? "Generating…" : "Generate"}
        </button>
      </form>

      {state.status === "success" && (
        <audio
          ref={audioRef}
          controls
          src={state.audioUrl}
          style={{ width: "100%", height: "36px" }}
        />
      )}

      {state.status === "error" && (
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#dc2626",
          }}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
