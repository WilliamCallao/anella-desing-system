import React, { useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type KeyboardTypeOptions,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
} from "react-native";
import { appInput, appInputCard, text, texts, TextType, space } from "@william-callao/antonella-theme";
import { Text } from "../text/Text";
import type { AppInputProps } from "./AppInput";
import { CARD_ERROR, CARD_TEXT, SINGLE_LINE_HEIGHT } from "./cardForm";

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
  error,
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
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[
          styles.container,
          inputHeight != null && inputHeight > SINGLE_LINE_HEIGHT && styles.containerGrown,
        ]}
        onPress={focus}
        disabled={!editable}
        activeOpacity={1}
      >
        <Text
          variant={TextType.Label}
          numberOfLines={1}
          color={error ? appInput.error : undefined}
          style={[styles.label, CARD_TEXT]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {label}
        </Text>
        <TextInput
          ref={inputRef}
          style={[
            styles.value,
            {
              fontSize: CARD_TEXT.fontSize,
              lineHeight: CARD_TEXT.lineHeight,
              letterSpacing: CARD_TEXT.letterSpacing,
              fontWeight: texts.value.fontWeight,
              color: editable ? text.default : text.readOnly,
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
          placeholderTextColor={appInputCard.text.placeholder}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={editable}
          accessibilityLabel={label}
          accessibilityState={{ disabled: !editable }}
          selectionColor={text.default}
          underlineColorAndroid="transparent"
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          blurOnSubmit
          submitBehavior="blurAndSubmit"
        />
      </TouchableOpacity>
      {error ? (
        <Text
          variant={TextType.Caption}
          color={appInput.error}
          style={styles.error}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "stretch",
  },
  container: {
    gap: space.space2,
    minHeight: MIN_AREA_HEIGHT,
    paddingHorizontal: space.space4,
    paddingVertical: space.space3,
  },
  containerGrown: {
    justifyContent: "flex-start",
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
    includeFontPadding: false,
  },
  error: {
    ...CARD_ERROR,
  },
});
