import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { appButton, appInputCard, radius, space, text } from "@william-callao/antonella-theme";
import { Text } from "../text/Text";
import { TrackedPressable } from "../TrackedPressable";

export type AppButtonVariant = "solid" | "outline" | "ghost";

export type AppButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Muestra un spinner a la derecha del texto y bloquea el tap mientras dura. */
  loading?: boolean;
  variant?: AppButtonVariant;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  style?: ViewStyle;
};

export function AppButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "solid",
  backgroundColor,
  textColor,
  borderColor,
  style,
}: AppButtonProps) {
  // Mientras carga, el botón NO es accionable (evita dobles taps) pero conserva
  // su color normal: el spinner comunica el estado, no el gris de "disabled".
  const interactiveDisabled = disabled || loading;
  const background = disabled
    ? appButton.background.disabled
    : backgroundColor ??
      (variant === "solid" ? appButton.background.default : "transparent");
  const foreground = disabled
    ? appButton.text.disabled
    : textColor ?? (variant === "solid" ? appButton.text.default : text.default);

  return (
    <TrackedPressable
      tracking={{ component: "AppButton", label, kind: "button", data: { variant } }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background },
        variant === "outline" && {
          borderWidth: 1,
          borderColor: borderColor ?? appInputCard.border,
        },
        variant === "ghost" && {
          borderWidth: 1,
          borderColor: borderColor ?? appInputCard.border,
        },
        style,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={interactiveDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: interactiveDisabled, busy: loading }}
    >
      <View style={styles.content}>
        <Text variant="label" color={foreground} style={styles.label}>
          {label}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={foreground} style={styles.spinner} />
        ) : null}
      </View>
    </TrackedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
  },
  spinner: {
    marginLeft: space.space2,
  },
  pressed: {
    opacity: 0.7,
  },
});
