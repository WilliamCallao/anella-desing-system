import { neutrals, brand } from "./basePalette";

// ============================================================
// Semantic Tokens
// Cada token semántico mapea a un token base (nombre de paleta).
// Para cambiar de tema, solo se cambia el mapa, no los componentes.
//
// Estructura: 3 contextos (default, light, darkness)
// Cada contexto tiene: bg, text, icon
// ============================================================

const PALETTE: Record<string, string> = {
  ...neutrals,
  ...brand,
};

// ── Tipos ───────────────────────────────────────────────────

export type ContextBgMap = { default: string; subtle: string };
export type ContextTextMap = { default: string; subtle: string; subtlest: string };
export type ContextIconMap = { default: string; subtle: string };
export type ContextMap = { bg: ContextBgMap; text: ContextTextMap; icon: ContextIconMap };

export type ContextBgTokens = { default: string; subtle: string };
export type ContextTextTokens = { default: string; subtle: string; subtlest: string };
export type ContextIconTokens = { default: string; subtle: string };
export type ContextTokens = { bg: ContextBgTokens; text: ContextTextTokens; icon: ContextIconTokens };

export type SemanticMap = {
  default: ContextMap;
  light: ContextMap;
  darkness: ContextMap;
};

export type SemanticTokens = {
  default: ContextTokens;
  light: ContextTokens;
  darkness: ContextTokens;
};

// ── Light mode ──────────────────────────────────────────────

export const lightSemantic: SemanticMap = {
  default: {
    bg:  { default: "N0",   subtle: "N100" },
    text: { default: "N950", subtle: "N500", subtlest: "N300" },
    icon: { default: "M600", subtle: "N500" },
  },
  light: {
    bg:  { default: "N200", subtle: "N0" },
    text: { default: "N950", subtle: "N500", subtlest: "N300" },
    icon: { default: "N600", subtle: "N500" },
  },
  darkness: {
    bg:  { default: "N950", subtle: "N900" },
    text: { default: "N0",   subtle: "N400", subtlest: "N600" },
    icon: { default: "N0",   subtle: "N400" },
  },
};

// ── Dark mode ───────────────────────────────────────────────

export const darkSemantic: SemanticMap = {
  default: {
    bg:  { default: "N950", subtle: "N900" },
    text: { default: "N0",   subtle: "N400", subtlest: "N600" },
    icon: { default: "N0",   subtle: "N400" },
  },
  light: {
    bg:  { default: "N800", subtle: "N950" },
    text: { default: "N0",   subtle: "N400", subtlest: "N600" },
    icon: { default: "N0",   subtle: "N400" },
  },
  darkness: {
    bg:  { default: "N950", subtle: "N900" },
    text: { default: "N0",   subtle: "N400", subtlest: "N600" },
    icon: { default: "N0",   subtle: "N400" },
  },
};

// ── Resolución ──────────────────────────────────────────────

function resolveCtx(map: ContextMap): ContextTokens {
  return {
    bg: {
      default: PALETTE[map.bg.default] ?? map.bg.default,
      subtle: PALETTE[map.bg.subtle] ?? map.bg.subtle,
    },
    text: {
      default: PALETTE[map.text.default] ?? map.text.default,
      subtle: PALETTE[map.text.subtle] ?? map.text.subtle,
      subtlest: PALETTE[map.text.subtlest] ?? map.text.subtlest,
    },
    icon: {
      default: PALETTE[map.icon.default] ?? map.icon.default,
      subtle: PALETTE[map.icon.subtle] ?? map.icon.subtle,
    },
  };
}

export function resolveSemantic(map: SemanticMap): SemanticTokens {
  return {
    default: resolveCtx(map.default),
    light: resolveCtx(map.light),
    darkness: resolveCtx(map.darkness),
  };
}

// ── Backward compat: text tokens globales ───────────────────

export type TextTokens = ContextTextTokens & { light: string };
export type TextMap = ContextTextMap & { light: string };

export const lightText: TextMap = { ...lightSemantic.default.text, light: "N0" };
export const darkText: TextMap = { ...darkSemantic.default.text, light: "N0" };

export function resolveText(map: TextMap): TextTokens {
  return {
    default: PALETTE[map.default] ?? map.default,
    subtle: PALETTE[map.subtle] ?? map.subtle,
    subtlest: PALETTE[map.subtlest] ?? map.subtlest,
    light: PALETTE[map.light] ?? map.light,
  };
}

// ── Backward compat: background legacy ──────────────────────

export type BackgroundMap = { default: string; subtle: string; subtlest: string };

export const lightBackground: BackgroundMap = {
  default: lightSemantic.default.bg.default,
  subtle: lightSemantic.default.bg.subtle,
  subtlest: lightSemantic.light.bg.default,
};

export const darkBackground: BackgroundMap = {
  default: darkSemantic.default.bg.default,
  subtle: darkSemantic.default.bg.subtle,
  subtlest: darkSemantic.light.bg.default,
};

export function resolveBackground(map: BackgroundMap): { default: string; subtle: string; subtlest: string } {
  return {
    default: PALETTE[map.default] ?? map.default,
    subtle: PALETTE[map.subtle] ?? map.subtle,
    subtlest: PALETTE[map.subtlest] ?? map.subtlest,
  };
}
