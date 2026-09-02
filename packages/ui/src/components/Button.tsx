import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { background, card, palette, texts } from "@william-callao/antonella-theme";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  /** Muestra un spinner centrado en lugar del label (y deshabilita el botón). */
  loading?: boolean;
}

const labelColors: Record<ButtonVariant, string> = {
  primary: "#FFFFFF",
  secondary: card.text.primary,
  ghost: palette.primary,
  danger: "#FFFFFF",
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  style,
  disabled,
  loading = false,
  android_ripple,
  ...rest
}: ButtonProps) {
  const defaultRipple = android_ripple ?? {
    color: variant === "primary" || variant === "danger" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.08)",
  };
  const isDisabled = disabled === true || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      android_ripple={isDisabled ? undefined : defaultRipple}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        pressed && !isDisabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={labelColors[variant]} size="small" />
      ) : (
        <Text
          style={[
            styles.label,
            size === "sm" && styles.labelSm,
            { color: labelColors[variant] },
            disabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  label: { fontSize: texts.bodyBold.fontSize, fontWeight: texts.bodyBold.fontWeight },
  labelSm: { fontSize: texts.label.fontSize },
  labelDisabled: { opacity: 0.6 },
});

const sizeStyles = StyleSheet.create({
  sm: { height: 36, paddingHorizontal: 12 },
  md: { height: 44, paddingHorizontal: 16 },
  lg: { height: 54, paddingHorizontal: 20 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: palette.primary },
  secondary: { backgroundColor: card.background, borderWidth: 1, borderColor: background.default },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: palette.danger },
});
