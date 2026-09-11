import { useEffect } from "react";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export type UseFadeInOptions = {
  /** Duración (ms) del fade. Default 280. */
  duration?: number;
  /** Opacidad inicial. Default 0. Usar 1 para desactivar el fade. */
  initialOpacity?: number;
};

/**
 * Fade de entrada controlado por hook (opacity inicial -> 1 al montar), en el
 * UI thread. Se prefiere sobre las animaciones `entering` de Reanimated para
 * contenidos que viven en slots del layout que se montan/remontan (p. ej. el
 * AppLayout), donde `entering` se degrada o re-arranca en 0 y deja el texto
 * invisible por unos frames. Devuelve un `useAnimatedStyle` para aplicar a un
 * `Animated.View`.
 */
export function useFadeIn({ duration = 280, initialOpacity = 0 }: UseFadeInOptions = {}) {
  const opacity = useSharedValue(initialOpacity);
  useEffect(() => {
    opacity.value = withTiming(1, { duration });
  }, [opacity, duration]);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}