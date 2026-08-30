import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { background, radius } from "@william-callao/antonella-theme";

export type SkeletonShape = "rect" | "circle";

export interface SkeletonProps {
  /** Ancho del bloque: número (px) o string (ej. "100%", "60%"). */
  width?: number | string;
  /** Alto del bloque en px. Para `shape="circle"` debe ser numérico. */
  height?: number | string;
  /** Radio de esquinas (solo para `shape="rect"`). Default `radius.sm`. */
  borderRadius?: number;
  /** `rect` por defecto; `circle` dibuja un círculo perfecto. */
  shape?: SkeletonShape;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = "100%",
  height = 56,
  borderRadius = radius.sm,
  shape = "rect",
  style,
}: SkeletonProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (mounted) setReduceMotion(reduced);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0.6;
      return;
    }
    opacity.value = withRepeat(
      withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const isCircle = shape === "circle" && typeof height === "number";

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height: height as any },
        isCircle ? { borderRadius: height / 2 } : { borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: background.skeleton,
  },
});
