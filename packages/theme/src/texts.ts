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
 * Los tamaños respetan la escala histórica de la app (appInputCard):
 * label 15 / value 14 / placeholder 14.
 *
 * Uso: la app envía el tipo al componente `Text` (`<Text type={TextType.Title}>`)
 * y puede sobreescribir el color con la prop `color`.
 */
export const texts = {
  title: { fontSize: 18, fontWeight: "700", lineHeight: 24, color: text.default },
  subtitle: { fontSize: 18, fontWeight: "600", lineHeight: 24, color: text.default },
  heading: { fontSize: 16, fontWeight: "600", lineHeight: 22, color: text.default },
  body: { fontSize: 14, fontWeight: "400", lineHeight: 20, color: text.default },
  bodyMedium: { fontSize: 14, fontWeight: "500", lineHeight: 20, color: text.default },
  bodyBold: { fontSize: 14, fontWeight: "600", lineHeight: 20, color: text.default },
  label: { fontSize: 15, fontWeight: "600", lineHeight: 20, color: text.default },
  caption: { fontSize: 12, fontWeight: "400", lineHeight: 16, color: text.secondary },
  captionMedium: { fontSize: 12, fontWeight: "500", lineHeight: 16, color: text.secondary },
  overline: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: text.secondary,
  },
  placeholder: { fontSize: 14, fontWeight: "400", lineHeight: 20, color: text.placeholder },
} as const;
