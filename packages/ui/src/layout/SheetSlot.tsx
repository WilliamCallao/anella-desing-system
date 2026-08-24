import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { resolveSemantic, lightSemantic } from "@antonella/theme";
import type { HostKey } from "./composition";
import type { Route as RouteType } from "./types";

const _semantic = resolveSemantic(lightSemantic);

const DEFAULT_HEADER_BG = _semantic.default.bg.default;
const DEFAULT_BODY_BG = _semantic.darkness.bg.default;
const SHADOW_HEIGHT = 20;
const CARD_RADIUS = 32;

export type SheetSlotProps = {
  side: HostKey;
  /** 0 = oculto (fuera de pantalla), 1 = totalmente visible. */
  visible: SharedValue<number>;
  /** Contenido a mostrar. null = este host no se usa nunca. */
  route: RouteType | null;
  /** Si la capa debe capturar toques (solo la activa). */
  interactive: boolean;
  baseColor: "header" | "body";
};

export function SheetSlot({
  side,
  visible,
  route,
  interactive,
  baseColor,
}: SheetSlotProps) {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();

  const isBase = side === "base";
  const isTop = side === "top";
  const isBottom = side === "bottom";
  const collapse =
    isBottom && (route?.options?.collapseOnScroll ?? true);
  const radius = route?.options?.radius ?? CARD_RADIUS;
  const fixedH = route?.options?.fixedHeaderHeight;

  const headerBg = route?.headerBackgroundColor ?? DEFAULT_HEADER_BG;
  const bodyBg = route?.bodyBackgroundColor ?? DEFAULT_BODY_BG;

  const [measuredH, setMeasuredH] = useState(fixedH ?? 0);
  const headerHAnim = useSharedValue(fixedH ?? 0);
  const scrollY = useSharedValue(0);
  const contentFade = useSharedValue(1);

  const onHeaderLayout = (e: LayoutChangeEvent) => {
    if (fixedH != null) return;
    const h = e.nativeEvent.layout.height;
    setMeasuredH(h);
    headerHAnim.value = withTiming(h, { duration: 280 });
  };

  // Al cambiar de ruta (mismo host): cross-fade de contenido + el alto del
  // header se re-animará solo vía onHeaderLayout.
  useEffect(() => {
    scrollY.value = withTiming(0, { duration: 250 });
    contentFade.value = 0;
    contentFade.value = withTiming(1, { duration: 240 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.key]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // --- Entrada/salida de la capa completa según su host ---
  const slotAnim = useAnimatedStyle(() => {
    if (isBase) return { opacity: visible.value };
    const sign = side === "top" ? -1 : side === "bottom" ? 1 : 0;
    return {
      transform: [{ translateY: (1 - visible.value) * sign * screenH }],
    };
  }, [isBase, side, screenH]);

  // --- Colapso del header (bottom sheet al hacer scroll) ---
  const headerAnim = useAnimatedStyle(() => {
    if (!collapse) return {};
    const opacity = interpolate(
      scrollY.value,
      [0, measuredH],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, measuredH],
      [0, -measuredH],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  }, [collapse, measuredH]);

  const cardTop = useAnimatedStyle(() => {
    if (!isBottom) return {};
    const top = interpolate(
      scrollY.value,
      [0, measuredH],
      [measuredH, 0],
      Extrapolation.CLAMP,
    );
    return { top };
  }, [isBottom, measuredH]);

  const scrollPadTop = useAnimatedStyle(() => ({
    paddingTop: headerHAnim.value + (isBottom ? 0 : 8),
  }));

  const contentFadeStyle = useAnimatedStyle(
    () => ({ opacity: contentFade.value }),
    [],
  );

  if (!route) return null;

  const headerStyle = [
    styles.header,
    {
      backgroundColor: isBase || isTop ? headerBg : headerBg,
      paddingTop: insets.top,
      zIndex: isBottom ? 5 : 10,
    },
    isTop && {
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
    },
    headerAnim,
  ];

  return (
    <Animated.View
      style={[
        styles.slot,
        { zIndex: isBase ? 1 : isTop ? 3 : 2 },
        !interactive && styles.noPointer,
        slotAnim,
      ]}
    >
      {/* Card de body que sube (bottom sheet) */}
      {isBottom ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bodyCard,
            {
              backgroundColor: bodyBg,
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
            },
            cardTop,
          ]}
        />
      ) : null}

      {/* Scroll del body */}
      <Animated.ScrollView
        style={[styles.scroll, { zIndex: isBottom ? 10 : 1 }]}
        contentContainerStyle={styles.scrollContent}
        onScroll={collapse ? onScroll : undefined}
        scrollEventThrottle={16}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.contentPad, scrollPadTop]}>
          <Animated.View style={contentFadeStyle}>{route.body}</Animated.View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Respaldo sólido detrás del header (top sheet) para esquinas */}
      {isTop ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: measuredH,
            backgroundColor: baseColor === "body" ? bodyBg : headerBg,
            zIndex: 9,
          }}
        />
      ) : null}

      {/* Header */}
      <Animated.View onLayout={onHeaderLayout} style={headerStyle}>
        <Animated.View style={contentFadeStyle}>{route.header}</Animated.View>
      </Animated.View>

      {/* Sombra bajo el header (top sheet) */}
      {isTop ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: measuredH - 3,
            left: 0,
            right: 0,
            height: SHADOW_HEIGHT,
            backgroundColor: "rgba(0,0,0,0.06)",
            zIndex: 9,
          }}
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  noPointer: {
    pointerEvents: "none",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentPad: {
    paddingBottom: 40,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  bodyCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
