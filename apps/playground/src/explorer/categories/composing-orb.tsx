import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppButton, ComposingOrb, Text } from "@william-callao/antonella-ui";
import type { ComponentCategory } from "../types";
import { demoStyles } from "./shared";
import { radius, spacing } from "@william-callao/antonella-theme";
import { useFocusEffect } from "expo-router";

function useFocused(): boolean {
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  return focused;
}

function Sizes() {
  const focused = useFocused();
  return (
    <View style={demoStyles.gap}>
      <View style={styles.sizeRow}>
        {[20, 36, 64, 96, 128].map((size) => (
          <View key={size} style={styles.cell}>
            <ComposingOrb size={size} paused={!focused} />
            <Text variant="caption">{size}px</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Backgrounds() {
  const focused = useFocused();
  return (
    <View style={demoStyles.gap}>
      <View style={styles.bgRow}>
        <View style={[styles.bgCard, styles.bgLight]}>
          <ComposingOrb size={96} color="#000000" paused={!focused} />
          <Text variant="caption">Fondo claro · orb negro</Text>
        </View>
        <View style={[styles.bgCard, styles.bgDark]}>
          <ComposingOrb size={96} paused={!focused} />
          <Text variant="caption" color="#FFFFFF">
            Fondo oscuro · orb blanco
          </Text>
        </View>
      </View>
      <Text variant="caption" color="#8E8E93">
        El fondo es transparente, así que el orb adopta cualquier superficie.
        Usá color="#000000" sobre fondos claros y el blanco por defecto sobre
        los oscuros.
      </Text>
    </View>
  );
}

function PauseDemo() {
  const focused = useFocused();
  const [manualPaused, setManualPaused] = useState(false);
  const paused = !focused || manualPaused;
  return (
    <View style={demoStyles.gap}>
      <View style={styles.cycleRow}>
        <ComposingOrb size={96} paused={paused} />
        <View style={styles.info}>
          <Text variant="heading">Pausa</Text>
          <Text variant="caption" color="#8E8E93">
            El orb se pausa solo al salir de la pantalla (no consume frames
            de fondo). El botón prueba la pausa manual sin navegar.
          </Text>
        </View>
      </View>
      <AppButton
        label={paused ? "Orb pausado" : "Pausar orb"}
        variant={paused ? "solid" : "ghost"}
        onPress={() => setManualPaused((p) => !p)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 100,
    alignItems: "center",
    gap: spacing.sm,
  },
  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    alignItems: "flex-end",
  },
  cycleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  bgRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  bgCard: {
    flex: 1,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  bgLight: {
    backgroundColor: "#F2F2F7",
  },
  bgDark: {
    backgroundColor: "#1C1C1E",
  },
  info: {
    flex: 1,
    gap: 2,
  },
});

export const composingOrb: ComponentCategory = {
  id: "composing-orb",
  title: "Composing orb",
  icon: "analytics",
  components: [
    {
      id: "sizes",
      name: "Tamaños",
      description:
        "El orb de composición en blanco puro sobre fondo transparente, extraído de thinking-orbs (MIT) sin la librería.",
      variants: [{ id: "sizes", label: "Demo", render: () => <Sizes /> }],
    },
    {
      id: "backgrounds",
      name: "Fondos",
      description:
        "El mismo orb en blanco sobre fondo oscuro y en negro sobre fondo claro.",
      variants: [{ id: "backgrounds", label: "Demo", render: () => <Backgrounds /> }],
    },
    {
      id: "pause",
      name: "Pausa",
      description:
        "La animación corre en el UI thread con Skia + Reanimated; se pausa al perder foco para no consumir frames de fondo.",
      variants: [{ id: "pause", label: "Demo", render: () => <PauseDemo /> }],
    },
  ],
};
