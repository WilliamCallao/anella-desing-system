import { StyleSheet, View } from "react-native";
import { AppTextHeader, Text } from "@antonella/ui";
import { text, texts, TextType } from "@antonella/theme";
import type { ComponentCategory } from "../types";

const TYPE_ENTRIES: {
  type: TextType;
  ios: string;
  weight: string;
  usage: string;
}[] = [
  { type: TextType.Title, ios: "Title 1", weight: "Bold", usage: "Título de pantalla" },
  { type: TextType.Subtitle, ios: "Title 2", weight: "Bold", usage: "Subtítulo de pantalla / secciones grandes" },
  { type: TextType.Heading, ios: "Title 3", weight: "Semibold", usage: "Encabezado de card / sección" },
  { type: TextType.BodyBold, ios: "Headline", weight: "Semibold", usage: "Texto destacado en cards / botones" },
  { type: TextType.Body, ios: "Body", weight: "Regular", usage: "Texto base, valor de inputs" },
  { type: TextType.BodyMedium, ios: "Callout", weight: "Medium", usage: "Énfasis medio (chips, títulos de card)" },
  { type: TextType.Label, ios: "Subheadline", weight: "Semibold", usage: "Labels de formularios" },
  { type: TextType.Caption, ios: "Footnote", weight: "Regular", usage: "Descripciones secundarias" },
  { type: TextType.CaptionMedium, ios: "—", weight: "Medium", usage: "Caption con énfasis" },
  { type: TextType.Overline, ios: "Caption 2", weight: "Semibold", usage: "Micro-etiquetas (uppercase)" },
  { type: TextType.Placeholder, ios: "Body", weight: "Regular", usage: "Placeholder de inputs" },
];

function TypeSample({ entry }: { entry: (typeof TYPE_ENTRIES)[number] }) {
  const style = texts[entry.type];
  return (
    <View style={styles.sample}>
      <Text variant={entry.type}>Antonella {entry.ios}</Text>
      <Text variant={TextType.Caption} color={text.secondary}>
        {entry.type} · {style.fontSize}/{style.fontWeight} · {entry.weight} — {entry.usage}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sample: {
    gap: 4,
  },
});

export const tipografia: ComponentCategory = {
  id: "tipografia",
  title: "Textos",
  icon: "document-text",
  components: [
    {
      id: "escala",
      name: "Escala de texto (iOS)",
      description: "Los 11 tipos del DS con su equivalente iOS, tamaño/peso y caso de uso.",
      variants: TYPE_ENTRIES.map((entry) => ({
        id: entry.type,
        label: `${entry.type} · ${entry.ios}`,
        render: () => <TypeSample entry={entry} />,
      })),
    },
    {
      id: "app-text-header",
      name: "AppTextHeader",
      description: "Encabezado simple: heading + caption.",
      variants: [
        {
          id: "con-caption",
          label: "Con caption",
          render: () => <AppTextHeader heading="Resumen de la semana" caption="Últimos 7 días · 3 reportes" />,
        },
        {
          id: "solo-heading",
          label: "Solo heading",
          render: () => <AppTextHeader heading="Inventario" />,
        },
      ],
    },
  ],
};
