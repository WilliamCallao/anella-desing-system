import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { resolveSemantic, lightSemantic } from "@antonella/theme";

const _semantic = resolveSemantic(lightSemantic);

export type HeaderCardLayoutProps = {
  headerBackgroundColor?: string;
  bodyBackgroundColor?: string;
  header: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const CARD_RADIUS = 32;
const SHADOW_HEIGHT = 20;

export function HeaderCardLayout({
  headerBackgroundColor = _semantic.default.bg.default,
  bodyBackgroundColor = _semantic.darkness.bg.default,
  header,
  children,
  style,
}: HeaderCardLayoutProps) {
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);

  const onHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  };

  return (
    <View style={[styles.root, { backgroundColor: bodyBackgroundColor }, style]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + SHADOW_HEIGHT },
        ]}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {/* Solid body-color rect behind header — fills gaps from rounded corners */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          backgroundColor: bodyBackgroundColor,
          zIndex: 9,
        }}
      />

      <View
        onLayout={onHeaderLayout}
        style={[
          styles.header,
          {
            backgroundColor: headerBackgroundColor,
            paddingTop: insets.top,
            borderBottomLeftRadius: CARD_RADIUS,
            borderBottomRightRadius: CARD_RADIUS,
          },
        ]}
      >
        {header}
      </View>

      {/* Gradient in body area, with matching top border radius */}
      <LinearGradient
        pointerEvents="none"
        colors={[bodyBackgroundColor, "transparent"]}
        style={{
          position: "absolute",
          top: headerHeight - 3,
          left: 0,
          right: 0,
          height: SHADOW_HEIGHT,
          zIndex: 9,
          borderTopLeftRadius: CARD_RADIUS,
          borderTopRightRadius: CARD_RADIUS,
        }}
      />
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
    paddingBottom: 40,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
  },
});
