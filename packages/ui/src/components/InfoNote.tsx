import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { brand, neutrals, radius, space, text, TextType } from "@william-callao/antonella-theme";
import { Icon, type IconName } from "./Icon";
import { Label, LabelStyle } from "./Label";
import { Text } from "./text/Text";

export type InfoNoteTone = "light" | "dark";

export type InfoNoteAction = {
  label: string;
  icon?: IconName;
  onPress: () => void;
  accessibilityLabel?: string;
};

export type InfoNoteProps = {
  title?: string;
  message: string;
  icon?: IconName;
  /** Acciones que se muestran debajo de la nota, alineadas a la izquierda. */
  actions?: InfoNoteAction[];
  /** Superficie sobre la que se pinta la nota. */
  tone?: InfoNoteTone;
  style?: StyleProp<ViewStyle>;
};

/**
 * Nota informativa compacta para formularios y selectores: fondo suave de marca,
 * borde tenue e icono de información. Si recibe acciones, las acomoda debajo con
 * la misma separación que existe entre ellas.
 */
export function InfoNote({
  title,
  message,
  icon = "information-circle",
  actions,
  tone = "light",
  style,
}: InfoNoteProps) {
  const isDark = tone === "dark";
  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.note, isDark ? styles.noteDark : undefined]}>
        <Icon name={icon} size={20} color={isDark ? brand.M300 : brand.M600} />
        <View style={styles.content}>
          {title ? (
            <Text variant={TextType.BodyMedium} color={isDark ? neutrals.N0 : undefined}>
              {title}
            </Text>
          ) : null}
          <Text variant={TextType.Caption} color={isDark ? neutrals.N300 : text.default}>
            {message}
          </Text>
        </View>
      </View>
      {actions && actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((action, index) => (
            <Label
              key={`${action.label}-${index}`}
              label={action.label}
              icon={action.icon}
              onPress={action.onPress}
              accessibilityLabel={action.accessibilityLabel}
              style={isDark ? LabelStyle.DARKNESS : undefined}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: space.space2,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.space2,
    padding: space.space3,
    backgroundColor: brand.M50,
    borderWidth: 1,
    borderColor: brand.M200,
    borderRadius: radius.md,
  },
  noteDark: {
    backgroundColor: neutrals.N900,
    borderColor: neutrals.N700,
  },
  content: {
    flex: 1,
    gap: space.space1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: space.space2,
  },
});
