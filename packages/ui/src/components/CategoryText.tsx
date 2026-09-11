import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./text";
import { Icon, type IconName } from "./Icon";
import { TextType, resolveSemantic, lightSemantic, space, neutrals } from "@william-callao/antonella-theme";

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
  /** Ícono opcional a la derecha de la acción (edición, configuración, agregar, etc.). */
  actionIcon?: IconName;
  /** Handler del ícono. Si no se pasa, usa onAction. */
  onActionIcon?: () => void;
  style?: CategoryTextStyle;
};

// ── Component ───────────────────────────────────────────────

export function CategoryText({
  title,
  action,
  onAction,
  actionIcon,
  onActionIcon,
  style = CategoryTextStyle.DEFAULT,
}: CategoryTextProps) {
  const s = resolveSemantic(lightSemantic);
  const ctx = s[STYLE_CONTEXT[style]];
  const handleIcon = onActionIcon ?? onAction;

  return (
    <View style={styles.row}>
      <Text
        variant={TextType.BodyBold}
        color={neutrals.N500}
        style={styles.title}
      >
        {title}
      </Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text
            variant={TextType.CaptionMedium}
            color={ctx.text.default}
          >
            {action}
          </Text>
        </Pressable>
      ) : null}
      {actionIcon ? (
        <Pressable onPress={handleIcon} hitSlop={8} style={styles.iconTouch}>
          <Icon name={actionIcon} size={16} color={ctx.text.default} />
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
    gap: space.space2,
    paddingHorizontal: 0,
    marginBottom: space.space3,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  iconTouch: {
    paddingLeft: space.space1,
  },
});
