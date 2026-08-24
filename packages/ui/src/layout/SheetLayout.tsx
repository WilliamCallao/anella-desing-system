import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { SheetLayer } from "./SheetLayer";
import { resolveTransition } from "./transitions";
import type { LayerRole, Route, SheetKind, SheetLayoutProps } from "./types";

type LayerInstance = {
  key: string;
  route: Route;
  role: LayerRole;
};

type SheetLayoutContextValue = {
  change: (key: string) => void;
};

const SheetLayoutContext = createContext<SheetLayoutContextValue>({
  change: () => {},
});

/** Permite que el contenido de una capa pida cambiar de ruta sin navigator. */
export function useSheetLayout(): SheetLayoutContextValue {
  return useContext(SheetLayoutContext);
}

const DURATION = 320;

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

  const [layers, setLayers] = useState<LayerInstance[]>(() => [
    { key: activeKey, route: routeMap[activeKey], role: "active" },
  ]);

  console.log("[SheetLayout] render", {
    activeKey,
    roles: layers.map((l) => l.role),
  });

  const progress = useSharedValue(1);
  const prevKey = useRef(activeKey);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionRef = useRef<{
    fromKind: SheetKind;
    toKind: SheetKind;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, []);

  useEffect(() => {
    if (activeKey === prevKey.current) return;
    const fromKey = prevKey.current;
    const fromRoute = routeMap[fromKey];
    const toRoute = routeMap[activeKey];
    if (!toRoute) return;

    const spec = resolveTransition(fromRoute.kind, toRoute.kind);
    console.log("[SheetLayout] effect transition", {
      fromKey,
      activeKey,
      fromKind: fromRoute?.kind,
      toKind: toRoute?.kind,
      crossFade: spec.crossFadeContent,
    });

    if (spec.crossFadeContent) {
      // Mismo kind: solo reemplazamos la capa activa; SheetLayer anima
      // el resize del header y el cross-fade internamente.
      setLayers([{ key: activeKey, route: toRoute, role: "active" }]);
      progress.value = 1;
      transitionRef.current = null;
    } else {
      // Kinds distintos: montamos saliente + entrante y animamos progress.
      // El "asentamiento" (quitar la capa saliente) se hace en el thread JS
      // con un timeout, para NO pasar el route (con nodos React) por runOnJS,
      // que lo clonaría y crashearía (cloneRecursive / workletError).
      transitionRef.current = {
        fromKind: fromRoute.kind,
        toKind: toRoute.kind,
      };
      setLayers([
        { key: fromKey, route: fromRoute, role: "exiting" },
        { key: activeKey, route: toRoute, role: "entering" },
      ]);
      progress.value = 0;
      progress.value = withTiming(1, { duration: DURATION });
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => {
        console.log("[SheetLayout] transition complete");
        setLayers([{ key: activeKey, route: toRoute, role: "active" }]);
      }, DURATION + 40);
    }

    prevKey.current = activeKey;
  }, [activeKey, routeMap]);

  const change = (key: string) => {
    onRequestChange?.(key);
  };

  return (
    <SheetLayoutContext.Provider value={{ change }}>
      <View style={[styles.root, style]}>
        {layers.map((layer) => {
          let direction: ReturnType<typeof resolveTransition>["enter"] = "stay";
          if (layer.role === "entering" && transitionRef.current) {
            direction = resolveTransition(
              transitionRef.current.fromKind,
              transitionRef.current.toKind,
            ).enter;
          } else if (layer.role === "exiting" && transitionRef.current) {
            direction = resolveTransition(
              transitionRef.current.fromKind,
              transitionRef.current.toKind,
            ).exit;
          }

          return (
            <SheetLayer
              key={layer.key}
              route={layer.route}
              role={layer.role}
              layerProgress={progress}
              layerDirection={direction}
              pointerEvents={layer.role === "exiting" ? "none" : "auto"}
            />
          );
        })}
      </View>
    </SheetLayoutContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
});
