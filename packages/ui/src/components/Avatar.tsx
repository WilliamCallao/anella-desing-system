import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { space, cta1, texts, resolveText, lightText } from "@antonella/theme";
import { Text } from "./text";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = {
  name: string;
  email?: string;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
};

const SIZE_MAP: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

const FONT_SIZE_MAP: Record<AvatarSize, number> = {
  sm: 13,
  md: 16,
  lg: 22,
};

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

const textColors = resolveText(lightText);

export function Avatar({ name, email, size = "md", style }: AvatarProps) {
  const dimension = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];

  return (
    <View style={[styles.row, style]}>
      <View
        style={[
          styles.circle,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
          },
        ]}
      >
        <Text
          variant="heading"
          color={textColors.light}
          style={{ fontSize, lineHeight: fontSize + 4 }}
        >
          {getInitial(name)}
        </Text>
      </View>

      <View style={styles.textBlock}>
        <Text
          variant="bodyBold"
          color={textColors.light}
          numberOfLines={1}
          style={size === "sm" ? styles.textSm : undefined}
        >
          {name}
        </Text>
        {email ? (
          <Text
            variant="caption"
            color={textColors.subtle}
            numberOfLines={1}
            style={size === "sm" ? styles.textSm : undefined}
          >
            {email}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space3,
  },
  circle: {
    backgroundColor: cta1,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  textSm: {
    fontSize: texts.caption.fontSize,
    lineHeight: texts.caption.lineHeight,
  },
});
