import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { appInput, appInputCard, spacing, space, text, texts, TextType } from "@william-callao/antonella-theme";
import { Icon, type IconName } from "./Icon";
import { Text } from "./text/Text";

export interface InputProps extends TextInputProps {
  icon?: IconName;
  /** Estilos aplicados al campo de texto interno (también cuando hay icono/ojito). */
  inputStyle?: StyleProp<TextStyle>;
  /** Muestra el ojito para alternar ver/ocultar en campos `secureTextEntry`. */
  showToggle?: boolean;
  /** Si se define, marca el input con borde rojo y muestra el mensaje debajo
   * (errores de validación previos a consultar el backend). */
  error?: string;
}

const INPUT_RADIUS = 16;

export function Input({
  style,
  inputStyle,
  placeholderTextColor,
  icon,
  showToggle,
  error,
  secureTextEntry = false,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isSecure = secureTextEntry === true;
  const effectiveSecure = isSecure && !visible;
  const showEye = showToggle === true && isSecure;
  const hasDecorations = icon != null || showEye;
  const hasError = Boolean(error);
  const borderColor = hasError ? appInput.error : focused ? text.secondary : appInputCard.border;

  const toggleVisible = () => setVisible((prev) => !prev);

  const field = hasDecorations ? (
    <View
      style={[
        styles.container,
        { borderColor },
        showEye ? styles.eyeContainer : null,
        style as StyleProp<ViewStyle>,
      ]}
    >
      {icon ? (
        <Icon name={icon} size={18} color={text.secondary} style={styles.sideIcon} />
      ) : null}
      <TextInput
        placeholderTextColor={placeholderTextColor ?? appInput.placeholder}
        style={[styles.field, inputStyle as StyleProp<TextStyle>]}
        secureTextEntry={effectiveSecure}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {showEye ? (
        <Pressable
          onPress={toggleVisible}
          hitSlop={8}
          style={styles.toggle}
          accessibilityRole="button"
          accessibilityLabel={effectiveSecure ? "Mostrar contraseña" : "Ocultar contraseña"}
        >
          <Icon
            name={effectiveSecure ? "eye" : "eye-off"}
            size={20}
            color={text.secondary}
          />
        </Pressable>
      ) : null}
    </View>
  ) : (
    <TextInput
      placeholderTextColor={placeholderTextColor ?? appInput.placeholder}
      style={[
        styles.input,
        { borderColor },
        inputStyle as StyleProp<TextStyle>,
      ]}
      secureTextEntry={secureTextEntry}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...rest}
    />
  );

  return (
    <View style={styles.wrapper}>
      {field}
      {hasError ? (
        <Text variant={TextType.Caption} color={appInput.error} style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: appInputCard.border,
    borderRadius: INPUT_RADIUS,
    paddingLeft: space.space5,
    paddingRight: spacing.xl,
    paddingVertical: spacing.sm,
    fontSize: texts.caption.fontSize,
    lineHeight: texts.caption.lineHeight,
    color: appInput.text,
    backgroundColor: appInput.background,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: appInputCard.border,
    borderRadius: INPUT_RADIUS,
    paddingHorizontal: spacing.lg,
    backgroundColor: appInput.background,
    overflow: "hidden",
  },
  eyeContainer: {
    paddingRight: 0,
  },
  field: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: texts.caption.fontSize,
    lineHeight: texts.caption.lineHeight,
    color: appInput.text,
  },
  sideIcon: {
    marginRight: spacing.sm,
  },
  toggle: {
    marginLeft: spacing.xs,
    paddingRight: spacing.lg,
    paddingVertical: spacing.xs,
    justifyContent: "center",
  },
  wrapper: {
    alignItems: "stretch",
  },
  error: {
    marginTop: spacing.xs,
  },
});