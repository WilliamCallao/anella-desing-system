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
        <View style={styles.skeletonContainer}>
          <Skeleton width="40%" height={14} borderRadius={6} />
          <Skeleton width="80%" height={20} borderRadius={8} style={{ marginTop: 8 }} />
          <Skeleton width="60%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, background ? { backgroundColor: background } : undefined, style]}>
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
  skeletonContainer: {
    width: "100%",
  },
});
