import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { card, TextType } from "@antonella/theme";
import { Text } from "./Text";

export interface AppTextHeaderProps {
  heading: string;
  caption?: string;
  style?: ViewStyle;
}

export function AppTextHeader({ heading, caption, style }: AppTextHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Text variant={TextType.Heading} color={card.text.primary}>
        {heading}
      </Text>
      {caption ? (
        <Text variant={TextType.Caption} color={card.text.secondary}>
          {caption}
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
