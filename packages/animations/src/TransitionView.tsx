import React, { useCallback } from "react";
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export type TransitionViewProps = {
  children: React.ReactNode;
  /**
   * Cambia cuando el contenido cambia estructuralmente (p. ej. `contentKey={step}`).
   * Al cambiar, el contenido se remonta y entra con fade in desde opacity 0 (sin parpadeos).
   */
  contentKey?: string | number;
  /** Duración (ms) de la animación de altura. */
  duration?: number;
  /** Duración (ms) del fade in del contenido nuevo. */
  fadeDuration?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Envuelve contenido de altura variable: al cambiar, anima la altura del
 * contenedor (crece/encoge sin que lo de arriba/abajo salte) y hace fade in
 * del contenido nuevo. La altura se mide con onLayout y se anima en el UI
 * thread; el fade in lo maneja Reanimated (entering) desde el primer frame,
 * por lo que no hay parpadeos.
 */
export function TransitionView({
  children,
  contentKey,
  duration = 200,
  fadeDuration = 200,
  style,
}: TransitionViewProps) {
  const animatedHeight = useSharedValue(0);

  const onContentLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      if (height === animatedHeight.value) return;
      animatedHeight.value = withTiming(height, {
        duration,
        easing: Easing.out(Easing.quad),
      });
    },
    [animatedHeight, duration],
  );

  const containerStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle, style]}>
      <View style={styles.content} onLayout={onContentLayout}>
        <Animated.View key={contentKey} entering={FadeIn.duration(fadeDuration)}>
          {children}
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  content: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
