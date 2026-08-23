import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";
import { cta1, space, spacing, text, TextType } from "@antonella/theme";
import { Text } from "../text/Text";
import type { AppInputProps } from "./AppInput";

const TRACK_W = 51;
const TRACK_H = 31;
const THUMB_SIZE = 27;
const THUMB_MARGIN = 2;
const ANIM_DURATION = 250;

export type AppToggleProps = AppInputProps & {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function AppToggle({
  label,
  labelWidth,
  value,
  onValueChange,
  disabled = false,
}: AppToggleProps) {
  const thumbX = useRef(new Animated.Value(value ? 1 : 0)).current;
  const trackColor = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(thumbX, {
        toValue: value ? 1 : 0,
        duration: ANIM_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(trackColor, {
        toValue: value ? 1 : 0,
        duration: ANIM_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, thumbX, trackColor]);

  const translateX = thumbX.interpolate({
    inputRange: [0, 1],
    outputRange: [THUMB_MARGIN, TRACK_W - THUMB_SIZE - THUMB_MARGIN],
  });

  const backgroundColor = trackColor.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E5E5EA", cta1],
  });

  const toggle = () => {
    if (!disabled) onValueChange(!value);
  };

  return (
    <TouchableOpacity
      style={[styles.row, disabled && styles.rowDisabled]}
      onPress={toggle}
      activeOpacity={0.7}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <Text
        variant={TextType.Label}
        numberOfLines={1}
        style={[styles.label, labelWidth != null && { width: labelWidth }]}
      >
        {label}
      </Text>
      <View style={styles.switchContainer}>
        <Animated.View style={[styles.track, { backgroundColor }]}>
          <Animated.View
            style={[
              styles.thumb,
              { transform: [{ translateX }] },
            ]}
          />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: space.space4,
    paddingVertical: space.space4,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  label: {
    flexShrink: 0,
  },
  switchContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    justifyContent: "center",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
