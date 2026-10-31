import { space, spacing } from "@william-callao/antonella-theme";

/**
 * Escala tipográfica de la familia `card-form`: un paso por debajo de `body`
 * (17) para que el label y el valor no compitan con el título del sheet. El
 * peso lo aporta cada variante (`label` 600, `value` 400).
 */
export const CARD_TEXT = { fontSize: 15, lineHeight: 19, letterSpacing: -0.1 } as const;

/** Alto de una línea = interlineado real del valor (nunca un número mágico). */
export const SINGLE_LINE_HEIGHT = CARD_TEXT.lineHeight;

/**
 * Métricas compartidas de una fila de `card-form` (input, selector, área y
 * lectura). Una sola fuente para que las filas de un formulario midan igual.
 */
export const CARD_ROW = {
  minHeight: SINGLE_LINE_HEIGHT + space.space4 * 2,
  paddingHorizontal: space.space4,
  paddingVertical: space.space4,
  gap: spacing.md,
} as const;

/** Mensaje de error de campo: mismo tamaño en toda la familia. */
export const CARD_ERROR_TEXT = { fontSize: 14, lineHeight: 18 } as const;

/**
 * Contenedor del error: pegado a su fila y con aire antes del divisor de la
 * próxima fila.
 */
export const CARD_ERROR = {
  marginTop: -spacing.sm,
  paddingHorizontal: space.space4,
  paddingBottom: spacing.md,
  ...CARD_ERROR_TEXT,
  textAlign: "left",
} as const;
