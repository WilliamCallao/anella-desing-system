import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppButton, AppIcon, Dock, type DockItem, Text } from "@william-callao/antonella-ui";
import type { ComponentCategory } from "../types";
import { demoStyles } from "./shared";
import { background, radius, spacing } from "@william-callao/antonella-theme";

const DOCK_ITEMS: DockItem[] = [
  { icon: AppIcon.Home, label: "Inicio" },
  { icon: AppIcon.Reportes, label: "Reportes" },
  { icon: AppIcon.Configuracion, label: "Ajustes" },
];

function DockDemo() {
  const [visible, setVisible] = useState(true);
  const [selected, setSelected] = useState(0);
  const [agent, setAgent] = useState(false);
  return (
    <View style={demoStyles.gap}>
      <View style={demoStyles.row}>
        <AppButton
          label={visible ? "Ocultar dock" : "Mostrar dock"}
          variant="ghost"
          onPress={() => setVisible((v) => !v)}
        />
        <AppButton
          label={agent ? "Modo agente: activo" : "Activar modo agente"}
          variant={agent ? "solid" : "ghost"}
          onPress={() => setAgent((a) => !a)}
        />
      </View>
      <View style={styles.canvas}>
        <View style={styles.canvasHeader}>
          <Text variant="heading">Vista previa</Text>
          <Text variant="caption" color="#8E8E93">
            El dock flota sobre la pantalla. Con modo agente, el orb de
            composición aparece a la derecha.
          </Text>
        </View>
        <Dock
          visible={visible}
          items={DOCK_ITEMS}
          selectedIndex={selected}
          onSelect={setSelected}
          agentMode={agent}
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
        "Overlay flotante con íconos horizontales. El seleccionado se expande mostrando su nombre, en color de la app. Con agentMode, el orb de composición se muestra a la derecha.",
      variants: [{ id: "open", label: "Abrir", render: () => <DockDemo /> }],
    },
  ],
};
