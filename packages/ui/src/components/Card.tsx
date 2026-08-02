import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { palette, spacing } from "@antonella/theme";
import { Skeleton } from "./Skeleton";

export interface CardProps extends ViewProps {
  background?: string;
  loading?: boolean;
  skeletonHeight?: number;
}

export function Card({ background, loading, skeletonHeight = 80, style, children, ...rest }: CardProps) {
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
