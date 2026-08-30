import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { space, neutrals, brand as brandPalette } from "@william-callao/antonella-theme";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum SearchBarStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

// ── Props ───────────────────────────────────────────────────

export type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  style?: SearchBarStyle;
  icon?: IconName;
  bgColor?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

// ── Component ───────────────────────────────────────────────

export function SearchBar({
  placeholder = "Buscar...",
  value,
  onChangeText,
  style = SearchBarStyle.DEFAULT,
  icon = "search",
  bgColor,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const c = STYLE_COLORS[style];

  return (
    <View style={[styles.row, { backgroundColor: bgColor ?? c.bg }]}>
      <View style={styles.iconLeft}>
        <Icon name={icon} size={20} color={c.iconColor} />
      </View>
      <TextInput
        style={[styles.input, { color: c.textColor }]}
        placeholder={placeholder}
        placeholderTextColor={c.placeholderColor}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
  );
}

// ── Color maps per style ────────────────────────────────────

const STYLE_COLORS: Record<
  SearchBarStyle,
  {
    bg: string;
    iconColor: string;
    textColor: string;
    placeholderColor: string;
  }
> = {
  [SearchBarStyle.DEFAULT]: {
    bg: neutrals.N100,
    iconColor: neutrals.N500,
    textColor: neutrals.N950,
    placeholderColor: neutrals.N500,
  },
  [SearchBarStyle.LIGHT]: {
    bg: neutrals.N0,
    iconColor: neutrals.N500,
    textColor: neutrals.N950,
    placeholderColor: neutrals.N500,
  },
  [SearchBarStyle.DARKNESS]: {
    bg: neutrals.N950,
    iconColor: neutrals.N400,
    textColor: neutrals.N0,
    placeholderColor: neutrals.N400,
  },
};

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
    minHeight: 54,
    padding: space.space1,
    borderRadius: 9999,
  },
  iconLeft: {
    paddingLeft: space.space3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    padding: 0,
  },
});
