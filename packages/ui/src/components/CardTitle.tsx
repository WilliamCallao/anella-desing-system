import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { neutrals, space } from "@antonella/theme";
import { Text } from "./Text";

export interface CardTitleProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export function CardTitle({ title, subtitle, style }: CardTitleProps) {
  return (
    <View style={[styles.container, style]}>
      <Text variant="heading" color={neutrals.N800} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="caption" color={neutrals.N500} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
});
