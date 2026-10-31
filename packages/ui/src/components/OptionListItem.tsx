import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { border, palette, space, text, TextType } from "@william-callao/antonella-theme";
import { Icon, type IconName } from "./Icon";
import { Text } from "./text/Text";
import { TrackedPressable } from "./TrackedPressable";

export enum OptionListItemVariant {
  Default = "default",
  Destructive = "destructive",
}

export type OptionListItemProps = {
  icon: IconName;
  title: string;
  description?: string;
  onPress: () => void;
  variant?: OptionListItemVariant;
  trailing?: IconName;
  /** Color del ícono. Por defecto el color de texto; en Destructive rojo. */
  iconColor?: string;
  showSeparator?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function OptionListItem({
  icon,
  title,
  description,
  onPress,
  variant = OptionListItemVariant.Default,
  trailing = "chevron-forward",
  iconColor,
  showSeparator = false,
  style,
}: OptionListItemProps) {
  const destructive = variant === OptionListItemVariant.Destructive;
  const iconTint = iconColor ?? (destructive ? palette.danger : text.default);

  return (
    <TrackedPressable
      onPress={onPress}
      tracking={{ component: "OptionListItem", label: title, kind: "item" }}
      style={({ pressed }) => [
        styles.row,
        showSeparator && styles.separator,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
    >
      <Icon name={icon} size={22} color={iconTint} />
      <View style={styles.body}>
        <Text variant={TextType.BodyMedium} color={destructive ? palette.danger : text.default}>
          {title}
        </Text>
        {description ? (
          <Text variant={TextType.Caption} color={text.secondary}>
            {description}
          </Text>
        ) : null}
      </View>
      <Icon name={trailing} size={18} color={text.secondary} />
    </TrackedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space3,
    // 14 + 20 (title) + 14 = 48dp: mínimo de target táctil de Material.
    paddingVertical: 14,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: border.divider.secondary,
  },
  pressed: {
    opacity: 0.7,
  },
  body: {
    flex: 1,
    gap: 2,
  },
});
