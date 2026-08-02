import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { palette, spacing } from "@antonella/theme";

export interface CardProps extends ViewProps {
  background?: string;
}

export function Card({ background, style, ...rest }: CardProps) {
  return <View style={[styles.card, background ? { backgroundColor: background } : undefined, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    overflow: "hidden",
  },
});
