import React, { useEffect } from "react";
import { Modal as RNModal, Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";
import type { StyleProp, ViewStyle } from "react-native";

export type SheetBackdropStyle = AnimatedStyle<ViewStyle>;

export type SheetOverlayProps = {
  /** Montado real del árbol (libera tras la animación de salida). */
  mounted: boolean;
  /** Modo embedded: sin RN Modal (el host controla el montaje). */
  embedded: boolean;
  dismissible: boolean;
  onClose: () => void;
  backdropStyle: SheetBackdropStyle | StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  children: React.ReactNode;
};

/**
 * Overlay compartido de Modal / BottomSheet / CardStackSheet:
 * RN Modal nativo (transparente, hardwareAccelerated), backdrop presionable
 * y, en web, cierre con Escape + bloqueo del scroll del body.
 */
export function SheetOverlay({
  mounted,
  embedded,
  dismissible,
  onClose,
  backdropStyle,
  accessibilityLabel = "Cerrar",
  children,
}: SheetOverlayProps) {
  // En web se agregan Escape (si dismissible) y scroll-lock del body mientras
  // el diálogo está montado. El host embedded (expo-router) ya maneja ambos.
  useEffect(() => {
    if (embedded || !mounted) return;
    if (Platform.OS !== "web") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [embedded, mounted, dismissible, onClose]);

  const overlay = (
    <View style={styles.container} pointerEvents={embedded ? "box-none" : undefined}>
      {!embedded && (
        <Pressable
          onPress={dismissible ? onClose : undefined}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        >
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>
      )}
      {children}
    </View>
  );

  if (embedded) {
    return overlay;
  }
  return (
    <RNModal
      visible={mounted}
      transparent
      statusBarTranslucent
      animationType="none"
      hardwareAccelerated
      onRequestClose={dismissible ? onClose : undefined}
    >
      {overlay}
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
});