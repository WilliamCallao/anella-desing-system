import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { neutrals, space } from "@antonella/theme";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

export type ChipVariant = "subtle" | "solid" | "outlined";
export type ChipSize = "sm" | "md";

export type ChipProps = {
  label: string;
  color?: string;
  backgroundColor?: string;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: IconName;
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
};

export function Chip({
  label,
  color = neutrals.N800,
  backgroundColor,
  variant = "subtle",
  size = "sm",
  icon,
  uppercase = false,
  style,
  textStyle,
  onPress,
}: ChipProps) {
  const isSm = size === "sm";

  const resolvedBg =
    backgroundColor ??
    (variant === "solid"
      ? color
      : variant === "subtle"
      ? "transparent"
      : "transparent");

  const resolvedTextColor =
    variant === "solid" ? neutrals.N0 : color;

  const resolvedBorderColor =
    variant === "outlined" ? color : "transparent";

  const content = (
    <View
      style={[
        styles.base,
        isSm ? styles.sm : styles.md,
        {
          backgroundColor: resolvedBg,
          borderColor: resolvedBorderColor,
          borderWidth: variant === "outlined" ? 1 : 0,
        },
        style,
      ]}
    >
      {icon ? (
        <Icon
          name={icon}
          size={isSm ? 12 : 14}
          color={resolvedTextColor}
        />
      ) : null}
      <Text
        variant="caption"
        style={[
          styles.text,
          isSm ? styles.textSm : styles.textMd,
          { color: resolvedTextColor },
          uppercase && styles.uppercase,
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 999,
    gap: space.space1,
  },
  sm: {
    paddingHorizontal: space.space2,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: space.space3,
    paddingVertical: 4,
  },
  text: {
    fontWeight: "600",
  },
  textSm: {
    fontSize: 11,
    lineHeight: 14,
  },
  textMd: {
    fontSize: 13,
    lineHeight: 18,
  },
  uppercase: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
});
