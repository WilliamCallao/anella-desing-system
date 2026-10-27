import React, { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type KeyboardTypeOptions,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
} from "react-native";
import { appInput, appInputCard, spacing, text, texts, TextType } from "@william-callao/antonella-theme";
import { Text } from "../text/Text";
import { Icon, type IconName } from "../Icon";
import type { AppInputProps } from "./AppInput";
import { CARD_ERROR, CARD_ROW, CARD_TEXT, SINGLE_LINE_HEIGHT } from "./cardForm";

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
  error,
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
  // Fila que no se puede usar: o el campo esta deshabilitado, o es de solo
  // lectura sin accion asociada. El label queda negro (nombre legible) y el
  // valor pasa a gris, igual que una fila de solo lectura; nunca se baja la
  // opacidad de toda la fila (label 3.99:1, valor 1.96:1).
  const looksInactive = !editable || (readOnly && !onPressOverride);

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
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[
          styles.row,
          inputHeight != null && inputHeight > SINGLE_LINE_HEIGHT + 1 && styles.rowGrown,
        ]}
        onPress={() => (onPressOverride ? onPressOverride() : focus())}
        disabled={looksInactive}
        activeOpacity={1}
        // La fila solo enfoca el campo: no es un control propio para lectores de
        // pantalla (el nombre accesible vive en el TextInput).
        accessible={false}
      >
        <Text
          variant={TextType.Label}
          numberOfLines={1}
          color={error ? appInput.error : undefined}
          // El nombre del campo lo anuncia el TextInput; sin esto TalkBack lee el
          // label como un nodo suelto y después el campo sin nombre.
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[styles.label, CARD_TEXT, labelWidth != null && { width: labelWidth }]}
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
              color: looksInactive ? text.readOnly : text.default,
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
          editable={canType}
          accessibilityLabel={label}
          accessibilityState={{ disabled: looksInactive }}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    ...CARD_ROW,
  },
  rowGrown: {
    alignItems: "flex-start",
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
    // Android: sin el padding extra de fuente, `contentSize` es exactamente el
    // interlineado y la fila no cambia de alto entre vacio y una linea.
    includeFontPadding: false,
  },
  trailingAction: {
    marginLeft: spacing.xs,
    justifyContent: "center",
  },
  error: {
    ...CARD_ERROR,
  },
});
