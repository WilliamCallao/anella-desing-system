import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TransitionView } from "@william-callao/antonella-animations";
import { Button, Card, Text } from "@william-callao/antonella-ui";
import { palette, spacing, text, TextType } from "@william-callao/antonella-theme";
import type { ComponentCategory } from "../types";

// --- TransitionView ---

function TransitionViewDemo() {
  const [step, setStep] = useState(0);

  const states = [
    {
      key: "short",
      bg: palette.success,
      title: "Resumen",
      body: "Todo en orden.",
    },
    {
      key: "tall",
      bg: palette.primary,
      title: "Reporte completo",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
      key: "warning",
      bg: palette.danger,
      title: "Alerta",
      body: "Revisá los datos ingresados, algo no cuadra.",
    },
  ];

  const current = states[step % states.length];

  return (
    <View style={styles.gap}>
      <TransitionView contentKey={current.key}>
        <Card style={[styles.card, { backgroundColor: current.bg }]}>
          <Text variant={TextType.Heading} color={text.inverse}>
            {current.title}
          </Text>
          <Text variant={TextType.Caption} color={palette.primary}>
            {current.body}
          </Text>
        </Card>
      </TransitionView>
      <Button label="Cambiar estado" onPress={() => setStep((s) => s + 1)} />
    </View>
  );
}

function TransitionViewHeightDemo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.gap}>
      <Button label={expanded ? "Colapsar" : "Expandir"} onPress={() => setExpanded((v) => !v)} />
      <TransitionView contentKey={expanded ? "tall" : "short"}>
        {expanded ? (
          <Card style={styles.card}>
            <Text variant={TextType.Heading}>Vista ampliada</Text>
            <Text variant={TextType.Caption} color={text.secondary}>
              Este contenido es más grande, por eso ocupa más altura. La animación de altura se mantiene
              fluida gracias al layout measurement de TransitionView.
            </Text>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text variant={TextType.Caption}>Contenido corto.</Text>
          </Card>
        )}
      </TransitionView>
    </View>
  );
}

export const animaciones: ComponentCategory = {
  id: "animaciones",
  title: "Animaciones",
  icon: "barn",
  components: [
    {
      id: "transition-view",
      name: "TransitionView",
      description: "Envuelve contenido de altura variable: anima height + fade in del contenido nuevo.",
      variants: [
        { id: "step", label: "Content swap", render: () => <TransitionViewDemo /> },
        { id: "height", label: "Height toggle", render: () => <TransitionViewHeightDemo /> },
      ],
    },
  ],
};

const styles = StyleSheet.create({
  gap: {
    gap: spacing.sm,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
});
