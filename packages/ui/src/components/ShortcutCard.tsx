import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { neutrals, radius, space, TextType } from "@william-callao/antonella-theme";
import { Text } from "./text/Text";
import { Icon, type IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum ShortcutCardStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

// ── Types ───────────────────────────────────────────────────

export type ShortcutItem = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export type ShortcutCardProps = {
  /** Atajos a mostrar dentro de la card (se reparten el ancho en una fila). */
  shortcuts: ShortcutItem[];
  /** Diámetro del círculo (por defecto 44). */
  circleSize?: number;
  /** Tamaño del ícono (por defecto 20). */
  iconSize?: number;
  style?: ShortcutCardStyle;
  /** Override de estilo para la card contenedora. */
  containerStyle?: StyleProp<ViewStyle>;
};

// ── Config ──────────────────────────────────────────────────

const STYLE_COLORS: Record<
  ShortcutCardStyle,
  {
    bg: string;
    circle: string;
    text: string;
    icon: string;
    divider: string;
  }
> = {
  [ShortcutCardStyle.DEFAULT]: {
    bg: neutrals.N100,
    circle: neutrals.N0,
    text: neutrals.N950,
    icon: neutrals.N500,
    divider: "rgba(15, 23, 42, 0.08)",
  },
  [ShortcutCardStyle.LIGHT]: {
    bg: neutrals.N0,
    circle: neutrals.N200,
    text: neutrals.N950,
    icon: neutrals.N500,
    divider: "rgba(15, 23, 42, 0.08)",
  },
  [ShortcutCardStyle.DARKNESS]: {
    bg: neutrals.N950,
    circle: neutrals.N900,
    text: neutrals.N0,
    icon: neutrals.N400,
    divider: "rgba(255, 255, 255, 0.12)",
  },
};

// ── Component ───────────────────────────────────────────────

export function ShortcutCard({
  shortcuts,
  circleSize = 44,
  iconSize = 20,
  style = ShortcutCardStyle.DEFAULT,
  containerStyle,
}: ShortcutCardProps) {
  const c = STYLE_COLORS[style];

  return (
    <View style={[styles.card, { backgroundColor: c.bg }, containerStyle]}>
      {shortcuts.map((shortcut, index) => {
        const content = (
          <View style={styles.item}>
            <View
              style={[
                styles.circle,
                {
                  width: circleSize,
                  height: circleSize,
                  borderRadius: circleSize / 2,
                  backgroundColor: c.circle,
                },
              ]}
            >
              <Icon name={shortcut.icon} size={iconSize} color={c.icon} />
            </View>
            <Text variant={TextType.CaptionMedium} color={c.text} numberOfLines={1}>
              {shortcut.label}
            </Text>
          </View>
        );
        return (
          <React.Fragment key={shortcut.label}>
            {index > 0 ? (
              <View style={[styles.divider, { backgroundColor: c.divider }]} />
            ) : null}
            {shortcut.onPress ? (
              <Pressable
                onPress={shortcut.onPress}
                accessibilityRole="button"
                accessibilityLabel={shortcut.accessibilityLabel ?? shortcut.label}
                style={({ pressed }) => [styles.itemWrap, pressed && styles.itemPressed]}
              >
                {content}
              </Pressable>
            ) : (
              <View style={styles.itemWrap}>{content}</View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: radius.md,
    overflow: "hidden",
  },
  itemWrap: {
    flex: 1,
  },
  itemPressed: {
    opacity: 0.7,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    gap: space.space2,
    paddingVertical: space.space4,
  },
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    marginVertical: space.space4,
  },
});