import React, { useRef } from "react";
import { StyleSheet, TextInput, TouchableOpacity, type KeyboardTypeOptions } from "react-native";
import { appInputCard, spacing } from "@antonella/theme";
import { Text } from "../Text";
import type { AppInputProps } from "./AppInput";

export type AppTextInputProps = AppInputProps & {
  type?: "text";
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  editable?: boolean;
};

export function AppTextInput({
  label,
  labelWidth,
  value,
  onChangeText,
  placeholder,
  autoCapitalize,
  keyboardType,
  maxLength,
  editable = true,
}: AppTextInputProps) {
  const inputRef = useRef<TextInput>(null);

  const focus = () => {
    if (editable) inputRef.current?.focus();
  };

  return (
    <TouchableOpacity
      style={[styles.row, !editable && styles.rowDisabled]}
      onPress={focus}
      disabled={!editable}
      activeOpacity={1}
    >
      <Text
        variant="body"
        numberOfLines={1}
        style={[styles.label, labelWidth != null && { width: labelWidth }]}
      >
        {label}
      </Text>
      <TextInput
        ref={inputRef}
        style={styles.value}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={appInputCard.text.placeholder}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={editable}
        selectionColor={appInputCard.text.label}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  label: {
    flexShrink: 0,
    fontSize: 15,
    fontWeight: "600",
    color: appInputCard.text.label,
  },
  value: {
    flex: 1,
    padding: 0,
    paddingRight: 2,
    fontSize: 14,
    textAlign: "right",
    color: appInputCard.text.value,
  },
});
