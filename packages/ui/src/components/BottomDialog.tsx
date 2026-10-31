import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  background,
  radius,
  space,
  TextType,
} from "@william-callao/antonella-theme";
import { Text } from "./text/Text";
import { SheetOverlay } from "./SheetOverlay";
import { useEmbeddedBackHandler } from "./useEmbeddedBackHandler";
import { useSheetController } from "./useSheetController";

const ANIM_IN_TIMING = 200;
const ANIM_OUT_TIMING = 160;
const BACKDROP_OPACITY = 0.4;
const ENTER_OFFSET = 24;

export type BottomDialogProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  /** Botones del pie. El diálogo los acomoda en una fila con separación. */
  actions?: React.ReactNode;
  dismissible?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Monta el diálogo sin RN Modal (host modal nativo tipo expo-router). */
  embedded?: boolean;
};

/**
 * Diálogo compacto anclado al pie de la pantalla. A diferencia de
 * `BottomSheet`, no toca los bordes: flota con margen, tiene esquinas
 * redondeadas y un título corto (`BodyBold`) en vez del header grande del
 * sheet. Pensado para confirmaciones breves.
 */
export function BottomDialog({
  visible,
  onClose,
  title,
  description,
  children,
  actions,
  dismissible = true,
  contentStyle,
  embedded = false,
}: BottomDialogProps) {
  const insets = useSafeAreaInsets();
  const controller = useSheetController({
    visible,
    onClose,
    dismissible,
    embedded,
    timings: {
      inMs: ANIM_IN_TIMING,
      outMs: ANIM_OUT_TIMING,
      backdropOpacity: BACKDROP_OPACITY,
    },
  });

  useEmbeddedBackHandler({ embedded, visible, dismissible, onClose });

  const panelStyle = useAnimatedStyle(
    () => ({
      opacity: controller.progress.value,
      transform: [
        { translateY: (1 - controller.progress.value) * ENTER_OFFSET },
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
        style={[styles.container, controller.containerAnimatedStyle]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.panel,
            { marginBottom: insets.bottom + space.space4 },
            controller.heightStyle,
            panelStyle,
            contentStyle,
          ]}
        >
          <View style={styles.header}>
            <Text variant={TextType.BodyBold} accessibilityRole="header">
              {title}
            </Text>
            {description ? (
              <Text variant={TextType.Caption}>{description}</Text>
            ) : null}
          </View>
          {children ? (
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          ) : null}
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </Animated.View>
      </Animated.View>
    </SheetOverlay>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: space.space4,
  },
  panel: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: background.default,
    borderRadius: radius.lg,
    padding: space.space4,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  header: {
    gap: space.space1,
  },
  body: {
    flexShrink: 1,
    marginTop: space.space3,
  },
  bodyContent: {
    gap: space.space2,
  },
  actions: {
    flexDirection: "row",
    gap: space.space2,
    marginTop: space.space4,
  },
});
