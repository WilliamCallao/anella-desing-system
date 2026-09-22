import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { background, radius, space } from "@william-callao/antonella-theme";
import { DialogHeader } from "./DialogHeader";
import type { IconName } from "./Icon";
import { SheetOverlay } from "./SheetOverlay";
import { useSheetController } from "./useSheetController";

const ANIM_IN_TIMING = 220;
const ANIM_OUT_TIMING = 180;
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
  /** Zona de acciones fija al pie del modal. */
  actions?: React.ReactNode;
  /**
   * Renderiza el modal SIN envolverlo en un RN Modal, para poder montarlo dentro
   * de un host modal nativo (p.ej. un screen `transparentModal` de expo-router),
   * donde anidar otro Modal rompería el edge-to-edge.
   */
  embedded?: boolean;
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
  actions,
  embedded = false,
}: ModalProps) {
  const controller = useSheetController({
    visible,
    onClose,
    dismissible,
    embedded,
    timings: { inMs: ANIM_IN_TIMING, outMs: ANIM_OUT_TIMING, backdropOpacity: BACKDROP_OPACITY },
  });

  const panelStyle = useAnimatedStyle(
    () => ({
      opacity: controller.progress.value,
      transform: [
        { scale: PANEL_IN_SCALE + (1 - PANEL_IN_SCALE) * controller.progress.value },
      ],
    }),
    [],
  );

  return (
    <SheetOverlay
      mounted={controller.effectiveMounted}
      embedded={embedded}
      dismissible={dismissible}
      onClose={onClose}
      backdropStyle={controller.backdropStyle}
      accessibilityLabel="Cerrar diálogo"
    >
      <Animated.View
        style={[styles.centered, controller.containerAnimatedStyle]}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.panel, controller.heightStyle, panelStyle, contentStyle]}>
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
            contentContainerStyle={[
              styles.scrollContent,
              actions ? styles.scrollContentCompact : undefined,
            ]}
          >
            {controller.contentReady ? children : <View style={styles.deferredPlaceholder} />}
          </ScrollView>
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </Animated.View>
      </Animated.View>
    </SheetOverlay>
  );
}

const styles = StyleSheet.create({
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
  scrollContentCompact: {
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