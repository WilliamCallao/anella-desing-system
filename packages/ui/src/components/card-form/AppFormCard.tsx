import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { radius, background, border, neutrals } from "@william-callao/antonella-theme";
import type { AppInputElement } from "./AppInput";

export type AppFormCardVariant = "filled" | "outlined" | "readOnly";
export type AppFormCardTone = "light" | "dark";

export type AppFormCardProps = {
  children: AppInputElement | AppInputElement[];
  labelWidth?: number;
  /**
   * `readOnly` convierte el card en una lista de datos: sin superficie, borde
   * ni padding horizontal, con divisores a sangre. Se declara explícitamente
   * porque el estilo no debe depender de cómo se compongan los hijos
   * (wrappers, fragmentos o condicionales).
   */
  variant?: AppFormCardVariant;
  /** Superficie del grupo. `dark` es para fichas de solo lectura sobre fondo oscuro. */
  tone?: AppFormCardTone;
  style?: ViewStyle;
};

function collectItems(children: React.ReactNode): AppInputElement[] {
  const items: AppInputElement[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      items.push(
        ...collectItems((child.props as { children?: React.ReactNode }).children)
      );
      return;
    }
    items.push(child as AppInputElement);
  });
  return items;
}

export function AppFormCard({
  children,
  labelWidth,
  variant = "filled",
  tone = "light",
  style,
}: AppFormCardProps) {
  const items = collectItems(children);
  const readOnly = variant === "readOnly";

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
