import React from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { appInput, spacing, texts, TextType } from "@william-callao/antonella-theme";
import { Text } from "../text/Text";

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** Default `true`. */
  editable?: boolean;
  /** Default `false`. */
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
  /** Default `false`. */
  multiline?: boolean;
  /** Texto de error opcional, se muestra debajo del campo en rojo. */
  error?: string;
  /** Estilo del contenedor (label + campo). */
  style?: StyleProp<ViewStyle>;
}

const FIELD_RADIUS = 10;
const FIELD_MIN_HEIGHT = 44;
const FIELD_MULTILINE_MIN_HEIGHT = 96;

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize,
  maxLength,
  multiline = false,
  error,
  style,
}: TextFieldProps) {
  return (
    <View style={[styles.container, style]}>
      <Text variant={TextType.Label} numberOfLines={1}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          !editable && styles.fieldDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={appInput.placeholder}
        editable={editable}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        multiline={multiline}
        selectionColor={appInput.text}
        underlineColorAndroid="transparent"
      />
      {error ? (
        <Text variant={TextType.Caption} color={appInput.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  field: {
    minHeight: FIELD_MIN_HEIGHT,
    borderRadius: FIELD_RADIUS,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: appInput.background,
    color: appInput.text,
    fontSize: texts.caption.fontSize,
    lineHeight: texts.caption.lineHeight,
    outlineWidth: 0,
    textAlignVertical: "top",
  },
  fieldMultiline: {
    minHeight: FIELD_MULTILINE_MIN_HEIGHT,
  },
  fieldDisabled: {
    opacity: 0.5,
  },
});
