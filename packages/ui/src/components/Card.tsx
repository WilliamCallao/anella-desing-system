import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { background, card, palette, spacing } from "@william-callao/antonella-theme";
import { Skeleton } from "./Skeleton";

export type CardVariant = "default" | "line";

export interface CardProps extends ViewProps {
  /** Fondo custom que tiene prioridad sobre la variante. */
  background?: string;
  /** `default` pinta `card.background`; `line` deja el fondo transparente y dibuja el borde gris. */
  variant?: CardVariant;
  loading?: boolean;
  skeletonHeight?: number;
}

export function Card({
  background: bgOverride,
  loading,
  skeletonHeight = 80,
  variant = "default",
  style,
  children,
  ...rest
}: CardProps) {
  if (loading) {
    return (
      <Skeleton
        width="100%"
        height={skeletonHeight}
        borderRadius={16}
        style={style}
      />
    );
  }

  return (
    <View
      style={[
        styles.card,
        variant === "line" ? styles.line : styles.default,
        bgOverride ? { backgroundColor: bgOverride } : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
    overflow: "hidden",
  },
  default: {
    backgroundColor: card.background,
    borderColor: background.default,
  },
  line: {
    backgroundColor: "transparent",
    borderColor: palette.border,
  },
});
