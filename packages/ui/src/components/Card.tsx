import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { palette, spacing } from "@antonella/theme";
import { Skeleton } from "./Skeleton";

export interface CardProps extends ViewProps {
  background?: string;
  loading?: boolean;
}

export function Card({ background, loading, style, children, ...rest }: CardProps) {
  if (loading) {
    return (
      <View style={[styles.card, background ? { backgroundColor: background } : undefined, style]} {...rest}>
        <Skeleton width="100%" height={64} borderRadius={10} />
      </View>
    );
  }

  return (
    <View style={[styles.card, background ? { backgroundColor: background } : undefined, style]} {...rest}>
      {children}
    </View>
  );
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
