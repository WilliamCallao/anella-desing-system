import React, { useState } from "react";
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { resolveSemantic, lightSemantic } from "@antonella/theme";

const _semantic = resolveSemantic(lightSemantic);

export type ReverseHeaderCardLayoutProps = {
  headerBackgroundColor?: string;
  bodyBackgroundColor?: string;
  header: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const CARD_RADIUS = 32;

export function ReverseHeaderCardLayout({
  headerBackgroundColor = _semantic.default.bg.default,
  bodyBackgroundColor = _semantic.darkness.bg.default,
  header,
  children,
  style,
}: ReverseHeaderCardLayoutProps) {
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollY = useSharedValue(0);

  const onHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, headerHeight],
      [1, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, headerHeight],
      [0, -headerHeight],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  const bodyTopStyle = useAnimatedStyle(() => {
    const top = interpolate(
      scrollY.value,
      [0, headerHeight],
      [headerHeight, 0],
      Extrapolation.CLAMP
    );
    return { top };
  });

  return (
    <View style={[styles.root, { backgroundColor: headerBackgroundColor }, style]}>
      {/* Body card — background layer, slides up behind content */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.bodyCard,
          {
            backgroundColor: bodyBackgroundColor,
            borderTopLeftRadius: CARD_RADIUS,
            borderTopRightRadius: CARD_RADIUS,
          },
          bodyTopStyle,
        ]}
      />

      <Animated.ScrollView
        style={[styles.scroll, { zIndex: 10 }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight },
        ]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Animated.ScrollView>

      {/* Header — fades out and translates up as user scrolls */}
      <Animated.View
        onLayout={onHeaderLayout}
        style={[
          styles.header,
          {
            backgroundColor: headerBackgroundColor,
            paddingTop: insets.top,
          },
          headerStyle,
        ]}
      >
        {header}
      </Animated.View>
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
    zIndex: 5,
    overflow: "hidden",
  },
  bodyCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});
