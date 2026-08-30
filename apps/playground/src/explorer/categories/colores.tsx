import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@william-callao/antonella-ui";
import type { ComponentCategory } from "../types";
import { demoStyles } from "./shared";
import {
  palette,
  background,
  text,
  card,
  border,
  accent,
  cta1,
  cta1Contrast,
  appInput,
  appInputCard,
  appButton,
  neutrals,
  brand,
  success,
  warning,
  danger,
} from "@william-callao/antonella-theme";

type ColorSwatch = {
  name: string;
  value: string;
};

function Swatch({ name, value }: ColorSwatch) {
  return (
    <View style={styles.swatch}>
      <View style={[styles.colorBox, { backgroundColor: value }]} />
      <View style={styles.swatchInfo}>
        <Text variant="caption" color="#8E8E93">
          {name}
        </Text>
        <Text variant="caption" style={styles.hexValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ColorSection({ title, colors }: { title: string; colors: ColorSwatch[] }) {
  return (
    <View style={demoStyles.gap}>
      <Text variant="heading">{title}</Text>
      <View style={styles.grid}>
        {colors.map((c) => (
          <Swatch key={c.name} name={c.name} value={c.value} />
        ))}
      </View>
    </View>
  );
}

function ColorsDemo() {
  return (
    <View style={demoStyles.gap}>
      <ColorSection
        title="Palette"
        colors={[
          { name: "primary", value: palette.primary },
          { name: "primaryDark", value: palette.primaryDark },
          { name: "background", value: palette.background },
          { name: "surface", value: palette.surface },
          { name: "border", value: palette.border },
          { name: "text", value: palette.text },
          { name: "textMuted", value: palette.textMuted },
          { name: "danger", value: palette.danger },
          { name: "success", value: palette.success },
          { name: "warning", value: palette.warning },
        ]}
      />

      <ColorSection
        title="Background"
        colors={[
          { name: "default", value: background.default },
          { name: "subtle", value: background.subtle },
          { name: "surface", value: background.surface },
          { name: "content.primary", value: background.content.primary },
          { name: "content.secondary", value: background.content.secondary },
          { name: "skeleton", value: background.skeleton },
        ]}
      />

      <ColorSection
        title="Text"
        colors={[
          { name: "default", value: text.default },
          { name: "secondary", value: text.secondary },
          { name: "subtle", value: text.subtle },
          { name: "placeholder", value: text.placeholder },
          { name: "inverse", value: text.inverse },
        ]}
      />

      <ColorSection
        title="CTA"
        colors={[
          { name: "cta1", value: cta1 },
          { name: "cta1Contrast", value: cta1Contrast },
        ]}
      />

      <ColorSection
        title="Card"
        colors={[
          { name: "background", value: card.background },
          { name: "text.primary", value: card.text.primary },
          { name: "text.secondary", value: card.text.secondary },
        ]}
      />

      <ColorSection
        title="Border"
        colors={[
          { name: "divider.secondary", value: border.divider.secondary },
          { name: "surface", value: border.surface },
          { name: "content.primary", value: border.content.primary },
          { name: "content.secondary", value: border.content.secondary },
          { name: "skeleton", value: border.skeleton },
        ]}
      />

      <ColorSection
        title="Accent"
        colors={[
          { name: "background", value: accent.background },
          { name: "icon.primary", value: accent.icon.primary },
          { name: "icon.secondary", value: accent.icon.secondary },
          { name: "text.primary", value: accent.text.primary },
          { name: "text.secondary", value: accent.text.secondary },
        ]}
      />

      <ColorSection
        title="App Input"
        colors={[
          { name: "background", value: appInput.background },
          { name: "text", value: appInput.text },
          { name: "placeholder", value: appInput.placeholder },
          { name: "error", value: appInput.error },
        ]}
      />

      <ColorSection
        title="App Input Card"
        colors={[
          { name: "background", value: appInputCard.background.default },
          { name: "border", value: appInputCard.border },
          { name: "separator", value: appInputCard.separator },
          { name: "text.label", value: appInputCard.text.label },
          { name: "text.value", value: appInputCard.text.value },
          { name: "text.placeholder", value: appInputCard.text.placeholder },
        ]}
      />

      <ColorSection
        title="App Button"
        colors={[
          { name: "background.default", value: appButton.background.default },
          { name: "background.disabled", value: appButton.background.disabled },
          { name: "text.default", value: appButton.text.default },
          { name: "text.disabled", value: appButton.text.disabled },
        ]}
      />

      <ColorSection
        title="Neutrals"
        colors={Object.entries(neutrals).map(([key, value]) => ({
          name: key,
          value,
        }))}
      />

      <ColorSection
        title="Brand"
        colors={Object.entries(brand).map(([key, value]) => ({
          name: key,
          value,
        }))}
      />

      <ColorSection
        title="Success"
        colors={Object.entries(success).map(([key, value]) => ({
          name: key,
          value,
        }))}
      />

      <ColorSection
        title="Warning"
        colors={Object.entries(warning).map(([key, value]) => ({
          name: key,
          value,
        }))}
      />

      <ColorSection
        title="Danger"
        colors={Object.entries(danger).map(([key, value]) => ({
          name: key,
          value,
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  swatch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 8,
    minWidth: 180,
  },
  colorBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E5EA",
  },
  swatchInfo: {
    flex: 1,
    gap: 1,
  },
  hexValue: {
    fontFamily: "monospace",
    fontSize: 11,
  },
});

export const colores: ComponentCategory = {
  id: "colores",
  title: "Colores",
  icon: "analytics",
  components: [
    {
      id: "palette",
      name: "Tokens de color",
      description:
        "Todos los tokens de color del design system: palette, background, text, card, border, accent, CTA, inputs, neutrals, brand, success, warning y danger.",
      variants: [{ id: "all", label: "Ver todos", render: () => <ColorsDemo /> }],
    },
  ],
};
