import React, { useEffect, useMemo, useState } from "react";
import {
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { space } from "@william-callao/antonella-theme";
import { useModalKeyboardHeight } from "./useModalKeyboard";

const ANIM_IN_TIMING = 260;
const ANIM_OUT_TIMING = 240;
const BACKDROP_COLOR = "#000000";
const BACKDROP_OPACITY = 0.45;
const EDGE_MARGIN = space.space3;

export type CardStackSheetProps = {
  visible: boolean;
  onClose: () => void;
  dismissible?: boolean;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  snapPoints?: Array<string | number>;
};

export function CardStackSheet({
  visible,
  onClose,
  dismissible = true,
  children,
  contentStyle,
  snapPoints,
}: CardStackSheetProps) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useModalKeyboardHeight();

  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  const maxHeightRatio = useMemo(() => {
    let ratio = 0.9;
    for (const value of snapPoints ?? []) {
      if (typeof value === "string" && value.endsWith("%")) {
        const n = Number(value.slice(0, -1));
        if (!Number.isNaN(n) && n / 100 > ratio) ratio = n / 100;
      }
    }
    return ratio;
  }, [snapPoints]);

  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  useEffect(() => {
    if (!mounted) return;
    if (visible) {
      progress.value = withTiming(1, {
        duration: ANIM_IN_TIMING,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = withTiming(
        0,
        {
          duration: ANIM_OUT_TIMING,
          easing: Easing.in(Easing.cubic),
        },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        },
      );
    }
  }, [mounted, visible, progress]);

  const backdropStyle = useAnimatedStyle(
    () => ({ opacity: progress.value * BACKDROP_OPACITY }),
    [],
  );

  const stackStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: (1 - progress.value) * screenHeight }],
    }),
    [screenHeight],
  );

  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      paddingBottom: Math.max(0, -keyboardHeight.value),
    }),
    [],
  );

  const stackHeightStyle = useAnimatedStyle(
    () => {
      const kb = Math.max(0, -keyboardHeight.value);
      const available = screenHeight - kb - insets.top - insets.bottom;
      return {
        maxHeight: Math.max(space.space16, available * maxHeightRatio),
      };
    },
    [screenHeight, insets.top, insets.bottom, maxHeightRatio],
  );

  return (
    <RNModal
      visible={mounted}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={dismissible ? onClose : undefined}
    >
      <View style={styles.container}>
        <Pressable
          onPress={dismissible ? onClose : undefined}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        >
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>
        <Animated.View
          style={[styles.wrapper, containerAnimatedStyle]}
          pointerEvents="box-none"
        >
          <Animated.View style={[styles.stack, stackHeightStyle, stackStyle]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[styles.content, contentStyle]}
            >
              {children}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BACKDROP_COLOR,
  },
  wrapper: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: EDGE_MARGIN,
    paddingBottom: EDGE_MARGIN,
  },
  stack: {
    width: "100%",
  },
  content: {
    gap: space.space3,
    paddingBottom: Math.max(space.space3, 24),
  },
});
