import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./text";
import { TextType, resolveSemantic, lightSemantic } from "@william-callao/antonella-theme";

// ── Style enum ──────────────────────────────────────────────

export enum CategoryTextStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

// ── Props ───────────────────────────────────────────────────

export type CategoryTextProps = {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: CategoryTextStyle;
};

// ── Component ───────────────────────────────────────────────

export function CategoryText({
  title,
  action,
  onAction,
  style = CategoryTextStyle.DEFAULT,
}: CategoryTextProps) {
  const s = resolveSemantic(lightSemantic);
  const ctx = s[STYLE_CONTEXT[style]];

  return (
    <View style={styles.row}>
      <Text
        variant={TextType.BodyMedium}
        color={ctx.text.default}
        style={styles.title}
      >
        {title}
      </Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text
            variant={TextType.CaptionMedium}
            color={ctx.text.subtle}
          >
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ── Style config ────────────────────────────────────────────

const STYLE_CONTEXT: Record<CategoryTextStyle, "default" | "light" | "darkness"> = {
  [CategoryTextStyle.DEFAULT]: "default",
  [CategoryTextStyle.LIGHT]: "light",
  [CategoryTextStyle.DARKNESS]: "darkness",
};

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
  },
});
