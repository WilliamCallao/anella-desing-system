import { useEffect, useMemo, useState } from "react";
import { PanResponder, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { space } from "@william-callao/antonella-theme";
import { useModalKeyboardHeight } from "./useModalKeyboard";

const DEFAULT_TIMINGS = {
  inMs: 240,
  outMs: 220,
  backdropOpacity: 0.45,
  /** Fracción de la pantalla que hay que arrastrar para cerrar. */
  dismissDragRatio: 0.35,
  /** Velocidad (px/ms) mínima del fling para cerrar. */
  dismissVelocity: 0.75,
};

export type SheetTimings = Partial<typeof DEFAULT_TIMINGS>;

export type UseSheetControllerOptions = {
  visible: boolean;
  onClose: () => void;
  dismissible: boolean;
  /** Animación de entrada/salida. */
  timings?: SheetTimings;
  /** Monta el overlay sin RN Modal (host modal nativo). */
  embedded?: boolean;
  /** Configura la altura máxima del panel. */
  snapPoints?: Array<string | number>;
  /** Habilita el drag-to-dismiss (BottomSheet / AppBottomSheet). */
  dragToDismiss?: boolean;
};

/**
 * Estado + animación compartidos de Modal / BottomSheet / AppBottomSheet:
 * montaje, progreso de Reanimated (UI thread), teclado, altura máxima y
 * drag-to-dismiss con snap-back. Un único lugar para arreglos de animación,
 * a11y y comportamiento web.
 */
export function useSheetController({
  visible,
  onClose,
  dismissible,
  timings,
  embedded = false,
  snapPoints,
  dragToDismiss = false,
}: UseSheetControllerOptions) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useModalKeyboardHeight();

  const merged = { ...DEFAULT_TIMINGS, ...timings };
  const { inMs, outMs, backdropOpacity, dismissDragRatio, dismissVelocity } = merged;

  const [mounted, setMounted] = useState(visible);
  const [contentReady, setContentReady] = useState(false);
  const progress = useSharedValue(0);
  // Desplazamiento extra del panel por arrastre (0 = posición abierta).
  const offsetY = useSharedValue(0);
  // Offset de scroll del contenido para no secuestrar el gesto cuando hay scroll.
  const scrollY = useSharedValue(0);

  const effectiveMounted = embedded ? true : mounted;

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

  // Al reabrir, el offset de arrastre (posible cierre por drag) vuelve a cero.
  useEffect(() => {
    if (visible) offsetY.value = 0;
  }, [visible, offsetY]);

  // Progreso de entrada/salida. Al cerrar desmonta recién cuando termina.
  useEffect(() => {
    if (!effectiveMounted) return;
    if (visible) {
      progress.value = withTiming(1, {
        duration: inMs,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = withTiming(
        0,
        { duration: outMs, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        },
      );
    }
  }, [effectiveMounted, visible, progress, inMs, outMs]);

  // Contenido diferido al 2º frame para que la entrada no compita con el
  // render JS del árbol del panel.
  useEffect(() => {
    if (effectiveMounted && visible) {
      const raf = requestAnimationFrame(() => setContentReady(true));
      return () => cancelAnimationFrame(raf);
    }
    if (!effectiveMounted) setContentReady(false);
  }, [effectiveMounted, visible]);

  const backdropStyle = useAnimatedStyle(
    () => ({ opacity: progress.value * backdropOpacity }),
    [],
  );

  const sheetPanelStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateY: (1 - progress.value) * screenHeight + offsetY.value },
      ],
    }),
    [screenHeight],
  );

  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      paddingBottom: Math.max(0, -keyboardHeight.value),
    }),
    [],
  );

  const heightStyle = useAnimatedStyle(
    () => {
      const kb = Math.max(0, -keyboardHeight.value);
      const available = screenHeight - kb - insets.top - insets.bottom;
      return {
        maxHeight: Math.max(space.space16, available * maxHeightRatio),
      };
    },
    [screenHeight, insets.top, insets.bottom, maxHeightRatio],
  );

  // Sigue el scroll del contenido para saber si está "pegado arriba".
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Drag-to-dismiss: solo reclama el gesto bajando con el contenido arriba.
  // Al soltar, hace snap de vuelta a abierto o cierra si pasó el umbral.
  const panResponder = useMemo(() => {
    if (!dragToDismiss || !dismissible) return undefined;

    const snapBack = () =>
      withTiming(0, { duration: inMs, easing: Easing.out(Easing.cubic) });

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dy > 0 &&
        Math.abs(gesture.dy) > Math.abs(gesture.dx) &&
        scrollY.value <= 0,
      onPanResponderMove: (_, gesture) => {
        offsetY.value = Math.max(0, gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        const shouldClose =
          gesture.dy > screenHeight * dismissDragRatio ||
          gesture.vy > dismissVelocity;
        if (shouldClose) {
          offsetY.value = withTiming(
            screenHeight,
            { duration: outMs, easing: Easing.in(Easing.cubic) },
            (finished) => {
              if (finished) runOnJS(onClose)();
            },
          );
        } else {
          offsetY.value = snapBack();
        }
      },
      onPanResponderTerminate: () => {
        offsetY.value = snapBack();
      },
    });
  }, [
    dragToDismiss,
    dismissible,
    scrollY,
    offsetY,
    screenHeight,
    inMs,
    outMs,
    dismissDragRatio,
    dismissVelocity,
    onClose,
  ]);

  return {
    mounted,
    effectiveMounted,
    contentReady,
    progress,
    offsetY,
    scrollY,
    maxHeightRatio,
    backdropStyle,
    sheetPanelStyle,
    containerAnimatedStyle,
    heightStyle,
    panResponder,
    scrollHandler,
  };
}

export type SheetController = ReturnType<typeof useSheetController>;