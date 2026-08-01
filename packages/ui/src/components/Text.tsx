import React from "react";
import { StyleSheet, Text as RNText, type TextProps as RNTextProps } from "react-native";
import { typography } from "@antonella/theme";

export type TextVariant = keyof typeof typography;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}

export function Text({ variant = "body", color, style, ...rest }: TextProps) {
  return <RNText style={[typography[variant], color ? { color } : undefined, style]} {...rest} />;
}
