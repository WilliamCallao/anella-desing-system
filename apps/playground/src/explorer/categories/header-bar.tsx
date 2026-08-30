import React from "react";
import { StyleSheet, View } from "react-native";
import { HeaderBar, HeaderBarStyle } from "@william-callao/antonella-ui";
import { resolveSemantic, lightSemantic } from "@william-callao/antonella-theme";
import type { ComponentCategory } from "../types";

const _s = resolveSemantic(lightSemantic);

function HeaderBarDefaultDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.default.bg.default, borderRadius: 16, padding: 12 }]}>
      <HeaderBar title="Inicio" style={HeaderBarStyle.DEFAULT} onMenuPress={() => {}} />
      <HeaderBar
        title="Reportes"
        description="Resumen del mes en curso"
        style={HeaderBarStyle.DEFAULT}
        onMenuPress={() => {}}
      />
    </View>
  );
}

function HeaderBarDarknessDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.darkness.bg.default, borderRadius: 16, padding: 12 }]}>
      <HeaderBar title="Inicio" style={HeaderBarStyle.DARKNESS} onMenuPress={() => {}} />
      <HeaderBar
        title="Reportes"
        description="Resumen del mes en curso"
        style={HeaderBarStyle.DARKNESS}
        onMenuPress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});

export const headerBar: ComponentCategory = {
  id: "header-bar",
  title: "HeaderBar",
  icon: "menu",
  components: [
    {
      id: "default",
      name: "DEFAULT",
      description: "Barra superior con botón de menú y título centrado.",
      variants: [
        { id: "all", label: "Default", render: () => <HeaderBarDefaultDemo /> },
      ],
    },
    {
      id: "darkness",
      name: "DARKNESS",
      description: "Variante sobre fondo oscuro (tokens darkness).",
      variants: [
        { id: "all", label: "Darkness", render: () => <HeaderBarDarknessDemo /> },
      ],
    },
  ],
};
