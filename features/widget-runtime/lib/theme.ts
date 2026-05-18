export type WidgetTheme = "light" | "dark";

export interface WidgetThemeTokens {
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  textPlaceholder: string;
  border: string;
  buttonBg: string;
  buttonText: string;
  buttonDisabledBg: string;
  buttonDisabledText: string;
  playButtonBg: string;
  playButtonIcon: string;
  progressTrack: string;
  progressFill: string;
  iconButtonBorder: string;
  error: string;
  blockedIcon: string;
}

const LIGHT: WidgetThemeTokens = {
  surface: "#FAF9F6",
  surfaceMuted: "#F0EFEC",
  text: "#0A0A0A",
  textMuted: "#0A0A0A",
  textPlaceholder: "#6B6B6B",
  border: "transparent",
  buttonBg: "#0A0A0A",
  buttonText: "#FAF9F6",
  buttonDisabledBg: "#D4D4D4",
  buttonDisabledText: "#737373",
  playButtonBg: "#0A0A0A",
  playButtonIcon: "#FAF9F6",
  progressTrack: "#E0DFDB",
  progressFill: "#0A0A0A",
  iconButtonBorder: "rgba(10, 10, 10, 0.12)",
  error: "#DC2626",
  blockedIcon: "#0A0A0A",
};

const DARK: WidgetThemeTokens = {
  surface: "#1C1C1C",
  surfaceMuted: "#262626",
  text: "#FAF9F6",
  textMuted: "#FAF9F6",
  textPlaceholder: "#A3A3A3",
  border: "transparent",
  buttonBg: "#FAF9F6",
  buttonText: "#0A0A0A",
  buttonDisabledBg: "#404040",
  buttonDisabledText: "#737373",
  playButtonBg: "#FAF9F6",
  playButtonIcon: "#0A0A0A",
  progressTrack: "#404040",
  progressFill: "#FAF9F6",
  iconButtonBorder: "rgba(250, 249, 246, 0.2)",
  error: "#F87171",
  blockedIcon: "#FAF9F6",
};

export function parseWidgetTheme(value: string | undefined): WidgetTheme {
  return value === "dark" ? "dark" : "light";
}

export function getWidgetThemeTokens(theme: WidgetTheme): WidgetThemeTokens {
  return theme === "dark" ? DARK : LIGHT;
}
