import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
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
  /** Texto secundario debajo del título (opcional). */
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  /** Ícono opcional a la derecha de la acción (edición, configuración, agregar, etc.). */
  actionIcon?: IconName;
  /** Handler del ícono. Si no se pasa, usa onAction. */
  onActionIcon?: () => void;
  style?: CategoryTextStyle;
  /** Padding horizontal de la fila (si no se pasa, 0). */
  horizontalPadding?: number;
  /** Override de estilo para la fila contenedora (p. ej. quitar el marginBottom por defecto). */
  containerStyle?: StyleProp<ViewStyle>;
};

// ── Component ───────────────────────────────────────────────

export function CategoryText({
  title,
  subtitle,
  action,
  onAction,
  actionIcon,
  onActionIcon,
  style = CategoryTextStyle.DEFAULT,
  horizontalPadding,
  containerStyle,
}: CategoryTextProps) {
  const s = resolveSemantic(lightSemantic);
  const ctx = s[STYLE_CONTEXT[style]];
  const handleIcon = onActionIcon ?? onAction;

  return (
    <View style={[styles.row, horizontalPadding != null ? { paddingHorizontal: horizontalPadding } : null, containerStyle]}>
      <View style={styles.textWrap}>
        <Text
          variant={TextType.BodyBold}
          color={neutrals.N500}
          style={styles.title}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            variant={TextType.Caption}
            color={ctx.text.subtle}
            style={styles.subtitle}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
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
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  subtitle: {
    marginTop: space.space1,
  },
  iconTouch: {
    paddingLeft: space.space1,
  },
});
