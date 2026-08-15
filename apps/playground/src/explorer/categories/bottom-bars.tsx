import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppButton, Dock, type DockItem, Text } from "@antonella/ui";
import type { ComponentCategory } from "../types";
import { demoStyles } from "./shared";
import { background, radius, spacing } from "@antonella/theme";

const DOCK_ITEMS: DockItem[] = [
  { icon: "home", label: "Inicio" },
  { icon: "bar-chart", label: "Reportes" },
  { icon: "settings", label: "Ajustes" },
];

function DockDemo() {
  const [visible, setVisible] = useState(true);
  const [selected, setSelected] = useState(0);
  return (
    <View style={demoStyles.gap}>
      <AppButton
        label={visible ? "Ocultar dock" : "Mostrar dock"}
        variant="ghost"
        onPress={() => setVisible((v) => !v)}
      />
      <View style={styles.canvas}>
        <View style={styles.canvasHeader}>
          <Text variant="heading">Vista previa</Text>
          <Text variant="caption" color="#8E8E93">
            El dock flota sobre la pantalla, separado de los bordes.
          </Text>
        </View>
        <Dock
          visible={visible}
          items={DOCK_ITEMS}
          selectedIndex={selected}
          onSelect={setSelected}
          style={styles.dockPreview}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    height: 320,
    backgroundColor: background.default,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  canvasHeader: {
    padding: spacing.md,
    gap: 2,
  },
  dockPreview: {
    bottom: spacing.md,
  },
});

export const bottomBars: ComponentCategory = {
  id: "bottom-bars",
  title: "Bottom bars",
  icon: "menu",
  components: [
    {
      id: "dock",
      name: "Dock",
      description:
        "Overlay flotante con íconos horizontales. El seleccionado se expande mostrando su nombre, en color de la app.",
      variants: [{ id: "open", label: "Abrir", render: () => <DockDemo /> }],
    },
  ],
};
