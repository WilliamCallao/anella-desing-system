export const palette = {
  primary: "#007AFF",
  primaryDark: "#0062E6",
  background: "#F2F2F7",
  surface: "#FAFAFC",
  border: "#E5E5EA",
  text: "#1C1C1E",
  textMuted: "#8E8E93",
  danger: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
} as const;

export const darkPalette = {
  primary: "#4DA3FF",
  primaryDark: "#007AFF",
  background: "#000000",
  surface: "#1C1C1E",
  border: "#2C2C2E",
  text: "#F5F5F7",
  textMuted: "#98989F",
  danger: "#FF6369",
  success: "#46C88C",
  warning: "#FFC043",
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
  default: "#EAE9EE",
  surface: "#F6F6F6",
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
  default: "#1C1C1E",
  secondary: "#6E6E73",
  subtle: "#8E8E93",
  placeholder: "#C7C7CC",
  inverse: "#FFFFFF",
} as const;

/**
 * Card — tarjetas que flotan sobre `background.default`.
 * REGLA: una card se pinta con fondo `card.background` y su texto con `card.text.*`.
 */
export const card = {
  background: "#FCFCFE",
  text: {
    primary: text.default,
    secondary: text.secondary,
  },
} as const;

export const border = {
  divider:{
    secondary: "#EEEEEE" // usadp spbre backgrouf surface
  } ,
  surface: "#FFFFFF", //
  content: {
    primary: "#F2F2F7",
    secondary: "#8E8E93",
  },
  skeleton: "#E5E5EA",
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
    value: "#3A3A3C",
    placeholder: text.placeholder,
  },
} as const;

/**
 * AppButton — botón estilo AppFormCard (inset grouped).
 * REGLA: fondo oscuro (casi negro) por defecto con texto claro; en estado
 * disabled se pinta un gris claro con el texto en gris placeholder.
 */
export const appButton = {
  background: {
    default: "#111827",
    disabled: "#F2F2F7",
  },
  text: {
    default: "#FFFFFF",
    disabled: "#C7C7CC",
  },
} as const;
