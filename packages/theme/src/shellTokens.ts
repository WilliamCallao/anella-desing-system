import { accent, background, cta1, cta1Contrast } from "./colors";

export type DashboardShellTokens = {
  background: string;
  sidebarBackground: string;
  sidebarText: string;
  sidebarHover: string;
  sidebarActiveBackground: string;
  sidebarActiveText: string;
  sidebarSectionTitle: string;
  sidebarTitle: string;
  contentBackground: string;
  contentBorder: string;
  borderRadius: number;
  itemRadius: number;
  outerMargin: number;
  contentPadding: number;
  sidebarWidth: number;
  sidebarCompactWidth: number;
};

// Defaults en modo light. La app consume `resolveShellTokens(themeMode)`,
// que además varía por ancho de pantalla; estos defaults se usan como fallback.
export const shellTokens: DashboardShellTokens = {
  background: accent.background,
  sidebarBackground: accent.background,
  sidebarText: accent.text.secondary,
  sidebarHover: "rgba(255, 255, 255, 0.05)",
  sidebarActiveBackground: cta1,
  sidebarActiveText: cta1Contrast,
  sidebarSectionTitle: accent.text.secondary,
  sidebarTitle: accent.text.primary,
  contentBackground: background.default,
  contentBorder: accent.background,
  borderRadius: 20,
  itemRadius: 12,
  outerMargin: 16,
  contentPadding: 24,
  sidebarWidth: 256,
  sidebarCompactWidth: 76,
};

// Defaults en modo dark. La app consume `resolveShellTokens(themeMode)`;
// estos defaults se usan como fallback.
export const darkShellTokens: DashboardShellTokens = {
  background: accent.background,
  sidebarBackground: accent.background,
  sidebarText: accent.text.secondary,
  sidebarHover: "rgba(255, 255, 255, 0.06)",
  sidebarActiveBackground: cta1,
  sidebarActiveText: cta1Contrast,
  sidebarSectionTitle: accent.text.secondary,
  sidebarTitle: accent.text.primary,
  contentBackground: "#020617",
  contentBorder: accent.background,
  borderRadius: 20,
  itemRadius: 12,
  outerMargin: 16,
  contentPadding: 24,
  sidebarWidth: 256,
  sidebarCompactWidth: 76,
};
