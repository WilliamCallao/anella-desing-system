import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { resolveSemantic, lightSemantic } from "@william-callao/antonella-theme";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum TopActionStyle {
  DEFAULT = "DEFAULT",
  DARKNESS = "DARKNESS",
}

// ── Props ───────────────────────────────────────────────────

export type TopActionProps = {
  icon: IconName;
  onPress: () => void;
  style?: TopActionStyle;
  /** Override de colores (opcional). */
  colors?: Partial<{
    buttonBg: string;
    buttonPressedBg: string;
    iconColor: string;
  }>;
  /** Radio de esquinas del botón (opcional, por defecto 24). */
  borderRadius?: number;
  /** Label de accesibilidad del botón. */
  accessibilityLabel?: string;
};

// ── Component ───────────────────────────────────────────────
// Botón redondo de acción superior (menú, back). Alto de acciones (52).

export function TopAction({
  icon,
  onPress,
  style = TopActionStyle.DEFAULT,
  colors,
  borderRadius,
  accessibilityLabel,
}: TopActionProps) {
  const base = STYLE_COLORS[style];
  const c = {
    buttonBg: colors?.buttonBg ?? base.buttonBg,
    buttonPressedBg: colors?.buttonPressedBg ?? base.buttonPressedBg,
    iconColor: colors?.iconColor ?? base.iconColor,
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? c.buttonPressedBg : c.buttonBg },
        borderRadius != null && { borderRadius },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Icon name={icon} size={20} color={c.iconColor} />
    </Pressable>
  );
}

// ── Color maps per style ────────────────────────────────────

const _semantic = resolveSemantic(lightSemantic);

const STYLE_COLORS: Record<
  TopActionStyle,
  {
    buttonBg: string;
    buttonPressedBg: string;
    iconColor: string;
  }
> = {
  [TopActionStyle.DEFAULT]: {
    buttonBg: _semantic.default.bg.subtle,
    buttonPressedBg: _semantic.default.bg.default,
    iconColor: _semantic.default.text.default,
  },
  [TopActionStyle.DARKNESS]: {
    buttonBg: _semantic.darkness.bg.subtle,
    buttonPressedBg: _semantic.darkness.bg.default,
    iconColor: _semantic.darkness.text.default,
  },
};

// ── Styles ──────────────────────────────────────────────────

// Botón de acción superior (menú, back): 60px con radio 24 (esquina suave).
const BUTTON_SIZE = 60;

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});