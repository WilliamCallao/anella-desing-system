import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import {
  danger,
  lightSemantic,
  radius,
  resolveSemantic,
  space,
  TextType,
} from "@william-callao/antonella-theme";
import { Text } from "./text/Text";
import { Icon, type IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum ActionTilesStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

// ── Types ───────────────────────────────────────────────────

export type ActionTile = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  /** true pinta ícono y texto en color de peligro (acciones destructivas). */
  destructive?: boolean;
  accessibilityLabel?: string;
};

export type ActionTilesProps = {
  actions: ActionTile[];
  style?: ActionTilesStyle;
  /** Margin horizontal del contenedor (si no se pasa, 0). Inserta el card completo. */
  horizontalMargin?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

// ── Config ──────────────────────────────────────────────────

const STYLE_CONTEXT: Record<ActionTilesStyle, "default" | "light" | "darkness"> = {
  [ActionTilesStyle.DEFAULT]: "default",
  [ActionTilesStyle.LIGHT]: "light",
  [ActionTilesStyle.DARKNESS]: "darkness",
};

const DIVIDER_COLOR: Record<ActionTilesStyle, string> = {
  [ActionTilesStyle.DEFAULT]: "rgba(15, 23, 42, 0.08)",
  [ActionTilesStyle.LIGHT]: "rgba(15, 23, 42, 0.08)",
  [ActionTilesStyle.DARKNESS]: "rgba(255, 255, 255, 0.12)",
};

// ── Component ───────────────────────────────────────────────

export function ActionTiles({ actions, style = ActionTilesStyle.DEFAULT, horizontalMargin, containerStyle }: ActionTilesProps) {
  const ctx = resolveSemantic(lightSemantic)[STYLE_CONTEXT[style]];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: ctx.bg.subtle },
        horizontalMargin != null ? { marginHorizontal: horizontalMargin } : null,
        containerStyle,
      ]}
    >
      {actions.map((action, index) => {
        const accent = action.destructive ? danger.D500 : null;
        const iconColor = accent ?? ctx.icon.default;
        const textColor = accent ?? ctx.text.default;
        const content = (
          <View style={styles.tile}>
            <Icon name={action.icon} size={20} color={iconColor} />
            <Text variant={TextType.CaptionMedium} color={textColor}>
              {action.label}
            </Text>
          </View>
        );
        return (
          <React.Fragment key={action.label}>
            {index > 0 ? (
              <View style={[styles.divider, { backgroundColor: DIVIDER_COLOR[style] }]} />
            ) : null}
            {action.onPress ? (
              <Pressable
                onPress={action.onPress}
                style={({ pressed }) => [styles.tileWrap, pressed && styles.tilePressed]}
                accessibilityRole="button"
                accessibilityLabel={action.accessibilityLabel ?? action.label}
              >
                {content}
              </Pressable>
            ) : (
              <View style={styles.tileWrap}>{content}</View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: radius.md,
    overflow: "hidden",
  },
  tileWrap: {
    flex: 1,
  },
  tile: {
    alignItems: "center",
    justifyContent: "center",
    gap: space.space2,
    paddingVertical: space.space4,
  },
  tilePressed: {
    opacity: 0.7,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    marginVertical: space.space3,
  },
});