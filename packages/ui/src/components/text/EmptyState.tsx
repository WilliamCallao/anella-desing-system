import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { card, space, TextType } from "@william-callao/antonella-theme";
import { Text } from "./Text";
import { Icon, type IconName } from "../Icon";

export interface EmptyStateProps {
  icon?: IconName;
  iconSize?: number;
  title: string;
  caption?: string;
  style?: ViewStyle;
}

export function EmptyState({ icon, iconSize = 32, title, caption, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon ? <Icon name={icon} size={iconSize} color={card.text.secondary} /> : null}
      <Text variant={TextType.Heading} color={card.text.primary} style={styles.title}>
        {title}
      </Text>
      {caption ? (
        <Text variant={TextType.Caption} color={card.text.secondary} style={styles.caption}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: space.space2,
    paddingVertical: space.space8,
    paddingHorizontal: space.space5,
  },
  title: {
    textAlign: "center",
  },
  caption: {
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 420,
  },
});
