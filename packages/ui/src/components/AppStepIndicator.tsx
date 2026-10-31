import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { cta1, space, text } from "@william-callao/antonella-theme";
import { Chip } from "./Chip";
import { Text } from "./text/Text";

export type AppStepIndicatorProps = {
  /** Paso actual, 1-based. */
  current: number;
  /** Cantidad total de pasos. */
  total: number;
  /** Texto del chip, p. ej. "Paso 2 de 3". */
  label: string;
  /** Nombre corto del paso actual, p. ej. "Descripción". */
  caption?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Indicador compacto de un flujo por pasos. El chip comunica el avance y el
 * caption opcional dice en qué paso está el usuario sin ocupar una fila extra.
 */
export function AppStepIndicator({
  current,
  total,
  label,
  caption,
  style,
}: AppStepIndicatorProps) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(1, current), safeTotal);
  const accessibilityLabel = caption ? `${label}. ${caption}` : label;

  return (
    <View
      style={[styles.root, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 1, max: safeTotal, now: safeCurrent }}
    >
      <Chip
        label={label}
        size="md"
        variant="solid"
        color={cta1}
        style={styles.chip}
      />
      {caption ? (
        <Text
          variant="caption"
          color={text.secondary}
          numberOfLines={1}
          style={styles.caption}
        >
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
    flexWrap: "wrap",
  },
  caption: {
    flexShrink: 1,
  },
  chip: {
    paddingHorizontal: space.space4,
  },
});
