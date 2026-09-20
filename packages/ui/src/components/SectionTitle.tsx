import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { space, TextType } from "@william-callao/antonella-theme";
import { Text } from "./text/Text";

export interface SectionTitleProps {
  title: string;
  description?: string;
  style?: ViewStyle;
}

export function SectionTitle({ title, description, style }: SectionTitleProps) {
  return (
    <View style={[styles.container, style]}>
      <Text variant={TextType.Subtitle} style={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text variant={TextType.Caption} style={styles.description}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: space.space1,
  },
  title: {
    textAlign: "center",
    letterSpacing: -0.5,
    fontWeight: "800",
    transform: [{ scaleY: 1.05 }, { scaleX: 0.96 }],
  },
  description: {
    textAlign: "center",
  },
});