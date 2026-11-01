import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { radius, background, border, neutrals } from "@william-callao/antonella-theme";
import type { AppInputElement, AppInputProps } from "./AppInput";

export type AppFormCardVariant = "filled" | "outlined";
export type AppFormCardTone = "light" | "dark";

export type AppFormCardProps = {
  children: AppInputElement | AppInputElement[];
  labelWidth?: number;
  variant?: AppFormCardVariant;
  /** Superficie del grupo. `dark` es para fichas de solo lectura sobre fondo oscuro. */
  tone?: AppFormCardTone;
  style?: ViewStyle;
};

export function AppFormCard({
  children,
  labelWidth,
  variant = "filled",
  tone = "light",
  style,
}: AppFormCardProps) {
  const items = React.Children.toArray(children)
    .filter((child) => React.isValidElement<AppInputProps>(child))
    .map((child) => child as AppInputElement);

  return (
    <View
      style={[
        styles.container,
        variant === "outlined" && tone !== "dark" ? styles.outlined : undefined,
        tone === "dark" ? styles.dark : undefined,
        style,
      ]}
    >
      {items.map((child, index) => (
        <View key={index} style={styles.row}>
          {index > 0 ? (
            <View style={[styles.divider, tone === "dark" ? styles.dividerDark : undefined]} />
          ) : null}
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
  dark: {
    backgroundColor: neutrals.N900,
    borderWidth: 1,
    borderColor: neutrals.N800,
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
  dividerDark: {
    backgroundColor: neutrals.N800,
  },
});
