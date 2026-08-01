import React from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { palette, spacing } from "@antonella/theme";

export interface InputProps extends TextInputProps {}

export function Input({ style, placeholderTextColor, ...rest }: InputProps) {
  return (
    <TextInput
      placeholderTextColor={placeholderTextColor ?? palette.textMuted}
      style={[styles.input, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: palette.text,
    backgroundColor: palette.background,
  },
});
