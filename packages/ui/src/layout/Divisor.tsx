import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { resolveSemantic, lightSemantic } from "@antonella/theme";

const _semantic = resolveSemantic(lightSemantic);
const DEFAULT_BG = _semantic.darkness.bg.default;

export type DivisorPosition = "top" | "bottom";

export type DivisorProps = {
  /** "top": esquinas inferiores redondeadas (debajo de una sección). "bottom": esquinas superiores redondeadas (encima de una sección). */
  position: DivisorPosition;
  /** Color de fondo que representa el divisor. Default: bg por defecto del tema. */
  color?: string;
  /** Alto del divisor en px. Default 20. */
  height?: number;
  style?: ViewStyle;
};

export function Divisor({ position, color = DEFAULT_BG, height = 20, style }: DivisorProps) {
  const radiusStyle: ViewStyle =
    position === "top"
      ? { borderBottomLeftRadius: height, borderBottomRightRadius: height }
      : { borderTopLeftRadius: height, borderTopRightRadius: height };
  return (
    <View
      style={[styles.base, { backgroundColor: color, height }, radiusStyle, style]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
  },
});
