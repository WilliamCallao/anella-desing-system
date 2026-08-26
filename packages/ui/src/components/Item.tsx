import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { space, brand as brandPalette, neutrals, TextType } from "@antonella/theme";
import { Text } from "./text";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum ItemStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

// ── Props ───────────────────────────────────────────────────

export type ItemProps = {
  icon?: IconName;
  label: string;
  onPress: () => void;
  selected?: boolean;
  style?: ItemStyle;
  colors?: {
    rowBg: string;
    rowPressedBg: string;
    iconCircleBg: string;
    iconColor: string;
    iconSelectedColor: string;
    textColor: string;
    textSelectedColor: string;
    selectedBg: string;
  };
};

// ── Component ───────────────────────────────────────────────

export function Item({
  icon,
  label,
  onPress,
  selected = false,
  style = ItemStyle.DEFAULT,
  colors: overrideColors,
}: ItemProps) {
  const c = overrideColors ?? STYLE_COLORS[style];

  const iconColor = selected ? c.iconSelectedColor : c.iconColor;
  const textColor = selected ? c.textSelectedColor : c.textColor;
  const iconBg = selected ? c.iconSelectedColor + "18" : c.iconCircleBg;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.rowBg },
        selected && { backgroundColor: c.selectedBg },
        pressed && { backgroundColor: c.rowPressedBg },
      ]}
    >
      {icon ? (
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Icon name={icon} size={18} color={iconColor} />
        </View>
      ) : null}
      <Text variant={TextType.Caption} color={textColor} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

// ── Default color maps per style ────────────────────────────

const STYLE_COLORS: Record<
  ItemStyle,
  {
    rowBg: string;
    rowPressedBg: string;
    iconCircleBg: string;
    iconColor: string;
    iconSelectedColor: string;
    textColor: string;
    textSelectedColor: string;
    selectedBg: string;
  }
> = {
  [ItemStyle.DEFAULT]: {
    rowBg: neutrals.N100,
    rowPressedBg: neutrals.N200,
    iconCircleBg: neutrals.N0,
    iconColor: neutrals.N500,
    iconSelectedColor: neutrals.N950,
    textColor: neutrals.N950,
    textSelectedColor: neutrals.N950,
    selectedBg: brandPalette.M100,
  },
  [ItemStyle.LIGHT]: {
    rowBg: neutrals.N0,
    rowPressedBg: neutrals.N100,
    iconCircleBg: neutrals.N200,
    iconColor: neutrals.N500,
    iconSelectedColor: neutrals.N950,
    textColor: neutrals.N950,
    textSelectedColor: neutrals.N950,
    selectedBg: brandPalette.M100,
  },
  [ItemStyle.DARKNESS]: {
    rowBg: neutrals.N900,
    rowPressedBg: neutrals.N800,
    iconCircleBg: neutrals.N950,
    iconColor: neutrals.N400,
    iconSelectedColor: neutrals.N0,
    textColor: neutrals.N0,
    textSelectedColor: neutrals.N0,
    selectedBg: brandPalette.M700,
  },
};

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
    minHeight: 44,
    padding: space.space1,
    borderRadius: 9999,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    paddingRight: space.space4,
  },
});
