import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { AppIcon } from "../AppIcons";
import { Icon } from "./Icon";
import { palette } from "@antonella/theme";
import type { IconName } from "./Icon";

export interface FloatingActionButtonProps {
  icon?: IconName;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function FloatingActionButton({
  icon = AppIcon.Ot,
  onPress,
  style,
}: FloatingActionButtonProps) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        android_ripple={{ color: "rgba(255,255,255,0.3)", borderless: true }}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        accessibilityRole="button"
      >
        <Icon name={icon} size={22} color={palette.background} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
  },
});
