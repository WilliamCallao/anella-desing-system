import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { resolveSemantic, lightSemantic } from "@antonella/theme";

const _semantic = resolveSemantic(lightSemantic);
const BASE_BG = _semantic.default.bg.default;
const SHEET_BG = _semantic.darkness.bg.default;

export type DivisorPosition = "top" | "bottom";

export type DivisorProps = {
  /** "top": esquinas inferiores redondeadas (debajo de una sección). "bottom": esquinas superiores redondeadas (encima de una sección). */
  position: DivisorPosition;
  /** Color del rectángulo superior redondeado (la hoja). Default: bg.darkness.default. */
  color?: string;
  /** Color del rectángulo base (detrás del redondeado). Default: bg.default.default. */
  baseColor?: string;
  /** Alto del divisor en px. Default 20. */
  height?: number;
  style?: ViewStyle;
};

export function Divisor({
  position,
  color = SHEET_BG,
  baseColor = BASE_BG,
  height = 20,
  style,
}: DivisorProps) {
  const radiusStyle: ViewStyle =
    position === "top"
      ? { borderBottomLeftRadius: height, borderBottomRightRadius: height }
      : { borderTopLeftRadius: height, borderTopRightRadius: height };
  return (
    <View style={[styles.base, { backgroundColor: baseColor, height }, style]} pointerEvents="none">
      <View style={[styles.layer, { backgroundColor: color, height }, radiusStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
  },
  layer: {
    width: "100%",
  },
});
