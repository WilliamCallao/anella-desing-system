import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { space, TextType, resolveSemantic, lightSemantic } from "@antonella/theme";
import { Text } from "./text/Text";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum HeaderBarStyle {
  DEFAULT = "DEFAULT",
  DARKNESS = "DARKNESS",
}

// ── Props ───────────────────────────────────────────────────

export type HeaderBarProps = {
  title: string;
  /** Texto secundario debajo del título (opcional). */
  description?: string;
  style?: HeaderBarStyle;
  /** Acción del botón de menú (hamburguesa, lado izquierdo). */
  onMenuPress?: () => void;
  menuIcon?: IconName;
};

// El alto de los botones redondos matchea el minHeight del SearchBar (54)
// para que título y buscador compartan la misma retícula del header.
const BUTTON_SIZE = 54;

// ── Component ───────────────────────────────────────────────
// Row de header: [botón menú] [título centrado] [espacio reservado].
// El slot derecho está reservado para una acción futura; mantenerlo
// visible-pero-vacío conserva el título perfectamente centrado.

export function HeaderBar({
  title,
  description,
  style = HeaderBarStyle.DEFAULT,
  onMenuPress,
  menuIcon = "menu",
}: HeaderBarProps) {
  const c = STYLE_COLORS[style];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={onMenuPress}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? c.buttonPressedBg : c.buttonBg },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Abrir menú"
        >
          <Icon name={menuIcon} size={22} color={c.iconColor} />
        </Pressable>
        <View style={styles.titleWrap}>
          <Text variant={TextType.Subtitle} color={c.titleColor} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={[styles.button, styles.reserved]} />
      </View>
      {description ? (
        <Text variant={TextType.Caption} color={c.descriptionColor} style={styles.description}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

// ── Color maps per style ────────────────────────────────────

const _semantic = resolveSemantic(lightSemantic);

const STYLE_COLORS: Record<
  HeaderBarStyle,
  {
    buttonBg: string;
    buttonPressedBg: string;
    iconColor: string;
    titleColor: string;
    descriptionColor: string;
  }
> = {
  [HeaderBarStyle.DEFAULT]: {
    buttonBg: _semantic.default.bg.subtle,
    buttonPressedBg: _semantic.default.bg.default,
    iconColor: _semantic.default.text.default,
    titleColor: _semantic.default.text.default,
    descriptionColor: _semantic.default.text.subtle,
  },
  [HeaderBarStyle.DARKNESS]: {
    buttonBg: _semantic.darkness.bg.subtle,
    buttonPressedBg: _semantic.darkness.bg.default,
    iconColor: _semantic.darkness.text.default,
    titleColor: _semantic.darkness.text.default,
    descriptionColor: _semantic.darkness.text.subtle,
  },
};

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  reserved: {
    backgroundColor: "transparent",
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  description: {
    marginTop: space.space3,
  },
});
