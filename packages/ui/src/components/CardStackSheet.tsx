import React from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";
import { space } from "@william-callao/antonella-theme";
import { SheetOverlay } from "./SheetOverlay";
import { useSheetController } from "./useSheetController";

const ANIM_IN_TIMING = 260;
const ANIM_OUT_TIMING = 240;
const BACKDROP_OPACITY = 0.45;
const EDGE_MARGIN = space.space3;

export type CardStackSheetProps = {
  visible: boolean;
  onClose: () => void;
  dismissible?: boolean;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  snapPoints?: Array<string | number>;
  /** Color del área semitransparente del sheet (fondo entre y bajo las cards). */
  areaColor?: string;
  /**
   * Renderiza el sheet SIN envolverlo en un RN Modal, para poder montarlo dentro
   * de un host modal nativo (p.ej. un screen `transparentModal` de expo-router),
   * donde anidar otro Modal rompería el edge-to-edge.
   */
  embedded?: boolean;
};

export function CardStackSheet({
  visible,
  onClose,
  dismissible = true,
  children,
  contentStyle,
  snapPoints,
  areaColor,
  embedded = false,
}: CardStackSheetProps) {
  const controller = useSheetController({
    visible,
    onClose,
    dismissible,
    embedded,
    snapPoints,
    dragToDismiss: true,
    timings: { inMs: ANIM_IN_TIMING, outMs: ANIM_OUT_TIMING, backdropOpacity: BACKDROP_OPACITY },
  });

  return (
    <SheetOverlay
      mounted={controller.effectiveMounted}
      embedded={embedded}
      dismissible={dismissible}
      onClose={onClose}
      backdropStyle={controller.backdropStyle}
    >
      <Animated.View
        style={[styles.wrapper, controller.containerAnimatedStyle]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[styles.stack, controller.heightStyle, controller.sheetPanelStyle]}
          {...(controller.panResponder?.panHandlers ?? {})}
        >
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            onScroll={controller.scrollHandler}
            contentContainerStyle={[
              styles.content,
              contentStyle,
              areaColor ? { backgroundColor: areaColor } : undefined,
            ]}
          >
            {controller.contentReady ? children : <View style={styles.deferredPlaceholder} />}
          </Animated.ScrollView>
        </Animated.View>
      </Animated.View>
    </SheetOverlay>
  );
}

const styles = StyleSheet.create({
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
  deferredPlaceholder: {
    minHeight: space.space16,
  },
});