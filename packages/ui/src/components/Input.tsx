import React from "react";
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { palette, spacing } from "@antonella/theme";
import { Icon, type IconName } from "./Icon";

export interface InputProps extends TextInputProps {
  icon?: IconName;
}

export function Input({ style, placeholderTextColor, icon, ...rest }: InputProps) {
  if (icon) {
    return (
      <View style={[styles.inputContainer, style as StyleProp<ViewStyle>]}>
        <Icon name={icon} size={18} color={palette.textMuted} style={styles.icon} />
        <TextInput
          placeholderTextColor={placeholderTextColor ?? palette.textMuted}
          style={styles.inputFlex}
          {...rest}
        />
      </View>
    );
  }

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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.background,
  },
  icon: {
    marginRight: spacing.sm,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: palette.text,
  },
});
