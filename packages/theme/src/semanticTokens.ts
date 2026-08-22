import { neutrals, brand } from "./basePalette";

// ============================================================
// Semantic Tokens
// Cada token semántico mapea a un token base (nombre de paleta).
// Para cambiar de tema, solo se cambia el mapa, no los componentes.
// ============================================================

const PALETTE: Record<string, string> = {
  ...neutrals,
  ...brand,
};

// ── Background ──────────────────────────────────────────────

export type BackgroundTokens = {
  default: string;
  subtle: string;
  subtlest: string;
};

export type BackgroundMap = {
  [K in keyof BackgroundTokens]: string;
};

export const lightBackground: BackgroundMap = {
  default: "N0",    // #FFFFFF
  subtle: "N50",    // #F5F7FA
  subtlest: "N100", // #ECEEF3
};

export const darkBackground: BackgroundMap = {
  default: "N950",  // #0A1019
  subtle: "N900",   // #111A28
  subtlest: "N800", // #1A2435
};

// ── Background Darkness ─────────────────────────────────────

export type BackgroundDarknessTokens = {
  /** Fondo oscuro principal (sidebar, headers) */
  default: string;
  /** Superficie oscura (cards sobre fondo oscuro) */
  surface: string;
};

export type BackgroundDarknessMap = {
  [K in keyof BackgroundDarknessTokens]: string;
};

export const lightBackgroundDarkness: BackgroundDarknessMap = {
  default: "N950",  // #0A1019
  surface: "N900",  // #111A28
};

export const darkBackgroundDarkness: BackgroundDarknessMap = {
  default: "N950",  // #0A1019
  surface: "N900",  // #111A28
};

// ── Text ────────────────────────────────────────────────────

export type TextTokens = {
  /** Texto principal (oscuro en light, claro en dark) */
  default: string;
  /** Texto sutil (gris en light, gris claro en dark) */
  subtle: string;
  /** Texto claro para fondos oscuros (claro en ambos modos) */
  light: string;
};

export type TextMap = {
  [K in keyof TextTokens]: string;
};

export const lightText: TextMap = {
  default: "N950",  // #0A1019  (oscuro sobre fondo blanco)
  subtle: "N500",   // #5C6A80  (gris suave)
  light: "N0",      // #FFFFFF  (para fondos oscuros)
};

export const darkText: TextMap = {
  default: "N0",    // #FFFFFF  (claro sobre fondo oscuro)
  subtle: "N400",   // #6B7A90  (gris claro)
  light: "N0",      // #FFFFFF  (para fondos oscuros)
};

// ── Resolución ──────────────────────────────────────────────

function resolve<T extends Record<string, string>>(map: T): { [K in keyof T]: string } {
  const result = {} as { [K in keyof T]: string };
  for (const key of Object.keys(map) as (keyof T)[]) {
    result[key] = PALETTE[map[key]] ?? map[key];
  }
  return result;
}

export function resolveBackground(map: BackgroundMap): BackgroundTokens {
  return resolve(map);
}

export function resolveBackgroundDarkness(map: BackgroundDarknessMap): BackgroundDarknessTokens {
  return resolve(map);
}

export function resolveText(map: TextMap): TextTokens {
  return resolve(map);
}

// ── Listing de todos los tokens semánticos ───────────────────

export type SemanticTokenEntry = {
  key: string;
  label: string;
  baseToken: string;
  hex: string;
};

export type SemanticGroup = {
  name: string;
  tokens: SemanticTokenEntry[];
};

export function getSemanticGroups(
  bgMap: BackgroundMap,
  bgDarknessMap: BackgroundDarknessMap,
  textMap: TextMap
): SemanticGroup[] {
  const resolvedBg = resolveBackground(bgMap);
  const resolvedBgDarkness = resolveBackgroundDarkness(bgDarknessMap);
  const resolvedText = resolveText(textMap);
  return [
    {
      name: "Background",
      tokens: [
        { key: "default", label: "default", baseToken: bgMap.default, hex: resolvedBg.default },
        { key: "subtle", label: "subtle", baseToken: bgMap.subtle, hex: resolvedBg.subtle },
        { key: "subtlest", label: "subtlest", baseToken: bgMap.subtlest, hex: resolvedBg.subtlest },
      ],
    },
    {
      name: "Background Darkness",
      tokens: [
        { key: "default", label: "default", baseToken: bgDarknessMap.default, hex: resolvedBgDarkness.default },
        { key: "surface", label: "surface", baseToken: bgDarknessMap.surface, hex: resolvedBgDarkness.surface },
      ],
    },
    {
      name: "Text",
      tokens: [
        { key: "default", label: "default", baseToken: textMap.default, hex: resolvedText.default },
        { key: "subtle", label: "subtle", baseToken: textMap.subtle, hex: resolvedText.subtle },
        { key: "light", label: "light", baseToken: textMap.light, hex: resolvedText.light },
      ],
    },
  ];
}
