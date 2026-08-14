import { text } from "./colors";

/**
 * TextType — tipos de texto del DS, referenciables por nombre para no usar
 * strings sueltos. El tipo `TextType` (mismo nombre) es la unión de los
 * valores; en el código del DS se usa `TextType.X`, las apps pueden usar el
 * tipo con strings literales validados por el compilador.
 */
export const TextType = {
  Title: "title",
  Subtitle: "subtitle",
  Heading: "heading",
  Body: "body",
  BodyMedium: "bodyMedium",
  BodyBold: "bodyBold",
  Label: "label",
  Caption: "caption",
  CaptionMedium: "captionMedium",
  Overline: "overline",
  Placeholder: "placeholder",
} as const;

export type TextType = (typeof TextType)[keyof typeof TextType];

/**
 * Sistema de textos del DS. Cada tipo define el estilo tipográfico completo
 * (fontSize, fontWeight, lineHeight; opcional letterSpacing/textTransform)
 * más el color por defecto tomado del token `text` de colors.ts.
 *
 * ESCALA: alineada a la escala tipográfica oficial de iOS (HIG).
 * fuente del sistema: SF Pro en iOS / Roboto en Android.
 *
 * CASO DE USO (documentado por rol):
 * - title       : título de pantalla (headers de pantalla/categoría).
 * - subtitle    : subtítulo de pantalla / secciones grandes.
 * - heading     : encabezado de card / sección.
 * - bodyBold    : texto destacado en cards/listas, labels de botones.
 * - body        : texto base, valor de inputs.
 * - bodyMedium  : énfasis medio (chips, títulos de card).
 * - label       : labels de formularios (peso 600 por legibilidad).
 * - caption     : descripciones secundarias.
 * - captionMedium: caption con énfasis.
 * - overline    : micro-etiquetas (uppercase + letterSpacing 0.5).
 * - placeholder : placeholder de inputs (color `text.placeholder`).
 *
 * Uso: la app envía el tipo al componente `Text` (`<Text type={TextType.Title}>`)
 * y puede sobreescribir el color con la prop `color`.
 */
export const texts = {
  title: { fontSize: 28, fontWeight: "700", lineHeight: 34, color: text.default },
  subtitle: { fontSize: 22, fontWeight: "700", lineHeight: 28, color: text.default },
  heading: { fontSize: 20, fontWeight: "600", lineHeight: 25, color: text.default },
  bodyBold: { fontSize: 17, fontWeight: "600", lineHeight: 22, color: text.default },
  body: { fontSize: 17, fontWeight: "400", lineHeight: 22, color: text.default },
  bodyMedium: { fontSize: 16, fontWeight: "500", lineHeight: 21, color: text.default },
  label: { fontSize: 15, fontWeight: "600", lineHeight: 20, color: text.default },
  caption: { fontSize: 13, fontWeight: "400", lineHeight: 18, color: text.secondary },
  captionMedium: { fontSize: 13, fontWeight: "500", lineHeight: 18, color: text.secondary },
  overline: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: text.secondary,
  },
  placeholder: { fontSize: 17, fontWeight: "400", lineHeight: 22, color: text.placeholder },
} as const;
