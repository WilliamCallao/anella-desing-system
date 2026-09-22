import React, { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  type KeyboardTypeOptions,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
} from "react-native";
import { spacing, text, texts, TextType, space } from "@william-callao/antonella-theme";
import { Text } from "../text/Text";
import { Icon, type IconName } from "../Icon";
import type { AppInputProps } from "./AppInput";

const SINGLE_LINE_HEIGHT = 18;

export type AppTextInputProps = AppInputProps & {
  type?: "text";
  value: string;
  /** Opcional: los campos de solo lectura (readOnly u onPress) completados por
   *  escaneo no necesitan proveer un handler de texto. */
  onChangeText?: (value: string) => void;
  placeholder?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  editable?: boolean;
  /** Solo lectura: bloquea el ingreso de texto (sin teclado) pero conserva el
   *  aspecto normal de la fila y deja operativas las acciones (p. ej. escanear). */
  readOnly?: boolean;
  /** Al tocar la fila: si se pasa, se usa este handler en vez de enfocar el
   *  input (p. ej. campos que solo se completan escaneando: tocar el campo abre
   *  el escáner y no el teclado). */
  onPress?: () => void;
  /** Botón de acción a la derecha del campo (ej. escanear un código). */
  trailingAction?: {
    icon: IconName;
    onPress: () => void;
    accessibilityLabel?: string;
  };
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
  readOnly = false,
  trailingAction,
  onPress: onPressOverride,
}: AppTextInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [inputHeight, setInputHeight] = useState<number | undefined>(undefined);

  const canType = editable && !readOnly;

  const focus = () => {
    if (canType) inputRef.current?.focus();
  };

  const handleContentSizeChange = (
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>
  ) => {
    setInputHeight(event.nativeEvent.contentSize.height);
  };

  const handleSubmitEditing = () => {
    inputRef.current?.blur();
  };

  return (
    <TouchableOpacity
      style={[
        styles.row,
        inputHeight != null && inputHeight > SINGLE_LINE_HEIGHT && styles.rowGrown,
        !editable && styles.rowDisabled,
      ]}
      onPress={() => (onPressOverride ? onPressOverride() : focus())}
      disabled={!editable && !readOnly}
      activeOpacity={1}
    >
      <Text
        variant={TextType.Label}
        numberOfLines={1}
        style={[styles.label, labelWidth != null && { width: labelWidth }]}
      >
        {label}
      </Text>
      <TextInput
        ref={inputRef}
        style={[
          styles.value,
          {
            fontSize: texts.caption.fontSize,
            lineHeight: texts.caption.lineHeight,
            color: text.default,
          },
          inputHeight != null && {
            height: Math.max(inputHeight, SINGLE_LINE_HEIGHT),
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        onContentSizeChange={handleContentSizeChange}
        onSubmitEditing={handleSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={texts.placeholder.color}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={canType}
        selectionColor={text.default}
        underlineColorAndroid="transparent"
        multiline
        scrollEnabled={false}
        textAlignVertical="top"
        blurOnSubmit
        submitBehavior="blurAndSubmit"
      />
      {trailingAction ? (
        <Pressable
          onPress={trailingAction.onPress}
          hitSlop={8}
          style={styles.trailingAction}
          accessibilityRole="button"
          accessibilityLabel={trailingAction.accessibilityLabel}
        >
          <Icon name={trailingAction.icon} size={20} color={text.secondary} />
        </Pressable>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: space.space4,
    paddingVertical: space.space4,
  },
  rowGrown: {
    alignItems: "flex-start",
  },
  rowDisabled: {
    opacity: 0.5,
  },
  label: {
    flexShrink: 0,
  },
  value: {
    flex: 1,
    minHeight: SINGLE_LINE_HEIGHT,
    padding: 0,
    paddingRight: 2,
    textAlign: "right",
    outlineWidth: 0,
  },
  trailingAction: {
    marginLeft: spacing.xs,
    justifyContent: "center",
  },
});
