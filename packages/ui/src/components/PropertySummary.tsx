import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import {
  background,
  border,
  radius,
  space,
  text,
  TextType,
} from "@william-callao/antonella-theme";
import { Text } from "./text/Text";

export type PropertySummaryItem = {
  label: string;
  value?: string;
  /** Texto cuando no hay valor. Por defecto, `-`. */
  emptyLabel?: string;
};

export type PropertySummaryProps = {
  title?: string;
  items: PropertySummaryItem[];
  emptyLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Resumen compacto de propiedades para el paso de revisión: label a la
 * izquierda y valor a la derecha, con un ritmo más bajo que una fila de input.
 */
export function PropertySummary({
  title,
  items,
  emptyLabel = "-",
  style,
}: PropertySummaryProps) {
  if (items.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      {title ? (
        <Text
          variant={TextType.BodyBold}
          style={styles.title}
          accessibilityRole="header"
        >
          {title}
        </Text>
      ) : null}
      {items.map((item, index) => {
        const hasValue = item.value != null && item.value.trim() !== "";
        const value = hasValue ? item.value! : item.emptyLabel ?? emptyLabel;
        return (
          <View key={`${item.label}-${index}`}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.row}>
              <Text variant={TextType.Caption} style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
              <Text
                variant={hasValue ? TextType.BodyMedium : TextType.Caption}
                color={hasValue ? undefined : text.secondary}
                style={styles.value}
                numberOfLines={2}
              >
                {value}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: background.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.space4,
    paddingTop: space.space2,
    paddingBottom: space.space1,
  },
  title: {
    marginTop: space.space2,
    marginBottom: space.space1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.space3,
    paddingVertical: space.space2,
  },
  label: {
    flexShrink: 0,
  },
  value: {
    flex: 1,
    textAlign: "right",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: border.divider.secondary,
  },
});
