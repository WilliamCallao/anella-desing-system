import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { resolveSemantic, lightSemantic } from "@william-callao/antonella-theme";

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
  /** Muestra el "grabber" (pill) estilo iOS centrado en el borde de la hoja. */
  handle?: boolean;
  /** Color del grabber. Default: blanco translúcido. */
  handleColor?: string;
  style?: ViewStyle;
};

const HANDLE_W = 36;
const HANDLE_H = 5;

export function Divisor({
  position,
  color = SHEET_BG,
  baseColor = BASE_BG,
  height = 20,
  handle = false,
  handleColor = "rgba(255,255,255,0.4)",
  style,
}: DivisorProps) {
  const radiusStyle: ViewStyle =
    position === "top"
      ? { borderBottomLeftRadius: height, borderBottomRightRadius: height }
      : { borderTopLeftRadius: height, borderTopRightRadius: height };
  const handleInset = (height - HANDLE_H) / 2;
  const handlePosition: ViewStyle =
    position === "top" ? { bottom: handleInset } : { top: handleInset };
  return (
    <View style={[styles.base, { backgroundColor: baseColor, height }, style]} pointerEvents="none">
      <View style={[styles.layer, { backgroundColor: color, height }, radiusStyle]} />
      {handle && <View style={[styles.handle, { backgroundColor: handleColor }, handlePosition]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    position: "relative",
  },
  layer: {
    width: "100%",
  },
  handle: {
    position: "absolute",
    left: "50%",
    width: HANDLE_W,
    height: HANDLE_H,
    marginLeft: -HANDLE_W / 2,
    borderRadius: HANDLE_H / 2,
  },
});
