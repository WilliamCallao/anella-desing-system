import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  type SharedValue,
} from "react-native-reanimated";
import { resolveSemantic, lightSemantic } from "@antonella/theme";
import { SheetSlot } from "./SheetSlot";
import { resolveComposition, type HostKey } from "./composition";
import type { Route, SheetLayoutProps } from "./types";

const _semantic = resolveSemantic(lightSemantic);
const HEADER_BG = _semantic.default.bg.default;
const BODY_BG = _semantic.darkness.bg.default;

const DURATION = 340;

type SheetLayoutContextValue = { change: (key: string) => void };
const SheetLayoutContext = createContext<SheetLayoutContextValue>({
  change: () => {},
});

/** Permite que el contenido de una capa pida cambiar de ruta sin navigator. */
export function useSheetLayout(): SheetLayoutContextValue {
  return useContext(SheetLayoutContext);
}

function resolveBaseColor(key: "header" | "body"): string {
  return key === "header" ? HEADER_BG : BODY_BG;
}

export function SheetLayout({
  routes,
  activeKey,
  onRequestChange,
  style,
}: SheetLayoutProps) {
  const routeMap = useMemo(() => {
    const m: Record<string, Route> = {};
    for (const r of routes) m[r.key] = r;
    return m;
  }, [routes]);

  const activeRoute = routeMap[activeKey];
  const comp = activeRoute
    ? resolveComposition(activeRoute.kind)
    : { host: "base" as HostKey, baseColor: "header" as const };

  const [slots, setSlots] = useState<Record<HostKey, Route | null>>(() => {
    const init: Record<HostKey, Route | null> = {
      base: null,
      top: null,
      bottom: null,
    };
    if (activeRoute) init[comp.host] = activeRoute;
    return init;
  });

  const visBase = useSharedValue(0);
  const visTop = useSharedValue(0);
  const visBottom = useSharedValue(0);
  const visBySide: Record<HostKey, SharedValue<number>> = {
    base: visBase,
    top: visTop,
    bottom: visBottom,
  };

  const baseFrom = useSharedValue(HEADER_BG);
  const baseTo = useSharedValue(HEADER_BG);
  const baseProg = useSharedValue(1);

  const prevKey = useRef(activeKey);

  // Montaje: visibilidad inicial + color de fondo inicial.
  useEffect(() => {
    if (activeRoute) {
      visBySide[comp.host].value = withTiming(1, { duration: DURATION });
    }
    const c = resolveBaseColor(comp.baseColor);
    baseFrom.value = c;
    baseTo.value = c;
    baseProg.value = 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeKey === prevKey.current) return;
    const toRoute = activeRoute;
    if (!toRoute) return;
    const newComp = resolveComposition(toRoute.kind);
    const newColor = resolveBaseColor(newComp.baseColor);

    console.log("[SheetLayout] transition", {
      from: prevKey.current,
      to: activeKey,
      host: newComp.host,
      baseColor: newComp.baseColor,
    });

    setSlots((prev) => ({ ...prev, [newComp.host]: toRoute }));

    (Object.keys(visBySide) as HostKey[]).forEach((h) => {
      visBySide[h].value = withTiming(
        h === newComp.host ? 1 : 0,
        { duration: DURATION },
      );
    });

    if (newColor !== baseTo.value) {
      baseFrom.value = baseTo.value;
      baseTo.value = newColor;
      baseProg.value = 0;
      baseProg.value = withTiming(1, { duration: DURATION });
    }

    prevKey.current = activeKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, activeRoute]);

  const change = (key: string) => onRequestChange?.(key);

  const backdropStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(
        baseProg.value,
        [0, 1],
        [baseFrom.value, baseTo.value],
      ),
    }),
    [],
  );

  return (
    <SheetLayoutContext.Provider value={{ change }}>
      <View style={[styles.root, style]}>
        <Animated.View
          style={[styles.backdrop, backdropStyle]}
          pointerEvents="none"
        />
        <SheetSlot
          side="base"
          visible={visBase}
          route={slots.base}
          interactive={comp.host === "base"}
          baseColor={comp.baseColor}
        />
        <SheetSlot
          side="bottom"
          visible={visBottom}
          route={slots.bottom}
          interactive={comp.host === "bottom"}
          baseColor={comp.baseColor}
        />
        <SheetSlot
          side="top"
          visible={visTop}
          route={slots.top}
          interactive={comp.host === "top"}
          baseColor={comp.baseColor}
        />
      </View>
    </SheetLayoutContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
});
