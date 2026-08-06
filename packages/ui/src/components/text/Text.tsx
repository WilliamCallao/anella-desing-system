import React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { texts, TextType } from "@antonella/theme";

export type TextVariant = TextType;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}

export function Text({ variant = TextType.Body, color, style, ...rest }: TextProps) {
  return (
    <RNText
      style={[
        texts[variant],
        color != null ? { color } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}
