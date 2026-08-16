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
const MIN_AREA_HEIGHT = 72;

export type AppTextAreaProps = AppInputProps & {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  editable?: boolean;
};

export function AppTextArea({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize,
  keyboardType,
  maxLength,
  editable = true,
}: AppTextAreaProps) {
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
        styles.container,
        inputHeight != null && inputHeight > SINGLE_LINE_HEIGHT && styles.containerGrown,
        !editable && styles.containerDisabled,
      ]}
      onPress={focus}
      disabled={!editable}
      activeOpacity={1}
    >
      <Text variant={TextType.Label} numberOfLines={1} style={styles.label}>
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
  container: {
    gap: space.space2,
    minHeight: MIN_AREA_HEIGHT,
    paddingHorizontal: space.space4,
    paddingVertical: space.space3,
  },
  containerGrown: {
    justifyContent: "flex-start",
  },
  containerDisabled: {
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
    textAlign: "left",
    outlineWidth: 0,
  },
});
