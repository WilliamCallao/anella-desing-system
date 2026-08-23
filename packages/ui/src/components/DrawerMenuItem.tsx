import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { brand, radius, space, TextType, resolveSemantic, lightSemantic } from "@antonella/theme";
import { Text } from "./text/Text";
import { Icon, type IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum DrawerMenuItemStyle {
  DEFAULT = "DEFAULT",
  DARKNESS = "DARKNESS",
}

// ── Props ───────────────────────────────────────────────────

export type DrawerMenuItemProps = {
  icon?: IconName;
  label: string;
  onPress?: () => void;
  selected?: boolean;
  style?: DrawerMenuItemStyle;
};

// ── Component ───────────────────────────────────────────────
// Row simple del drawer: [icono] [label] [chevron]. Sin card ni bordes;
// el estado seleccionado tiñe todo el contenido con el color de marca.

export function DrawerMenuItem({
  icon,
  label,
  onPress,
  selected = false,
  style = DrawerMenuItemStyle.DARKNESS,
}: DrawerMenuItemProps) {
  const c = STYLE_COLORS[style];
  const accent = selected ? c.selectedColor : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: c.pressedBg }]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {icon ? <Icon name={icon} size={20} color={accent ?? c.iconColor} /> : null}
      <Text
        variant={TextType.BodyMedium}
        color={accent ?? c.textColor}
        style={styles.label}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Icon name="chevron-forward" size={18} color={accent ?? c.chevronColor} />
    </Pressable>
  );
}

// ── Color maps per style ────────────────────────────────────

const _semantic = resolveSemantic(lightSemantic);

const STYLE_COLORS: Record<
  DrawerMenuItemStyle,
  { textColor: string; iconColor: string; chevronColor: string; selectedColor: string; pressedBg: string }
> = {
  [DrawerMenuItemStyle.DEFAULT]: {
    textColor: _semantic.default.text.default,
    iconColor: _semantic.default.text.subtle,
    chevronColor: _semantic.default.text.subtlest,
    selectedColor: brand.M600,
    pressedBg: "rgba(0,0,0,0.04)",
  },
  [DrawerMenuItemStyle.DARKNESS]: {
    textColor: _semantic.darkness.text.default,
    iconColor: _semantic.darkness.text.subtle,
    chevronColor: _semantic.darkness.text.subtlest,
    selectedColor: brand.M300,
    pressedBg: "rgba(255,255,255,0.06)",
  },
};

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space3,
    paddingVertical: space.space3,
    paddingHorizontal: space.space2,
    borderRadius: radius.sm,
  },
  label: {
    flex: 1,
  },
});
