import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { appInputCard, radius, background, border } from "@william-callao/antonella-theme";
import type { AppInputElement, AppInputProps } from "./AppInput";

export type AppFormCardVariant = "filled" | "outlined";

export type AppFormCardProps = {
  children: AppInputElement | AppInputElement[];
  labelWidth?: number;
  variant?: AppFormCardVariant;
  style?: ViewStyle;
};

export function AppFormCard({
  children,
  labelWidth,
  variant = "filled",
  style,
}: AppFormCardProps) {
  const items = React.Children.toArray(children)
    .filter((child) => React.isValidElement<AppInputProps>(child))
    .map((child) => child as AppInputElement);

  return (
    <View
      style={[
        styles.container,
        variant === "outlined" ? styles.outlined : undefined,
        style,
      ]}
    >
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
  outlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: border.divider.secondary,
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
