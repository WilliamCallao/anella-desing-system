import React from "react";
import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { palette } from "@antonella/theme";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
}

const labelColors: Record<ButtonVariant, string> = {
  primary: "#FFFFFF",
  secondary: palette.text,
  ghost: palette.primary,
  danger: "#FFFFFF",
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  style,
  disabled,
  android_ripple,
  ...rest
}: ButtonProps) {
  const defaultRipple = android_ripple ?? {
    color: variant === "primary" || variant === "danger" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.08)",
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      android_ripple={disabled ? undefined : defaultRipple}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  label: { fontSize: 16, fontWeight: "600" },
  labelSm: { fontSize: 14 },
  labelDisabled: { opacity: 0.6 },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: 6, paddingHorizontal: 12 },
  md: { paddingVertical: 10, paddingHorizontal: 16 },
  lg: { paddingVertical: 14, paddingHorizontal: 20 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: palette.primary },
  secondary: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: palette.danger },
});
