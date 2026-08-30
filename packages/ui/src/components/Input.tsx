import React from "react";
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { appInput, spacing, text, texts } from "@william-callao/antonella-theme";
import { Icon, type IconName } from "./Icon";

export interface InputProps extends TextInputProps {
  icon?: IconName;
}

export function Input({ style, placeholderTextColor, icon, ...rest }: InputProps) {
  if (icon) {
    return (
      <View style={[styles.inputContainer, style as StyleProp<ViewStyle>]}>
        <Icon name={icon} size={18} color={text.secondary} style={styles.icon} />
        <TextInput
          placeholderTextColor={placeholderTextColor ?? appInput.placeholder}
          style={styles.inputFlex}
          {...rest}
        />
      </View>
    );
  }

  return (
    <TextInput
      placeholderTextColor={placeholderTextColor ?? appInput.placeholder}
      style={[styles.input, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: texts.caption.fontSize,
    lineHeight: texts.caption.lineHeight,
    color: appInput.text,
    backgroundColor: appInput.background,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: appInput.background,
  },
  icon: {
    marginRight: spacing.sm,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: texts.caption.fontSize,
    lineHeight: texts.caption.lineHeight,
    color: appInput.text,
  },
});
