"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getWidgetThemeTokens,
  type WidgetTheme,
} from "@/features/widget-runtime/lib/theme";

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

function DownloadIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 1.75V9.1M7 9.1L4.375 6.475M7 9.1L9.625 6.475M2.625 12.25H11.375"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface Props {
  audioUrl: string;
  theme: WidgetTheme;
  autoPlay?: boolean;
}

export function PreviewPlayer({ audioUrl, theme, autoPlay }: Props) {
  const t = getWidgetThemeTokens(theme);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const displayDuration = duration > 0 ? duration : 30;
  const progressPercent =
    displayDuration > 0 ? Math.min(100, (currentTime / displayDuration) * 100) : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    if (autoPlay) {
      audio.play().catch(() => undefined);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl, autoPlay]);

  const seekToRatio = useCallback(
    (ratio: number) => {
      const audio = audioRef.current;
      if (!audio || displayDuration <= 0) return;
      const clamped = Math.max(0, Math.min(1, ratio));
      audio.currentTime = clamped * displayDuration;
      setCurrentTime(audio.currentTime);
    },
    [displayDuration]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => undefined);
    else audio.pause();
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      seekToRatio((e.clientX - rect.left) / rect.width);
    },
    [seekToRatio]
  );

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const res = await fetch(audioUrl);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `sound-effect-${Date.now()}.mp3`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const anchor = document.createElement("a");
      anchor.href = audioUrl;
      anchor.download = `sound-effect-${Date.now()}.mp3`;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.click();
    } finally {
      setIsDownloading(false);
    }
  }, [audioUrl, isDownloading]);

  const iconButtonStyle: React.CSSProperties = {
    flexShrink: 0,
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: `1px solid ${t.iconButtonBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
    background: "transparent",
  };

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
          gap: "14px",
          padding: "14px 18px",
          borderRadius: "20px",
          background: t.surface,
        }}
      >
        <span
          style={{
            flexShrink: 0,
            fontSize: "13px",
            fontWeight: 400,
            color: t.text,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.02em",
            minWidth: "72px",
          }}
        >
          {formatTime(currentTime)} / {formatTime(displayDuration)}
        </span>

        <div
          ref={progressRef}
          role="slider"
          aria-label="Playback position"
          aria-valuemin={0}
          aria-valuemax={displayDuration}
          aria-valuenow={currentTime}
          tabIndex={0}
          onClick={handleProgressClick}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") seekToRatio((currentTime + 1) / displayDuration);
            if (e.key === "ArrowLeft") seekToRatio((currentTime - 1) / displayDuration);
          }}
          style={{
            flex: 1,
            height: "6px",
            borderRadius: "999px",
            background: t.progressTrack,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progressPercent}%`,
              borderRadius: "999px",
              background: t.progressFill,
              transition: isPlaying ? "width 0.1s linear" : "none",
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          aria-label="Download sound effect"
          style={{
            ...iconButtonStyle,
            opacity: isDownloading ? 0.5 : 1,
            cursor: isDownloading ? "wait" : "pointer",
          }}
        >
          <DownloadIcon color={t.text} />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause preview" : "Play preview"}
          style={{
            ...iconButtonStyle,
            border: "none",
            background: t.playButtonBg,
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
