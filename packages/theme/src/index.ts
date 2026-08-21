import { darkPalette, palette } from "./colors";
import { lightColors } from "./themes/light";
import { darkColors } from "./themes/dark";
import type { DashboardShellTokens } from "./shellTokens";
export * from "./colors";
export * from "./shellTokens";
export * from "./spacing";
export * from "./texts";
export * from "./basePalette";
export * from "./semanticColors";
export * from "./semanticTokens";
export * from "./themes/light";
export * from "./themes/dark";
export * from "./layout";
export * from "./radius";

export type ThemeMode = "light" | "dark";
export type ThemeColors = Record<keyof typeof palette, string>;

export function resolveColors(mode: ThemeMode): ThemeColors {
  return mode === "dark" ? { ...palette, ...darkPalette } : palette;
}

export function resolveSemanticColors(mode: ThemeMode) {
  return mode === "dark" ? darkColors : lightColors;
}

export function resolveShellTokens(mode: "light" | "dark"): DashboardShellTokens {
  const sc = resolveSemanticColors(mode);
  if (mode === "light") {
    return {
      background: sc.components.sidebar.background,
      sidebarBackground: sc.components.sidebar.background,
      sidebarText: sc.components.sidebar.text,
      sidebarHover: sc.components.sidebar.hover,
      sidebarActiveBackground: sc.components.sidebar.activeBackground,
      sidebarActiveText: sc.components.sidebar.activeText,
      sidebarSectionTitle: sc.components.sidebar.sectionTitle,
      sidebarTitle: sc.components.sidebar.title,
      contentBackground: sc.surface.pageDefault,
      contentBorder: sc.components.sidebar.background,
      borderRadius: 20,
      itemRadius: 10,
      outerMargin: 16,
      contentPadding: 24,
      sidebarWidth: 256,
      sidebarCompactWidth: 76,
    };
  }
  return {
    background: sc.components.sidebar.background,
    sidebarBackground: sc.components.sidebar.background,
    sidebarText: sc.components.sidebar.text,
    sidebarHover: sc.components.sidebar.hover,
    sidebarActiveBackground: sc.components.sidebar.activeBackground,
    sidebarActiveText: sc.components.sidebar.activeText,
    sidebarSectionTitle: sc.components.sidebar.sectionTitle,
    sidebarTitle: sc.components.sidebar.title,
    contentBackground: sc.surface.card,
    contentBorder: sc.components.sidebar.background,
    borderRadius: 20,
    itemRadius: 10,
    outerMargin: 16,
    contentPadding: 24,
    sidebarWidth: 256,
    sidebarCompactWidth: 76,
  };
}
