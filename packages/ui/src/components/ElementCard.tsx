import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { TextType, lightSemantic, resolveSemantic, space } from "@william-callao/antonella-theme";
import { Text } from "./text";
import { Icon, type IconName } from "./Icon";
import { TopAction, TopActionStyle } from "./TopAction";

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
  /** Llamado al presionar el ícono de la derecha. Si no se pasa, el ícono no es táctil. */
  onTrailingPress?: () => void;
  /** Elemento oculto/inactivo: atenúa la card. */
  dimmed?: boolean;
  style?: ElementCardStyle;
  /** Override de estilo para el card contenedor. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Fondo del elemento visual (TopAction) a la izquierda (opcional). */
  visualBg?: string;
  /** Color del icono del elemento visual (opcional). */
  visualIconColor?: string;
};

// ── Config ──────────────────────────────────────────────────

const STYLE_CONTEXT: Record<ElementCardStyle, "default" | "light" | "darkness"> = {
  [ElementCardStyle.DEFAULT]: "default",
  [ElementCardStyle.LIGHT]: "light",
  [ElementCardStyle.DARKNESS]: "darkness",
};

const TOP_ACTION_STYLE: Record<ElementCardStyle, TopActionStyle> = {
  [ElementCardStyle.DEFAULT]: TopActionStyle.DEFAULT,
  [ElementCardStyle.LIGHT]: TopActionStyle.DEFAULT,
  [ElementCardStyle.DARKNESS]: TopActionStyle.DARKNESS,
};

// ── Component ───────────────────────────────────────────────

export function ElementCard({
  name,
  subtitle,
  icon = "folder",
  onPress,
  trailing = "chevron-forward",
  onTrailingPress,
  dimmed = false,
  style = ElementCardStyle.DEFAULT,
  containerStyle,
  visualBg,
  visualIconColor,
}: ElementCardProps) {
  const ctx = resolveSemantic(lightSemantic)[STYLE_CONTEXT[style]];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        styles.rowCard,
        // Card con el fondo sutil del contexto y un TopAction a la izquierda
        // como elemento visual/identificador del tipo de elemento.
        { backgroundColor: ctx.bg.subtle },
        dimmed && styles.dimmed,
        pressed && styles.pressed,
        containerStyle,
      ]}
      accessibilityRole="button"
    >
      <TopAction
        icon={icon}
        onPress={onPress ?? (() => {})}
        style={TOP_ACTION_STYLE[style]}
        borderRadius={20}
        colors={{
          buttonBg: visualBg ?? ctx.bg.default,
          buttonPressedBg: visualBg ?? ctx.bg.default,
          iconColor: visualIconColor ?? ctx.icon.subtle,
        }}
      />
      <View style={styles.body}>
        <Text variant={TextType.BodyMedium} color={ctx.text.default} style={styles.title} numberOfLines={1}>
          {name}
        </Text>
        {subtitle ? (
          <Text variant={TextType.Caption} color={ctx.text.subtle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onTrailingPress ? (
        <Pressable
          onPress={onTrailingPress}
          hitSlop={8}
          accessibilityRole="button"
          style={styles.trailingTouch}
        >
          <Icon name={trailing} size={18} color={ctx.icon.subtle} />
        </Pressable>
      ) : (
        <Icon name={trailing} size={18} color={ctx.icon.subtle} />
      )}
    </Pressable>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    padding: space.space3,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space3,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
  },
  trailingTouch: {
    paddingLeft: space.space1,
  },
  pressed: {
    opacity: 0.7,
  },
  dimmed: {
    opacity: 0.55,
  },
});