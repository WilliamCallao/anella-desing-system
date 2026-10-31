import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { brand, radius, space, text, TextType } from "@william-callao/antonella-theme";
import { Icon, type IconName } from "./Icon";
import { Label } from "./Label";
import { Text } from "./text/Text";

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
  style,
}: InfoNoteProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.note}>
        <Icon name={icon} size={20} color={brand.M600} />
        <View style={styles.content}>
          {title ? (
            <Text variant={TextType.BodyMedium}>{title}</Text>
          ) : null}
          <Text variant={TextType.Caption} color={text.default}>
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
