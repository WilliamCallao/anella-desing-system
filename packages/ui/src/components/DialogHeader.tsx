import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TextType, space, text } from "@william-callao/antonella-theme";
import { Icon, type IconName } from "./Icon";
import { Text } from "./text/Text";

export type DialogHeaderProps = {
  icon?: IconName;
  title?: string;
  caption?: string;
  headerAccessory?: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
};

export function DialogHeader({
  icon,
  title,
  caption,
  headerAccessory,
  onClose,
  showCloseButton,
}: DialogHeaderProps) {
  return (
    <View style={styles.header}>
      {icon ? <Icon name={icon} size={28} color={text.default} /> : null}
      {title || caption ? (
        <View style={styles.titles}>
          {title ? (
            <Text variant={TextType.Subtitle} accessibilityRole="header">
              {title}
            </Text>
          ) : null}
          {caption ? <Text variant={TextType.Caption}>{caption}</Text> : null}
        </View>
      ) : null}
      {headerAccessory ? (
        <View
          style={[
            styles.accessory,
            showCloseButton ? styles.accessoryWithClose : undefined,
          ]}
          pointerEvents="box-none"
        >
          {headerAccessory}
        </View>
      ) : null}
      {showCloseButton ? (
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          hitSlop={8}
        >
          <Icon name="close" size={22} color={text.default} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "relative",
    paddingBottom: space.space1,
    marginBottom: space.space2,
    gap: space.space2,
  },
  accessory: {
    position: "absolute",
    top: 0,
    right: 0,
    alignItems: "flex-end",
    zIndex: 1,
  },
  accessoryWithClose: {
    right: space.space8,
  },
  titles: {
    gap: space.space1,
    paddingRight: space.space8,
  },
  closeButton: {
    position: "absolute",
    top: -space.space1,
    right: -space.space2,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
