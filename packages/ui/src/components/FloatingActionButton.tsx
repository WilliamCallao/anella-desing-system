import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { AppIcon } from "../AppIcons";
import { Icon } from "./Icon";
import { cta1, cta1Contrast } from "@antonella/theme";
import type { IconName } from "./Icon";

export type FloatingActionButtonPosition = "bottom-right" | "bottom-left";

export interface FloatingActionButtonProps {
  icon?: IconName;
  onPress: () => void;
  /** Esquina donde se ancla el FAB. Default `bottom-right`. */
  position?: FloatingActionButtonPosition;
  style?: StyleProp<ViewStyle>;
};

export function FloatingActionButton({
  icon = AppIcon.Ot,
  onPress,
  position = "bottom-right",
  style,
}: FloatingActionButtonProps) {
  return (
    <View
      style={[
        styles.wrap,
        position === "bottom-left" ? styles.wrapLeft : styles.wrapRight,
        style,
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onPress}
        android_ripple={{ color: "rgba(255,255,255,0.3)", borderless: true }}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        accessibilityRole="button"
      >
        <Icon name={icon} size={22} color={cta1Contrast} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: 24,
  },
  wrapRight: {
    right: 24,
  },
  wrapLeft: {
    left: 24,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: cta1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: cta1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
  },
});
