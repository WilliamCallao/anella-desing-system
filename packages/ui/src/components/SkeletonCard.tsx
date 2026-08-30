import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { background, card, radius, space } from "@william-callao/antonella-theme";

export interface SkeletonCardProps extends ViewProps {
  /** Altura mínima del frame (útil cuando el esqueleto aún no define contenido). */
  height?: number | string;
}

/**
 * Frame que imita el layout de una `Card` para alojar bloques de esqueleto
 * (`SkeletonText`, `SkeletonCircle`) como hijos. El frame NO anima: los
 * bloques internos son los que pulsan.
 */
export function SkeletonCard({
  height,
  style,
  children,
  ...rest
}: SkeletonCardProps) {
  return (
    <View
      style={[
        styles.frame,
        height ? { minHeight: height as any } : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: background.default,
    backgroundColor: card.background,
    padding: space.space4,
    gap: space.space3,
    overflow: "hidden",
  },
});
