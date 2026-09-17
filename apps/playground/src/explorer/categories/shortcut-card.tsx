import React from "react";
import { StyleSheet, View } from "react-native";
import { ShortcutCard, ShortcutCardStyle, type ShortcutItem } from "@william-callao/antonella-ui";
import { neutrals, radius, space } from "@william-callao/antonella-theme";
import type { ComponentCategory } from "../types";
import { noop } from "./shared";

const SURFACE_COLOR: Record<ShortcutCardStyle, string> = {
  [ShortcutCardStyle.DEFAULT]: neutrals.N0,
  [ShortcutCardStyle.LIGHT]: neutrals.N200,
  [ShortcutCardStyle.DARKNESS]: neutrals.N950,
};

const SHORTCUTS: ShortcutItem[] = [
  { icon: "camera", label: "Escanear", onPress: noop },
  { icon: "cart", label: "Crear pedido", onPress: noop },
  { icon: "palette", label: "Colores", onPress: noop },
];

function ShortcutCardDemo({ style }: { style: ShortcutCardStyle }) {
  return (
    <View style={[styles.surface, { backgroundColor: SURFACE_COLOR[style] }]}>
      <ShortcutCard shortcuts={SHORTCUTS} style={style} />
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: radius.lg,
    padding: space.space4,
  },
});

export const shortcutCard: ComponentCategory = {
  id: "shortcutCard",
  title: "ShortcutCard",
  icon: "flash",
  components: [
    {
      id: "shortcut-card",
      name: "ShortcutCard",
      description:
        "Una sola card que contiene una fila de atajos separados por divisor: cada uno con círculo del color de fondo, ícono tipado en el medio y nombre debajo.",
      variants: [
        {
          id: "default",
          label: "Default",
          render: () => <ShortcutCardDemo style={ShortcutCardStyle.DEFAULT} />,
        },
        {
          id: "light",
          label: "Light",
          render: () => <ShortcutCardDemo style={ShortcutCardStyle.LIGHT} />,
        },
        {
          id: "darkness",
          label: "Darkness",
          render: () => <ShortcutCardDemo style={ShortcutCardStyle.DARKNESS} />,
        },
      ],
    },
  ],
};