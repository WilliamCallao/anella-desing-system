import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { card, space } from "@antonella/theme";
import { Text } from "./text/Text";

export interface CardTitleProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export function CardTitle({ title, subtitle, style }: CardTitleProps) {
  return (
    <View style={[styles.container, style]}>
      <Text variant="heading" color={card.text.primary} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="caption" color={card.text.secondary} numberOfLines={1}>
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
