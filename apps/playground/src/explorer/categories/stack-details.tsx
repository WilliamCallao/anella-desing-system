import React from "react";
import { StyleSheet, View } from "react-native";
import { StackDetails, StackDetailsStyle } from "@william-callao/antonella-ui";
import { resolveSemantic, lightSemantic } from "@william-callao/antonella-theme";
import type { ComponentCategory } from "../types";

const _s = resolveSemantic(lightSemantic);

const rows = [
  { label: "Inventario", value: "1101 Mercaderías" },
  { label: "Ventas", value: "4101 Ventas" },
  { label: "Costo", value: "5101 CMV", onPress: () => {} },
];

function StackDetailsDefaultDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.default.bg.default, borderRadius: 16, padding: 12 }]}>
      <StackDetails rows={rows} style={StackDetailsStyle.DEFAULT} />
    </View>
  );
}

function StackDetailsLightDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.light.bg.default, borderRadius: 16, padding: 12 }]}>
      <StackDetails rows={rows} style={StackDetailsStyle.LIGHT} />
    </View>
  );
}

function StackDetailsDarknessDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.darkness.bg.default, borderRadius: 16, padding: 12 }]}>
      <StackDetails rows={rows} style={StackDetailsStyle.DARKNESS} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
});

export const stackDetails: ComponentCategory = {
  id: "stack-details",
  title: "StackDetails",
  icon: "checklist",
  components: [
    {
      id: "default",
      name: "DEFAULT",
      description: "Card de filas clave-valor compactas con la forma del detalle de categoría.",
      variants: [
        { id: "all", label: "StackDetails", render: () => <StackDetailsDefaultDemo /> },
      ],
    },
    {
      id: "light",
      name: "LIGHT",
      description: "Card de filas clave-valor compactas con la forma del detalle de categoría.",
      variants: [
        { id: "all", label: "StackDetails", render: () => <StackDetailsLightDemo /> },
      ],
    },
    {
      id: "darkness",
      name: "DARKNESS",
      description: "Filas presionables muestran chevron (la fila \"Costo\" lo tiene).",
      variants: [
        { id: "all", label: "StackDetails", render: () => <StackDetailsDarknessDemo /> },
      ],
    },
  ],
};