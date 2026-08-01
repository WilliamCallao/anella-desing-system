import { darkPalette, palette } from "./colors";

export * from "./colors";
export * from "./shellTokens";
export * from "./spacing";
export * from "./typography";

export type ThemeMode = "light" | "dark";
export type ThemeColors = Record<keyof typeof palette, string>;

export function resolveColors(mode: ThemeMode): ThemeColors {
  return mode === "dark" ? { ...palette, ...darkPalette } : palette;
}
