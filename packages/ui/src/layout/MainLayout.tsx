import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { resolveSemantic, lightSemantic } from "@antonella/theme";

const _semantic = resolveSemantic(lightSemantic);
const DEFAULT_BG = _semantic.darkness.bg.default;

export type MainLayoutProps = {
  children?: React.ReactNode;
  backgroundColor?: string;
  /** Si el body debe poder scrollear. Default true. */
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

/**
 * Pantalla simple y normal: ocupa toda la altura, respeta el safe area y
 * muestra un body (scrolleable por defecto). Punto de partida mínimo para
 * ir construyendo encima según se necesite.
 */
export function MainLayout({
  children,
  backgroundColor = DEFAULT_BG,
  scroll = true,
  contentContainerStyle,
  style,
}: MainLayoutProps) {
  return (
    <View
      style={[
        styles.root,
        { backgroundColor },
        style,
      ]}
    >
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.scrollContent, contentContainerStyle]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
});
