import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { TextType, lightSemantic, resolveSemantic, space } from "@william-callao/antonella-theme";
import { Text } from "./text";
import { Icon, type IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum ElementCardStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

// ── Types ───────────────────────────────────────────────────

export type ElementCardProps = {
  name: string;
  /** Texto secundario debajo del nombre (opcional). */
  subtitle?: string;
  /** Ícono del placeholder que identifica el tipo de elemento (por defecto "folder"). */
  icon?: IconName;
  /** Llamado al presionar la card. */
  onPress?: () => void;
  /** Ícono a la derecha (por defecto "chevron-forward"). */
  trailing?: IconName;
  /** Elemento oculto/inactivo: atenúa la card. */
  dimmed?: boolean;
  style?: ElementCardStyle;
  /** Override de estilo para el card contenedor. */
  containerStyle?: StyleProp<ViewStyle>;
};

// ── Config ──────────────────────────────────────────────────

const STYLE_CONTEXT: Record<ElementCardStyle, "default" | "light" | "darkness"> = {
  [ElementCardStyle.DEFAULT]: "default",
  [ElementCardStyle.LIGHT]: "light",
  [ElementCardStyle.DARKNESS]: "darkness",
};

// ── Component ───────────────────────────────────────────────

export function ElementCard({
  name,
  subtitle,
  icon = "folder",
  onPress,
  trailing = "chevron-forward",
  dimmed = false,
  style = ElementCardStyle.DEFAULT,
  containerStyle,
}: ElementCardProps) {
  const ctx = resolveSemantic(lightSemantic)[STYLE_CONTEXT[style]];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        styles.rowCard,
        // Card con el fondo sutil del contexto y caja de ícono sobre el fondo
        // por defecto (un paso más profundo), igual que ProductCard.
        { backgroundColor: ctx.bg.subtle },
        dimmed && styles.dimmed,
        pressed && styles.pressed,
        containerStyle,
      ]}
      accessibilityRole="button"
    >
      <View style={[styles.iconBox, { backgroundColor: ctx.bg.default }]}>
        <Icon name={icon} size={22} color={ctx.icon.subtle} />
      </View>
      <View style={styles.body}>
        <Text variant={TextType.BodyMedium} color={ctx.text.default} numberOfLines={1}>
          {name}
        </Text>
        {subtitle ? (
          <Text variant={TextType.Caption} color={ctx.text.subtle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Icon name={trailing} size={18} color={ctx.icon.subtle} />
    </Pressable>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: space.space1,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space3,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  dimmed: {
    opacity: 0.55,
  },
});