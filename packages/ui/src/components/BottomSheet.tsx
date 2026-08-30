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
import { background, radius, space } from "@william-callao/antonella-theme";
import { DialogHeader } from "./DialogHeader";
import type { IconName } from "./Icon";
import { useModalKeyboardHeight } from "./useModalKeyboard";

const ANIM_IN_TIMING = 260;
const ANIM_OUT_TIMING = 240;
const BACKDROP_COLOR = "#000000";
const BACKDROP_OPACITY = 0.45;

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  dismissible?: boolean;
  showCloseButton?: boolean;
  icon?: IconName;
  title?: string;
  caption?: string;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  snapPoints?: Array<string | number>;
};

export function BottomSheet({
  visible,
  onClose,
  dismissible = true,
  showCloseButton = false,
  icon,
  title,
  caption,
  children,
  contentStyle,
  snapPoints,
}: BottomSheetProps) {
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

  const panelStyle = useAnimatedStyle(
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

  const panelHeightStyle = useAnimatedStyle(
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
        <Animated.View style={[styles.panelWrapper, containerAnimatedStyle]} pointerEvents="box-none">
          <Animated.View style={[styles.panel, panelHeightStyle, panelStyle]}>
            <View style={styles.handleBar} />
            {title || icon || caption || showCloseButton ? (
              <DialogHeader
                icon={icon}
                title={title}
                caption={caption}
                onClose={onClose}
                showCloseButton={showCloseButton}
              />
            ) : null}
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
  panelWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  panel: {
    width: "100%",
    backgroundColor: background.default,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: space.space2,
    paddingHorizontal: space.space4,
  },
  handleBar: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: background.surface,
    marginBottom: space.space2,
  },
  content: {
    paddingTop: space.space2,
    paddingBottom: Math.max(space.space3, 24),
  },
});
