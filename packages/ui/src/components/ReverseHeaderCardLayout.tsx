import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Reanimated, {
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
const ANIM_DURATION = 250;

export function ReverseHeaderCardLayout({
  headerBackgroundColor = _semantic.default.bg.default,
  bodyBackgroundColor = _semantic.darkness.bg.default,
  header,
  children,
  style,
}: ReverseHeaderCardLayoutProps) {
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);
  const animatedTop = useRef(new Animated.Value(0)).current;
  const scrollY = useSharedValue(0);

  const onHeaderLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const newHeight = e.nativeEvent.layout.height;
      if (newHeight === headerHeight) return;
      Animated.timing(animatedTop, {
        toValue: newHeight,
        duration: ANIM_DURATION,
        useNativeDriver: false,
      }).start(() => {
        setHeaderHeight(newHeight);
      });
    },
    [headerHeight, animatedTop],
  );

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

  const bodyScrollStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, headerHeight],
      [0, -headerHeight],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  return (
    <View style={[styles.root, { backgroundColor: headerBackgroundColor }, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.bodyCard,
          {
            top: animatedTop,
            backgroundColor: bodyBackgroundColor,
            borderTopLeftRadius: CARD_RADIUS,
            borderTopRightRadius: CARD_RADIUS,
          },
        ]}
      >
        <Reanimated.View style={[StyleSheet.absoluteFill, bodyScrollStyle]} />
      </Animated.View>

      <Reanimated.ScrollView
        style={[styles.scroll, { zIndex: 5 }]}
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
      </Reanimated.ScrollView>

      <View
        onLayout={onHeaderLayout}
        style={[
          styles.header,
          {
            backgroundColor: headerBackgroundColor,
            paddingTop: insets.top,
          },
        ]}
      >
        <Reanimated.View style={headerStyle}>
          {header}
        </Reanimated.View>
      </View>
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
  bodyCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    overflow: "hidden",
  },
});
