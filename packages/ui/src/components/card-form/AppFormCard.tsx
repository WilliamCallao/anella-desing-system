import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { radius, background, border, neutrals } from "@william-callao/antonella-theme";
import type { AppInputElement, AppInputProps } from "./AppInput";
import { AppReadOnlyField } from "./AppReadOnlyField";

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
  // Una tarjeta compuesta solo por filas de lectura deja de ser un bloque
  // relleno: se lee como una lista mecánica, sin fondo y con divisores de borde
  // a borde. Si hay un input real, conserva el contenedor actual.
  const readOnly = items.length > 0 && items.every((child) => child.type === AppReadOnlyField);

  return (
    <View
      style={[
        styles.container,
        readOnly ? styles.readOnly : undefined,
        !readOnly && variant === "outlined" && tone !== "dark" ? styles.outlined : undefined,
        !readOnly && tone === "dark" ? styles.dark : undefined,
        style,
      ]}
    >
      {items.map((child, index) => (
        <View key={index} style={styles.row}>
          {index > 0 ? (
            <View
              style={[
                styles.divider,
                readOnly ? styles.readOnlyDivider : undefined,
                tone === "dark"
                  ? readOnly
                    ? styles.readOnlyDividerDark
                    : styles.dividerDark
                  : undefined,
              ]}
            />
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
  readOnly: {
    backgroundColor: "transparent",
    borderWidth: 0,
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
  readOnlyDivider: {
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  dividerDark: {
    backgroundColor: neutrals.N800,
  },
  readOnlyDividerDark: {
    backgroundColor: neutrals.N800,
  },
});
