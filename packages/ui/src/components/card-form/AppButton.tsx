import React from "react";
import { StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";
import { appButton, radius } from "@antonella/theme";
import { Text } from "../text/Text";

export type AppButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
};

export function AppButton({
  label,
  onPress,
  disabled = false,
  backgroundColor = appButton.background.default,
  style,
}: AppButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: disabled ? appButton.background.disabled : backgroundColor },
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
        color={disabled ? appButton.text.disabled : appButton.text.default}
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
