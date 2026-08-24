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
import type { LayerDirection } from "./transitions";
import type { LayerRole, Route } from "./types";

const _semantic = resolveSemantic(lightSemantic);

const DEFAULT_HEADER_BG = _semantic.default.bg.default;
const DEFAULT_BODY_BG = _semantic.darkness.bg.default;
const SHADOW_HEIGHT = 20;

export type SheetLayerProps = {
  route: Route;
  role: LayerRole;
  layerProgress: SharedValue<number>;
  layerDirection: LayerDirection;
  pointerEvents?: "auto" | "none";
};

export function SheetLayer({
  route,
  role,
  layerProgress,
  layerDirection,
  pointerEvents = "auto",
}: SheetLayerProps) {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();

  const isBottom =
    route.kind === "bottomSheet" &&
    (route.options?.collapseOnScroll ?? true);
  const isTop = route.kind === "topSheet";
  const radius = route.options?.radius ?? 32;
  const fixedH = route.options?.fixedHeaderHeight;

  const headerBg =
    route.headerBackgroundColor ?? DEFAULT_HEADER_BG;
  const bodyBg = route.bodyBackgroundColor ?? DEFAULT_BODY_BG;
  const rootBg =
    route.kind === "topSheet" || route.kind === "bottomSheet"
      ? route.kind === "topSheet"
        ? bodyBg
        : headerBg
      : route.kind === "fullHeader"
        ? headerBg
        : bodyBg;

  const [measuredH, setMeasuredH] = useState(fixedH ?? 0);
  const headerHAnim = useSharedValue(fixedH ?? 0);
  const scrollY = useSharedValue(0);
  const contentFade = useSharedValue(1);

  console.log("[SheetLayer] render", {
    key: route.key,
    kind: route.kind,
    role,
    direction: layerDirection,
    screenH,
  });

  const onHeaderLayout = (e: LayoutChangeEvent) => {
    if (fixedH != null) return;
    const h = e.nativeEvent.layout.height;
    setMeasuredH(h);
    headerHAnim.value = withTiming(h, { duration: 280 });
  };

  // Al cambiar de ruta (mismo kind): resetea scroll y hace cross-fade de contenido.
  // El alto del header se re-animará solo vía onHeaderLayout.
  useEffect(() => {
    scrollY.value = withTiming(0, { duration: 250 });
    contentFade.value = 0;
    contentFade.value = withTiming(1, { duration: 240 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.key]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // --- Animación de la capa completa (transición entre kinds distintos) ---
  const layerAnim = useAnimatedStyle(() => {
    if (layerDirection === "stay") return {};
    if (layerDirection === "fade") return { opacity: layerProgress.value };
    const sign =
      layerDirection === "fromTop" || layerDirection === "toTop"
        ? -1
        : layerDirection === "fromBottom" || layerDirection === "toBottom"
          ? 1
          : 0;
    return {
      transform: [
        { translateY: (1 - layerProgress.value) * sign * screenH },
      ],
    };
  }, [layerDirection, screenH]);

  // --- Animación del header (colapso en bottomSheet) ---
  const headerAnim = useAnimatedStyle(() => {
    if (!isBottom) return {};
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
  }, [isBottom, measuredH]);

  // --- Card de body que sube (bottomSheet) ---
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

  const contentFadeStyle = useAnimatedStyle(
    () => ({ opacity: contentFade.value }),
    [],
  );

  const scrollPadTop = useAnimatedStyle(() => ({
    paddingTop: headerHAnim.value + (isBottom ? 0 : 8),
  }));

  const headerStyle = [
    styles.header,
    {
      backgroundColor:
        isTop || isBottom ? headerBg : "transparent",
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
        styles.layer,
        { backgroundColor: rootBg },
        layerAnim,
        pointerEvents === "none" && styles.noPointer,
      ]}
    >
      {/* Card de body (bottomSheet) */}
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
        onScroll={isBottom ? onScroll : undefined}
        scrollEventThrottle={16}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.contentPad, scrollPadTop]}>
          <Animated.View style={contentFadeStyle}>{route.body}</Animated.View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Respaldo sólido detrás del header (topSheet) para rellenar esquinas */}
      {isTop ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: measuredH,
            backgroundColor: bodyBg,
            zIndex: 9,
          }}
        />
      ) : null}

      {/* Header */}
      <Animated.View onLayout={onHeaderLayout} style={headerStyle}>
        <Animated.View style={contentFadeStyle}>{route.header}</Animated.View>
      </Animated.View>

      {/* Sombra sutil bajo el header (topSheet) */}
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
  layer: {
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
