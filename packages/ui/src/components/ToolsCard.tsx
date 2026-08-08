import React from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { appInputCard, background, card, palette, radius, space, TextType } from "@antonella/theme";
import { Text } from "./text/Text";
import { Icon, type IconName } from "./Icon";

export interface ToolItem {
  id: string;
  icon: IconName;
  label: string;
  onPress?: () => void;
}

export interface ToolsCardProps {
  tools: ToolItem[];
  style?: ViewStyle;
}

export function ToolsCard({ tools, style }: ToolsCardProps) {
  return (
    <View style={[styles.container, style]}>
      {tools.map((tool, index) => {
        const content = (
          <View style={styles.tool}>
            <Icon name={tool.icon} size={16} color={card.text.primary} />
            <Text variant={TextType.BodyMedium} color={card.text.primary} numberOfLines={1}>
              {tool.label}
            </Text>
          </View>
        );
        return (
          <React.Fragment key={tool.id}>
            {index > 0 ? <View style={styles.separator} /> : null}
            {tool.onPress ? (
              <Pressable
                style={styles.toolWrap}
                onPress={tool.onPress}
                accessibilityRole="button"
                android_ripple={{ color: "rgba(15,23,42,0.08)" }}
              >
                {content}
              </Pressable>
            ) : (
              <View style={styles.toolWrap}>{content}</View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: background.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  separator: {
    width: 1,
    alignSelf: "stretch",
    marginVertical: space.space3,
    backgroundColor: appInputCard.border,
  },
  toolWrap: {
    flex: 1,
  },
  tool: {
    alignItems: "center",
    justifyContent: "center",
    gap: space.space2,
    paddingVertical: space.space4,
    paddingHorizontal: space.space2,
  },
});
