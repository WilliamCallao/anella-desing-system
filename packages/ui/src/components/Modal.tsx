import React, { useEffect, useState } from "react";
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
import { background, radius, space } from "@antonella/theme";
import { DialogHeader } from "./DialogHeader";
import type { IconName } from "./Icon";
import { useModalKeyboardHeight } from "./useModalKeyboard";

const ANIM_IN_TIMING = 220;
const ANIM_OUT_TIMING = 180;
const BACKDROP_COLOR = "#0F172A";
const BACKDROP_OPACITY = 0.4;
const PANEL_IN_SCALE = 0.92;

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  dismissible?: boolean;
  showCloseButton?: boolean;
  icon?: IconName;
  title?: string;
  caption?: string;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Modal({
  visible,
  onClose,
  dismissible = true,
  showCloseButton = false,
  icon,
  title,
  caption,
  children,
  contentStyle,
}: ModalProps) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useModalKeyboardHeight();

  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

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
      opacity: progress.value,
      transform: [{ scale: PANEL_IN_SCALE + (1 - PANEL_IN_SCALE) * progress.value }],
    }),
    [],
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
      return {
        maxHeight: Math.max(
          space.space16,
          screenHeight - kb - insets.top - insets.bottom - space.space8,
        ),
      };
    },
    [screenHeight, insets.top, insets.bottom],
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
          accessibilityLabel="Cerrar diálogo"
        >
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>
        <Animated.View style={[styles.centered, containerAnimatedStyle]} pointerEvents="box-none">
          <Animated.View style={[styles.panel, panelHeightStyle, panelStyle, contentStyle]}>
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
              contentContainerStyle={styles.scrollContent}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  panel: {
    width: 420,
    maxWidth: "100%",
    backgroundColor: background.default,
    borderRadius: radius.lg,
    padding: space.space4,
  },
  scrollContent: {
    paddingBottom: space.space3,
  },
});
