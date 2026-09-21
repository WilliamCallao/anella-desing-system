import React from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { resolveSemantic, lightSemantic, space, neutrals, brand as brandPalette } from "@william-callao/antonella-theme";
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
  /** Tipo de tecla de retorno del teclado (ej: "search" para mostrar "Buscar"). */
  returnKeyType?: TextInputProps["returnKeyType"];
  /** Se dispara al presionar la tecla de retorno del teclado. */
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  /** Al presionar retorno, pierde el foco (default true de TextInput). */
  blurOnSubmit?: boolean;
  autoFocus?: boolean;
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
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  autoFocus,
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
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit}
        autoFocus={autoFocus}
      />
    </View>
  );
}

// ── Color maps per style ────────────────────────────────────

const _semantic = resolveSemantic(lightSemantic);

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
    iconColor: _semantic.default.text.default,
    textColor: neutrals.N950,
    placeholderColor: neutrals.N500,
  },
  [SearchBarStyle.LIGHT]: {
    bg: neutrals.N0,
    iconColor: _semantic.light.text.default,
    textColor: neutrals.N950,
    placeholderColor: neutrals.N500,
  },
  [SearchBarStyle.DARKNESS]: {
    bg: neutrals.N950,
    iconColor: _semantic.darkness.text.default,
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
    // Alto estándar de acciones (52): mínimo derivado de internos + paddings de
    // space, nunca height fijo — con fuente mayor crece con el contenido.
    minHeight: 52,
    paddingVertical: space.space2,
    paddingHorizontal: space.space1,
    borderRadius: 9999,
  },
  iconLeft: {
    paddingLeft: space.space3,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
    padding: 0,
  },
});
