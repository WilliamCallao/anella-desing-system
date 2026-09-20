import React from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { resolveSemantic, lightSemantic, neutrals, radius, space, TextType } from "@william-callao/antonella-theme";
import { Text } from "./text/Text";
import { Icon, type IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum LabelStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

// ── Types ───────────────────────────────────────────────────

export type LabelProps = {
  label: string;
  /** Icono opcional a la izquierda del texto (16). */
  icon?: IconName;
  /** Estado seleccionado: pinta el relleno en vez del borde solo. */
  selected?: boolean;
  onPress?: () => void;
  style?: LabelStyle;
  /** Override de estilo de la propia label (p. ej. `flex: 1` para repartir
   *  espacio en un contenedor de distribución). */
  containerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

// ── Config ──────────────────────────────────────────────────

// El texto inactivo (no seleccionado) deriva del contexto semántico como en el
// resto de los componentes (TopAction, ProductCard, SectionHeader…): la píldora
// no seleccionada queda transparente con su texto en `text.subtle` del contexto.
const STYLE_CONTEXT: Record<LabelStyle, "default" | "light" | "darkness"> = {
  [LabelStyle.DEFAULT]: "default",
  [LabelStyle.LIGHT]: "light",
  [LabelStyle.DARKNESS]: "darkness",
};

// Relleno del estado seleccionado y borde: sin token semántico dedicado, se
// mantienen fijos por variante (la píldora seleccionada es siempre oscura con
// texto claro, igual que las chips de TabNavigation).
const FILL: Record<LabelStyle, string> = {
  [LabelStyle.DEFAULT]: neutrals.N950,
  [LabelStyle.LIGHT]: neutrals.N950,
  [LabelStyle.DARKNESS]: neutrals.N800,
};

const BORDER: Record<LabelStyle, string> = {
  [LabelStyle.DEFAULT]: neutrals.N200,
  [LabelStyle.LIGHT]: neutrals.N200,
  [LabelStyle.DARKNESS]: neutrals.N800,
};

// Texto activo (seleccionado): claro, sobre el relleno oscuro.
const ACTIVE = "#FFFFFF";

// ── Component ───────────────────────────────────────────────
// Label estilo píldora (borde propio), con relleno solo en el estado
// seleccionado. El borde pertenece a la label y viaja con el contenido al hacer
// scroll; el contenedor no lleva marco exterior.

export function Label({
  label,
  icon,
  selected = false,
  onPress,
  style = LabelStyle.DEFAULT,
  containerStyle,
  accessibilityLabel,
}: LabelProps) {
  const ctx = resolveSemantic(lightSemantic)[STYLE_CONTEXT[style]];
  const color = selected ? ACTIVE : ctx.text.subtle;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { borderColor: BORDER[style], backgroundColor: selected ? FILL[style] : "transparent" },
        pressed && styles.pressed,
        containerStyle,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
    >
      {icon ? <Icon name={icon} size={16} color={color} /> : null}
      <Text variant={TextType.Caption} color={color} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.space1,
    paddingHorizontal: space.space4,
    paddingVertical: space.space2,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});