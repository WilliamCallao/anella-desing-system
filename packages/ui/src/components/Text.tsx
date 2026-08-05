import React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { appInputCard, card, typography } from "@antonella/theme";

export type TextVariant = keyof typeof typography;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}

const defaultColors: Partial<Record<TextVariant, string>> = {
  h3: card.text.primary,
  label: appInputCard.text.label,
  content: appInputCard.text.value,
  secondary: appInputCard.text.placeholder,
};

export function Text({ variant = "body", color, style, ...rest }: TextProps) {
  return (
    <RNText
      style={[
        typography[variant],
        color != null ? { color } : defaultColors[variant] != null ? { color: defaultColors[variant] } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}
