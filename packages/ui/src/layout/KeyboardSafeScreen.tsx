import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useModalKeyboardHeight } from "../components/useModalKeyboard";

export type KeyboardSafeScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: ScrollViewProps;
};

/**
 * Pantalla scrollable que mantiene el contenido siempre por encima del
 * teclado. Usa la misma técnica que Modal/BottomSheet (shared value de
 * react-native-keyboard-controller, negativa con teclado visible) para
 * empujar el contenido sin re-renders de JS. En web mide el visualViewport.
 */
export function KeyboardSafeScreen({
  children,
  style,
  contentContainerStyle,
  scrollViewProps,
}: KeyboardSafeScreenProps) {
  const keyboardHeight = useModalKeyboardHeight();

  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      paddingBottom: Math.max(0, -keyboardHeight.value),
    }),
    [],
  );

  return (
    <View style={[styles.screen, style]}>
      <Animated.View style={[styles.flex, containerAnimatedStyle]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, contentContainerStyle]}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
