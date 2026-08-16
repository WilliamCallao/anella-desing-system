import React, { useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  type KeyboardTypeOptions,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
} from "react-native";
import { spacing, text, texts, TextType, space } from "@antonella/theme";
import { Text } from "../text/Text";
import type { AppInputProps } from "./AppInput";

const SINGLE_LINE_HEIGHT = 18;

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
  const [inputHeight, setInputHeight] = useState<number | undefined>(undefined);

  const focus = () => {
    if (editable) inputRef.current?.focus();
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
      onPress={focus}
      disabled={!editable}
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
        editable={editable}
        selectionColor={text.default}
        underlineColorAndroid="transparent"
        multiline
        scrollEnabled={false}
        textAlignVertical="top"
        blurOnSubmit
        submitBehavior="blurAndSubmit"
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
});
