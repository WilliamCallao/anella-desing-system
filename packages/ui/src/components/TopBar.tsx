import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { space } from "@william-callao/antonella-theme";

// ── Props ───────────────────────────────────────────────────

export type TopBarProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
};

// ── Component ───────────────────────────────────────────────
// Barra superior contenedora: recibe cualquier componente (p. ej. `TopAction`).
// No tiene contrato de contenido propio; quien la use compone los slots.

export function TopBar({ children, style }: TopBarProps) {
  return <View style={[styles.row, style]}>{children}</View>;
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
  },
});