import React from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";
import { background, radius, space } from "@william-callao/antonella-theme";
import { DialogHeader } from "./DialogHeader";
import type { IconName } from "./Icon";
import { SheetOverlay } from "./SheetOverlay";
import { useSheetController } from "./useSheetController";

const ANIM_IN_TIMING = 260;
const ANIM_OUT_TIMING = 240;
const BACKDROP_OPACITY = 0.45;

export type SheetProps = {
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
  /** Zona de acciones fija al pie del sheet. */
  actions?: React.ReactNode;
  /**
   * Renderiza el sheet SIN envolverlo en un RN Modal, para poder montarlo dentro
   * de un host modal nativo (p.ej. un screen `transparentModal` de expo-router),
   * donde anidar otro Modal rompería el edge-to-edge.
   */
  embedded?: boolean;
};

export function Sheet({
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
  actions,
  embedded = false,
}: SheetProps) {
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
        style={[styles.panelWrapper, controller.containerAnimatedStyle]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[styles.panel, controller.heightStyle, controller.sheetPanelStyle]}
          {...(controller.panResponder?.panHandlers ?? {})}
        >
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
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            onScroll={controller.scrollHandler}
            contentContainerStyle={[styles.content, actions && styles.contentCompact, contentStyle]}
          >
            {controller.contentReady ? children : <View style={styles.deferredPlaceholder} />}
          </Animated.ScrollView>
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </Animated.View>
      </Animated.View>
    </SheetOverlay>
  );
}

const styles = StyleSheet.create({
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
  contentCompact: {
    paddingBottom: 0,
  },
  actions: {
    paddingTop: space.space6,
    paddingBottom: space.space10,
  },
  deferredPlaceholder: {
    minHeight: space.space16,
  },
});