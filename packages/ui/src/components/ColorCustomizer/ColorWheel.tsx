import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { cta1 } from "@william-callao/antonella-theme";

type ColorWheelProps = {
  onPress: () => void;
  size?: number;
};

export function ColorWheel({ onPress, size = 28 }: ColorWheelProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wheel,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Personalizar colores"
    >
      <View style={styles.inner}>
        <View style={[styles.segment, styles.segmentRed]} />
        <View style={[styles.segment, styles.segmentGreen]} />
        <View style={[styles.segment, styles.segmentBlue]} />
        <View style={[styles.segment, styles.segmentYellow]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wheel: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
  inner: {
    width: "70%",
    height: "70%",
    borderRadius: 999,
    overflow: "hidden",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  segment: {
    width: "50%",
    height: "50%",
  },
  segmentRed: {
    backgroundColor: "#FF3B30",
  },
  segmentGreen: {
    backgroundColor: "#34C759",
  },
  segmentBlue: {
    backgroundColor: "#007AFF",
  },
  segmentYellow: {
    backgroundColor: "#FF9500",
  },
});
