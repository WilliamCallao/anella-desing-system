import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { TextType, lightSemantic, resolveSemantic, space } from "@william-callao/antonella-theme";
import { Text } from "./text";
import { Icon, type IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum KeyValueListStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

// ── Types ───────────────────────────────────────────────────

export type KeyValueItem = {
  /** Texto de la columna izquierda (la clave). */
  label: string;
  /** Texto de la columna derecha (el valor). */
  value?: string;
  /** Ícono al final de la fila, táctil (p. ej. un "close" para quitar la fila). */
  actionIcon?: IconName;
  /** Llamado al presionar el ícono de acción. */
  onAction?: () => void;
  /** Llamado al presionar la fila completa. */
  onPress?: () => void;
};

export type KeyValueListProps = {
  items: KeyValueItem[];
  style?: KeyValueListStyle;
  /** Override de estilo para el contenedor. */
  containerStyle?: StyleProp<ViewStyle>;
};

// ── Config ──────────────────────────────────────────────────

type ContextKey = "default" | "light" | "darkness";

const STYLE_CONFIG: Record<KeyValueListStyle, { ctx: ContextKey; divider: string }> = {
  [KeyValueListStyle.DEFAULT]: { ctx: "default", divider: "rgba(0, 0, 0, 0.06)" },
  [KeyValueListStyle.LIGHT]: { ctx: "light", divider: "rgba(0, 0, 0, 0.06)" },
  [KeyValueListStyle.DARKNESS]: { ctx: "darkness", divider: "rgba(255, 255, 255, 0.12)" },
};

// ── Component ───────────────────────────────────────────────

export function KeyValueList({
  items,
  style = KeyValueListStyle.DEFAULT,
  containerStyle,
}: KeyValueListProps) {
  const config = STYLE_CONFIG[style];
  const ctx = resolveSemantic(lightSemantic)[config.ctx];

  if (items.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: ctx.bg.subtle }, containerStyle]}>
      {items.map((item, index) => {
        const notLast = index < items.length - 1;
        const inner = (
          <>
            <Text variant={TextType.Caption} color={ctx.text.subtle}>
              {item.label}
            </Text>
            <View style={styles.right}>
              {item.value ? (
                <Text variant={TextType.Caption} color={ctx.text.default} style={styles.value} numberOfLines={1}>
                  {item.value}
                </Text>
              ) : null}
              {item.actionIcon ? (
                <Pressable
                  onPress={item.onAction}
                  hitSlop={8}
                  accessibilityRole="button"
                  style={styles.actionTouch}
                >
                  <Icon name={item.actionIcon} size={18} color={ctx.icon.subtle} />
                </Pressable>
              ) : item.onPress ? (
                <Icon name="chevron-forward" size={18} color={ctx.icon.subtle} />
              ) : null}
            </View>
          </>
        );
        return (
          <View
            key={index}
            style={[styles.row, notLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: config.divider }]}
          >
            {item.onPress ? (
              <Pressable onPress={item.onPress} style={styles.rowFlex} accessibilityRole="button">
                {inner}
              </Pressable>
            ) : (
              <View style={styles.rowFlex}>{inner}</View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    paddingHorizontal: space.space4,
    paddingVertical: space.space3,
  },
  rowFlex: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.space3,
  },
  right: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: space.space2,
    marginLeft: space.space3,
  },
  value: {
    flexShrink: 1,
    textAlign: "right",
  },
  actionTouch: {
    marginLeft: space.space1,
  },
});