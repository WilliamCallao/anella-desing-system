import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { TextType, lightSemantic, resolveSemantic, space } from "@william-callao/antonella-theme";
import { Text } from "./text";
import { Icon, type IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum StackDetailsStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

// ── Types ───────────────────────────────────────────────────

export type StackDetailsAction = {
  /** Ícono de la acción, táctil (p. ej. "pencil" para editar o "trash" para eliminar). */
  icon: IconName;
  /** Llamado al presionar el ícono de acción. */
  onPress: () => void;
};

export type StackDetailsRow = {
  /** Texto de la columna izquierda (la clave). */
  label: string;
  /** Texto de la columna derecha (el valor). */
  value?: string;
  /** Si se pasa, la fila es presionable y muestra un chevron al final. */
  onPress?: () => void;
  /** Íconos de acción al final de la fila (editar, eliminar, desasignar...). */
  actions?: StackDetailsAction[];
};

export type StackDetailsProps = {
  rows: StackDetailsRow[];
  style?: StackDetailsStyle;
  /** Override de estilo para el contenedor. */
  containerStyle?: StyleProp<ViewStyle>;
};

// ── Config ──────────────────────────────────────────────────

type ContextKey = "default" | "light" | "darkness";

const STYLE_CONFIG: Record<StackDetailsStyle, { ctx: ContextKey; divider: string }> = {
  [StackDetailsStyle.DEFAULT]: { ctx: "default", divider: "rgba(0, 0, 0, 0.06)" },
  [StackDetailsStyle.LIGHT]: { ctx: "light", divider: "rgba(0, 0, 0, 0.06)" },
  [StackDetailsStyle.DARKNESS]: { ctx: "darkness", divider: "rgba(255, 255, 255, 0.12)" },
};

// ── Component ───────────────────────────────────────────────

export function StackDetails({
  rows,
  style = StackDetailsStyle.DEFAULT,
  containerStyle,
}: StackDetailsProps) {
  const config = STYLE_CONFIG[style];
  const ctx = resolveSemantic(lightSemantic)[config.ctx];

  if (rows.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: ctx.bg.subtle }, containerStyle]}>
      {rows.map((row, index) => {
        const notLast = index < rows.length - 1;
        const inner = (
          <>
            <Text variant={TextType.Caption} color={ctx.text.subtle}>
              {row.label}
            </Text>
            <View style={styles.right}>
              {row.value ? (
                <Text
                  variant={TextType.Caption}
                  color={ctx.text.default}
                  style={styles.value}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {row.value}
                </Text>
              ) : null}
              {row.actions && row.actions.length > 0 ? (
                row.actions.map((action, actionIndex) => (
                  <Pressable
                    key={actionIndex}
                    onPress={action.onPress}
                    hitSlop={8}
                    accessibilityRole="button"
                    style={styles.actionTouch}
                  >
                    <Icon name={action.icon} size={18} color={ctx.icon.subtle} />
                  </Pressable>
                ))
              ) : row.onPress ? (
                <Icon name="chevron-forward" size={14} color={ctx.icon.subtle} />
              ) : null}
            </View>
          </>
        );
        return (
          <View
            key={index}
            style={[styles.row, notLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: config.divider }]}
          >
            {row.onPress ? (
              <Pressable onPress={row.onPress} style={styles.rowFlex} accessibilityRole="button">
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
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    paddingHorizontal: space.space4,
    paddingVertical: space.space4,
  },
  rowFlex: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.space3,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: space.space2,
    flexShrink: 1,
  },
  value: {
    maxWidth: 180,
    flexShrink: 1,
    textAlign: "right",
  },
  actionTouch: {
    marginLeft: space.space1,
  },
});