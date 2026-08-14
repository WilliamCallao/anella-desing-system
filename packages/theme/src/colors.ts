export const palette = {
  primary: "#007AFF",
  primaryDark: "#0A84FF",
  background: "#F2F2F7",
  surface: "#FFFFFF",
  border: "#E5E5EA",
  text: "#000000",
  textMuted: "#8E8E93",
  danger: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
} as const;

export const darkPalette = {
  primary: "#0A84FF",
  primaryDark: "#007AFF",
  background: "#000000",
  surface: "#1C1C1E",
  border: "#2C2C2E",
  text: "#FFFFFF",
  textMuted: "#98989F",
  danger: "#FF453A",
  success: "#30D158",
  warning: "#FF9F0A",
} as const;

// ============================================================
// App colors (iOS-like rebranding)
// ============================================================

/**
 * CTA1 — color de llamada a la acción / elemento destacado.
 * USO: fondo de elementos CTA (ej. opción activa del sidebar).
 * REGLA: sobre CTA1, el contenido (texto e íconos) se pinta SIEMPRE con `cta1Contrast`.
 */
export const cta1 = "#007AFF";
export const cta1Contrast = "#FFFFFF";

/**
 * Accent — superficie oscura de marca (sidebar, headers).
 * REGLA: sobre `accent.background` solo se usan `accent.icon.*` para íconos
 * y `accent.text.*` para textos. Nunca colores de card/background sobre accent.
 */
export const accent = {
  background: "#1C1C1E",
  icon: {
    primary: "#F2F2F7",
    secondary: "#98989F",
  },
  text: {
    primary: "#F2F2F7",
    secondary: "#A1A1A6",
  },
} as const;

/**
 * Fondo de pantalla base.
 * REGLA: sobre `background.default` se pintan `background.content.*`
 * cuando el contenido va directo sobre el fondo (sin card).
 * `background.skeleton` es el tono de los placeholders de carga: un poco
 * más oscuro que `default` para que combine y se distinga sobre el shell.
 */
export const background = {
  default: "#F2F2F7",
  subtle: "#dadadaff",
  surface: "#FFFFFFFF",
  content: {
    primary: "#F2F2F7",
    secondary: "#8E8E93",
  },
  skeleton: "#E5E5EA",
} as const;

/**
 * Texto — colores centralizados de texto del sistema de textos (`texts.ts`).
 * REGLA: todo texto se pinta con un color de `text`; sobre superficies oscuras
 * usar `text.inverse`.
 */
export const text = {
  default: "#000000",
  secondary: "#8E8E93",
  subtle: "#8E8E93",
  placeholder: "#C7C7CC",
  inverse: "#FFFFFF",
} as const;

/**
 * Card — tarjetas que flotan sobre `background.default`.
 * REGLA: una card se pinta con fondo `card.background` y su texto con `card.text.*`.
 */
export const card = {
  background: "#FFFFFF",
  text: {
    primary: text.default,
    secondary: text.secondary,
  },
} as const;

export const border = {
  divider:{
    secondary: "#E5E5EA" // usadp spbre backgrouf surface
  } ,
  surface: "#FFFFFF", //
  content: {
    primary: "#F2F2F7",
    secondary: "#8E8E93",
  },
  skeleton: "#E5E5EA",
} as const;

/**
 * AppInput — campos de texto estilo iOS (relleno gris redondeado, sin borde).
 * Usado por `Input` y `TextField`.
 * REGLA: sobre `appInput.background` se pinta texto `appInput.text`; el placeholder
 * `appInput.placeholder`; el mensaje de error `appInput.error`.
 */
export const appInput = {
  background: background.content.primary, // #F2F2F7 (systemGray6)
  text: text.default,                     // #000000 (label)
  placeholder: text.placeholder,          // #C7C7CC (systemGray3)
  error: palette.danger,                  // #FF3B30 (systemRed)
} as const;

/**
 * AppFormCard — grupo de campos de formulario estilo iOS (inset grouped).
 * REGLA: el contenedor se pinta con `appInputCard.background.default` (blanco
 * puro) y las filas se separan con `appInputCard.separator` (gris claro,
 * hairline, no de borde a borde). Los textos usan `appInputCard.text.*`:
 * label a la izquierda (semibold, más grande) y valor a la derecha.
 */
export const appInputCard = {
  background: {
    default: "#FFFFFF",
  },
  border: "#D1D1D6",
  separator: "#E5E5EA",
  text: {
    label: text.default,
    value: text.secondary,
    placeholder: text.placeholder,
  },
} as const;

/**
 * AppButton — botón estilo AppFormCard (inset grouped).
 * REGLA: fondo CTA azul (cta1) por defecto con texto en contraste; en estado
 * disabled se pinta un gris sólido legible con el texto en gris medio.
 */
export const appButton = {
  background: {
    default: cta1,
    disabled: "#E5E5EA",
  },
  text: {
    default: cta1Contrast,
    disabled: "#98989F",
  },
} as const;
