import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { space, neutrals, TextType } from "@william-callao/antonella-theme";
import { Text } from "./text";
import { Icon, type IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum ListItemStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

// ── Props ───────────────────────────────────────────────────

export type ListItemProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  trailing?: IconName;
  style?: ListItemStyle;
  /** Ítem oculto/inactivo: atenúa la fila y el subtitle. */
  dimmed?: boolean;
  /** Línea divisoria inferior. */
  separator?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

// ── Component ───────────────────────────────────────────────

export function ListItem({
  title,
  subtitle,
  onPress,
  trailing = "chevron-forward",
  style = ListItemStyle.DEFAULT,
  dimmed = false,
  separator = false,
  containerStyle,
}: ListItemProps) {
  const c = STYLE_COLORS[style];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.pressed,
        dimmed && styles.dimmed,
        separator && styles.separator && { borderBottomColor: c.separator },
        containerStyle,
      ]}
      accessibilityRole="button"
    >
      <View style={styles.body}>
        <Text variant={TextType.BodyMedium} color={c.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant={TextType.Caption} color={dimmed ? c.subtitleDimmed : c.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Icon name={trailing} size={18} color={c.icon} />
    </Pressable>
  );
}

// ── Default color maps per style ────────────────────────────

const STYLE_COLORS: Record<
  ListItemStyle,
  {
    title: string;
    subtitle: string;
    subtitleDimmed: string;
    icon: string;
    separator: string;
  }
> = {
  [ListItemStyle.DEFAULT]: {
    title: neutrals.N950,
    subtitle: neutrals.N500,
    subtitleDimmed: neutrals.N400,
    icon: neutrals.N500,
    separator: neutrals.N200,
  },
  [ListItemStyle.LIGHT]: {
    title: neutrals.N950,
    subtitle: neutrals.N600,
    subtitleDimmed: neutrals.N400,
    icon: neutrals.N600,
    separator: neutrals.N200,
  },
  [ListItemStyle.DARKNESS]: {
    title: neutrals.N0,
    subtitle: neutrals.N400,
    subtitleDimmed: neutrals.N600,
    icon: neutrals.N400,
    separator: "rgba(255,255,255,0.12)",
  },
};

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: space.space3,
    paddingHorizontal: space.space2,
    gap: space.space2,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.7,
  },
  dimmed: {
    opacity: 0.55,
  },
  body: {
    flex: 1,
    gap: 2,
  },
});