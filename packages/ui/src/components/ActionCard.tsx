import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { lightSemantic, radius, resolveSemantic, space, TextType } from "@william-callao/antonella-theme";
import { Text } from "./text/Text";
import { Icon, type IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum ActionCardStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

// ── Types ───────────────────────────────────────────────────

export type ActionCardProps = {
  /** Alto del card en píxeles. */
  height: number;
  /** Ancho del card en píxeles. Si no se pasa, el card reparte el espacio disponible (flex). */
  width?: number;
  /** Ícono tipado del design system, pequeño arriba a la derecha. */
  icon: IconName;
  /** Texto grande inferior izquierdo (acción). */
  label: string;
  /** Texto pequeño tenue sobre el label. */
  caption?: string;
  style?: ActionCardStyle;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Override de estilo para el card contenedor. */
  containerStyle?: StyleProp<ViewStyle>;
};

// ── Config ──────────────────────────────────────────────────

const STYLE_CONTEXT: Record<ActionCardStyle, "default" | "light" | "darkness"> = {
  [ActionCardStyle.DEFAULT]: "default",
  [ActionCardStyle.LIGHT]: "light",
  [ActionCardStyle.DARKNESS]: "darkness",
};

// ── Component ───────────────────────────────────────────────

export function ActionCard({
  height,
  width,
  icon,
  label,
  caption,
  style = ActionCardStyle.DEFAULT,
  onPress,
  accessibilityLabel,
  containerStyle,
}: ActionCardProps) {
  const ctx = resolveSemantic(lightSemantic)[STYLE_CONTEXT[style]];
  const cardStyle = [
    styles.card,
    { height, backgroundColor: ctx.bg.subtle },
    width != null ? { width } : styles.fill,
    containerStyle,
  ];

  const content = (
    <>
      <View style={styles.topRight}>
        <Icon name={icon} size={16} color={ctx.icon.subtle} />
      </View>
      <View style={styles.spacer} />
      <View style={styles.bottomLeft}>
        {caption ? (
          <Text variant={TextType.Caption} color={ctx.text.subtle} numberOfLines={1}>
            {caption}
          </Text>
        ) : null}
        <Text variant={TextType.Label} color={ctx.text.default} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.cardPressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{content}</View>;
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: space.space3,
    overflow: "hidden",
  },
  fill: {
    flex: 1,
  },
  cardPressed: {
    opacity: 0.7,
  },
  topRight: {
    alignItems: "flex-end",
  },
  spacer: {
    flex: 1,
  },
  bottomLeft: {
    gap: 2,
  },
});