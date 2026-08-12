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
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export type AutoHeightProps = {
  children: React.ReactNode;
  /** Duración de la animación en ms. */
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Envuelve contenido de altura variable y anima su altura cuando cambia
 * (p. ej. al pasar de un botón a un formulario), creciendo/encogiéndose de
 * forma suave para que los elementos de arriba/abajo no salten.
 */
export function AutoHeight({ children, duration = 240, style }: AutoHeightProps) {
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
        {children}
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
