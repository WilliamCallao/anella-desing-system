import React from "react";
import { StyleSheet, Text as RNText, type TextProps as RNTextProps } from "react-native";
import { neutrals } from "@antonella/theme";

export interface CardTitleProps extends RNTextProps {
  title: string;
  subtitle?: string;
}

export function CardTitle({ title, subtitle, style }: CardTitleProps) {
  return (
    <>
      <RNText style={[styles.title, style]} numberOfLines={1}>
        {title}
      </RNText>
      {subtitle ? (
        <RNText style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </RNText>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: neutrals.N800,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: neutrals.N500,
    marginTop: 2,
  },
});
