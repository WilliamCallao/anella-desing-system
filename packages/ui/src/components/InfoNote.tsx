import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { brand, radius, space, text, TextType } from "@william-callao/antonella-theme";
import { Icon, type IconName } from "./Icon";
import { Text } from "./text/Text";

export type InfoNoteProps = {
  title?: string;
  message: string;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

/**
 * Nota informativa compacta para formularios y selectores: fondo suave de marca,
 * borde tenue e icono de información. Sirve para explicar un flujo sin competir
 * con el contenido del formulario.
 */
export function InfoNote({
  title,
  message,
  icon = "information-circle",
  style,
}: InfoNoteProps) {
  return (
    <View style={[styles.container, style]}>
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
  );
}

const styles = StyleSheet.create({
  container: {
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
});
