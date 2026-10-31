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
import { appInput, appInputCard, brand, spacing, text, texts, TextType } from "@william-callao/antonella-theme";
import { Text } from "../text/Text";
import { Icon, type IconName } from "../Icon";
import type { AppInputProps } from "./AppInput";
import { CARD_ERROR, CARD_ROW, CARD_TEXT, SINGLE_LINE_HEIGHT } from "./cardForm";

export type AppTextInputProps = AppInputProps & {
  type?: "text";
  value: string;
  /**
   * Componente único para filas de input de `card-form`:
   * - editable (default): abre teclado.
   * - `readOnly`: no abre teclado; combinar con `onPress` (selector) o
   *   `trailingAction` (escáner).
   * - `selectable`: fila de selección; cualquier toque dispara `onPress` y el
   *   input no captura texto ni foco.
   * - `editable={false}`: fila deshabilitada; usar `trailingIcon` (p. ej. lock).
   * - `error`: pinta label y mensaje en rojo.
   */
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
  /** Icono decorativo a la derecha (ej. `lock` en un campo bloqueado). */
  trailingIcon?: IconName;
  /**
   * Fila de selección: cualquier toque dispara `onPress` y el input no captura
   * texto ni foco. Requiere `onPress`.
   */
  selectable?: boolean;
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
  selectable = false,
  trailingAction,
  trailingIcon,
  onPress: onPressOverride,
}: AppTextInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [inputHeight, setInputHeight] = useState<number | undefined>(undefined);

  const canType = editable && !readOnly && !selectable;
  // Fila que no se puede usar: o el campo esta deshabilitado, o es de solo
  // lectura sin accion asociada. El label queda negro (nombre legible) y el
  // valor pasa a gris, igual que una fila de solo lectura; nunca se baja la
  // opacidad de toda la fila (label 3.99:1, valor 1.96:1).
  const looksInactive =
    !editable || ((readOnly || selectable) && !onPressOverride);
  const rowIsAction = selectable || onPressOverride != null;

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
        accessible={rowIsAction}
        accessibilityRole={rowIsAction ? "button" : undefined}
        accessibilityLabel={
          rowIsAction ? `${label}: ${value || placeholder || ""}` : undefined
        }
        accessibilityState={rowIsAction ? { disabled: looksInactive } : undefined}
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
        <View
          style={styles.inputArea}
          pointerEvents={rowIsAction ? "none" : "auto"}
        >
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
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            maxLength={maxLength}
            editable={canType}
            accessibilityLabel={label}
            accessibilityState={{ disabled: looksInactive }}
            accessibilityElementsHidden={rowIsAction}
            importantForAccessibility={rowIsAction ? "no" : "auto"}
            selectionColor={brand.M300}
            underlineColorAndroid="transparent"
            multiline
            scrollEnabled={false}
            textAlignVertical="top"
            blurOnSubmit
            submitBehavior="blurAndSubmit"
          />
          {value === "" && placeholder != null && placeholder !== "" ? (
            <View
              style={styles.placeholderOverlay}
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Text
                variant={TextType.Value}
                color={appInputCard.text.placeholder}
                numberOfLines={1}
                style={[CARD_TEXT, styles.placeholder]}
              >
                {placeholder}
              </Text>
            </View>
          ) : null}
        </View>
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
        {trailingIcon ? (
          <View style={styles.trailingAction}>
            <Icon name={trailingIcon} size={16} color={text.secondary} />
          </View>
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
  inputArea: {
    flex: 1,
    justifyContent: "center",
  },
  placeholderOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
  },
  placeholder: {
    fontWeight: "300",
    textAlign: "right",
    paddingRight: 2,
    includeFontPadding: false,
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
