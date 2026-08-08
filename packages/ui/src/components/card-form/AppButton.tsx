import React from "react";
import { StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";
import { appButton, border, radius, text } from "@antonella/theme";
import { Text } from "../text/Text";

export type AppButtonVariant = "solid" | "outline" | "ghost";

export type AppButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: AppButtonVariant;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  style?: ViewStyle;
};

export function AppButton({
  label,
  onPress,
  disabled = false,
  variant = "solid",
  backgroundColor,
  textColor,
  borderColor,
  style,
}: AppButtonProps) {
  const background = disabled
    ? appButton.background.disabled
    : backgroundColor ??
      (variant === "solid" ? appButton.background.default : "transparent");
  const foreground = disabled
    ? appButton.text.disabled
    : textColor ?? (variant === "solid" ? appButton.text.default : text.default);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: background },
        variant === "outline" && {
          borderWidth: 1,
          borderColor: borderColor ?? border.divider.secondary,
        },
        variant === "ghost" && {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: borderColor ?? border.divider.secondary,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text
        variant="label"
        color={foreground}
        style={styles.label}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
  },
});
