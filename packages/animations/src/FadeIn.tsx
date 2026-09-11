import type { ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useFadeIn } from "./useFadeIn";

export type FadeInProps = {
  children: ReactNode;
  /** Cambia para remontar y re-lanzar el fade (p. ej. el id de la selección actual). */
  contentKey?: string | number;
  /** Duración (ms) del fade. Default 280. */
  duration?: number;
  /** Opacidad inicial. Default 0. Usar 1 para desactivar el fade. */
  initialOpacity?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Wrapper de fade de entrada 0->1 (hook-driven, ver `useFadeIn`). Al cambiar
 * `contentKey` el contenido se remonta y la animación vuelve a correr.
 */
export function FadeIn({
  children,
  contentKey,
  duration = 280,
  initialOpacity = 0,
  style,
}: FadeInProps) {
  const fadeStyle = useFadeIn({ duration, initialOpacity });
  return (
    <Animated.View key={contentKey} style={[fadeStyle, style]}>
      {children}
    </Animated.View>
  );
}