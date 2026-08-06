import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { appInputCard, radius, background, border } from "@antonella/theme";
import type { AppInputElement, AppInputProps } from "./AppInput";

export type AppFormCardProps = {
  children: AppInputElement | AppInputElement[];
  labelWidth?: number;
  style?: ViewStyle;
};

export function AppFormCard({ children, labelWidth, style }: AppFormCardProps) {
  const items = React.Children.toArray(children)
    .filter((child) => React.isValidElement<AppInputProps>(child))
    .map((child) => child as AppInputElement);

  return (
    <View style={[styles.container, style]}>
      {items.map((child, index) => (
        <View key={index} style={styles.row}>
          {index > 0 ? <View style={styles.divider} /> : null}
          {React.cloneElement(child, {
            ...(labelWidth != null ? { labelWidth } : {}),
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: background.surface,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  row: {
    overflow: "hidden",
  },
  divider: {
    position: "absolute",
    top: 0,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: border.divider.secondary,
  },
});
