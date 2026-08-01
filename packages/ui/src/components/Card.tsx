import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { palette, spacing } from "@antonella/theme";

export interface CardProps extends ViewProps {}

export function Card({ style, ...rest }: CardProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
  },
});
