import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  BackHandler,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useWindowDimensions } from "react-native";
import { Button } from "../components/Button";
import { Text } from "../components/text";
import { Divisor } from "./Divisor";
import { resolveSemantic, lightSemantic } from "@william-callao/antonella-theme";

const _semantic = resolveSemantic(lightSemantic);
const DEFAULT_BG = _semantic.default.bg.default;
const DARK_BG = _semantic.darkness.bg.default;

export type SectionKey = "top" | "mid" | "bottom";
export type HeightSpec = "content" | "fill" | "fillRest" | "third" | number;
export type SlotName = "header" | "body" | "footer";

export type SectionBehavior = {
  /** Si la sección se renderiza. Default true. */
  visible?: boolean;
  /** Cómo se determina su alto: contenido medido, llenar (H), rellenar resto, un tercio, o px fijos. Default "content". */
  height?: HeightSpec;
  /** La sección scrollea internamente (ScrollView propio). */
  scroll?: boolean;
  /** Se mantiene fija (no participa del scroll de página). */
  sticky?: boolean;
  /** Se desvanece al hacer scroll de página (requiere pageScroll). */
  fadeOnScroll?: boolean;
  /** A qué slot de contenido está asociada (header/body/footer). */
  slot?: SlotName;
  /** Para height "fillRest": de qué sección (su alto natural) se descuenta H. */
  restsOn?: SectionKey;
  /** Color de fondo de la sección. */
  backgroundColor?: string;
};

export type LayoutState = {
  /** La página scrollea (scroll externo) en vez de secciones internas. */
  pageScroll?: boolean;
  sections: Record<SectionKey, SectionBehavior>;
};

export type LayoutStateName =
  | "stacked"
  | "bottom"
  | "fullBottom"
  | "onlyCenter"
  | "top";

export type AppRoute = {
  /** Identificador único de la pantalla (usado como clave de navegación). */
  name: string;
  /** Estado del layout: preset por nombre o configuración custom. */
  state: LayoutState | LayoutStateName;
  /** Contenido por slot. Cada slot se renderiza en su sección mapeada. */
  slots?: Partial<Record<SlotName, ReactNode>>;
};

export type AppNavigation = {
  navigate: (route: AppRoute) => void;
  back: () => void;
  canGoBack: boolean;
  currentRoute: AppRoute;
  stack: AppRoute[];
  replace: (route: AppRoute) => void;
};

/** Presets = las 5 variantes del motor, reutilizables por nombre. */
export const layoutStates: Record<LayoutStateName, LayoutState> = {
  stacked: {
    pageScroll: false,
    sections: {
      top: { visible: true, height: "third", slot: "header", backgroundColor: DARK_BG },
      mid: { visible: true, height: "third", slot: "body", backgroundColor: DEFAULT_BG },
      bottom: { visible: true, height: "third", slot: "footer", backgroundColor: DARK_BG },
    },
  },
  bottom: {
    pageScroll: true,
    sections: {
      top: { visible: false },
      mid: { visible: true, height: "content", slot: "header", backgroundColor: DEFAULT_BG },
      bottom: { visible: true, height: "content", slot: "footer", backgroundColor: DARK_BG },
    },
  },
  fullBottom: {
    pageScroll: true,
    sections: {
      top: { visible: false },
      mid: { visible: false },
      bottom: { visible: true, height: "content", slot: "footer", backgroundColor: DARK_BG },
    },
  },
  onlyCenter: {
    pageScroll: false,
    sections: {
      top: { visible: false },
      mid: { visible: true, height: "fill", scroll: true, slot: "body", backgroundColor: DEFAULT_BG },
      bottom: { visible: false },
    },
  },
  top: {
    pageScroll: false,
    sections: {
      top: { visible: true, height: "content", sticky: true, slot: "header", backgroundColor: DARK_BG },
      mid: { visible: true, height: "fillRest", restsOn: "top", scroll: true, slot: "body", backgroundColor: DEFAULT_BG },
      bottom: { visible: false },
    },
  },
};

const SECTION_KEYS: SectionKey[] = ["top", "mid", "bottom"];
const DEFAULT_COLORS: Record<SectionKey, string> = {
  top: DARK_BG,
  mid: DEFAULT_BG,
  bottom: DARK_BG,
};

const AppNavigationContext = createContext<AppNavigation | null>(null);

export function useAppNavigation(): AppNavigation {
  const ctx = useContext(AppNavigationContext);
  if (!ctx) {
    throw new Error("useAppNavigation debe usarse dentro de <AppLayout>");
  }
  return ctx;
}

// Diagnóstico: permite a cualquier slot pedir un snapshot del estado actual del
// motor (alturas, opacidades de fade, scrollY) en un momento puntual.
export type AppLayoutDebugSnapshot = {
  route: string;
  anchors: string[];
  anim: Record<string, number>;
  naturals: Record<SectionKey, number>;
  lastMeasured: Record<SectionKey, number>;
  windowH: number;
};

const AppLayoutDebugContext = createContext<{ snapshot: () => AppLayoutDebugSnapshot } | null>(null);

export function useAppLayoutDebug(): { snapshot: () => AppLayoutDebugSnapshot } {
  const ctx = useContext(AppLayoutDebugContext);
  if (!ctx) {
    throw new Error("useAppLayoutDebug debe usarse dentro de <AppLayout>");
  }
  return ctx;
}

export type AppLayoutProps = {
  initialRoute: AppRoute;
  /** Muestra un botón de volver global cuando canGoBack. Default true. */
  showBackButton?: boolean;
};

export function AppLayout({
  initialRoute,
  showBackButton = true,
}: AppLayoutProps) {
  const { height: H } = useWindowDimensions();

  const [stack, setStack] = useState<AppRoute[]>([initialRoute]);
  const [prevRoute, setPrevRoute] = useState<AppRoute | null>(null);

  // Si la ruta inicial cambia desde afuera (por ejemplo, targetRoute del shell),
  // hay que sincronizar el stack interno. Sin esto, AppLayout ignora el cambio
  // de initialRoute y se queda en la pantalla anterior.
  useEffect(() => {
    setStack((s) => {
      if (s[0]?.name !== initialRoute.name) {
        return [initialRoute];
      }
      return s;
    });
  }, [initialRoute.name]);
  const navigate = useCallback((route: AppRoute) => {
    setStack((s) => [...s, route]);
  }, []);
  const replace = useCallback((route: AppRoute) => {
    setStack((s) => [...s.slice(0, -1), route]);
  }, []);
  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);
  const canGoBack = stack.length > 1;
  const currentRoute = stack[stack.length - 1];

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack) {
        back();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack, back]);

  const navigationValue: AppNavigation = {
    navigate,
    back,
    canGoBack,
    currentRoute,
    stack,
    replace,
  };

  const state: LayoutState =
    typeof currentRoute.state === "string"
      ? layoutStates[currentRoute.state]
      : currentRoute.state;
  const slots = currentRoute.slots ?? {};

  const prevLayoutState: LayoutState | null = prevRoute
    ? typeof prevRoute.state === "string"
      ? layoutStates[prevRoute.state]
      : prevRoute.state
    : null;

  // Cuando el footer es visible, el fondo inferior toma su color para dar la
  // ilusión de que la hoja oscura ocupa todo el alto disponible (aunque su
  // contenido sea corto y la página scrollee).
  const pageBg =
    state.sections.bottom?.visible
      ? state.sections.bottom.backgroundColor ?? DARK_BG
      : DEFAULT_BG;

  const topVisible = !!state.sections.top?.visible;
  const midVisible = !!state.sections.mid?.visible;
  const bottomVisible = !!state.sections.bottom?.visible;
  const showTopDivisor = topVisible && (midVisible || bottomVisible);
  const showBottomDivisor = bottomVisible && (topVisible || midVisible);

  // Motor ESTÁTICO de layout: las alturas se derivan de las medidas naturales y
  // se aplican de forma inmediata, sin animación.
  //
  // IMPORTANTE (historia del bug "texto que desaparece" en Android): animar
  // `height` sobre secciones con árboles de texto complejos — con Reanimated
  // (useAnimatedStyle) y con el driver clásico de RN (Animated.timing,
  // useNativeDriver:false) — deja nodos de texto sin repintar en SDK 54 / New
  // Architecture (Fabric) cuando se regresa a la pantalla anterior: el layout
  // se mueve pero las letras no vuelven a pintarse. El único modo estable es
  // aplicar las alturas como estilos planos (el layout se recalcula por el
  // camino estándar de Fabric y los textos se repintan siempre).
  const [layoutHeights, setLayoutHeights] = useState<Record<SectionKey, number>>({
    top: H / 3,
    mid: H / 3,
    bottom: H / 3,
  });
  const scrollRef = useRef<ScrollView>(null);
  const innerScrollRef = useRef<ScrollView>(null);

  // Alto natural (medido) de cada sección + último alto aceptado por el guard.
  // Se mantienen en refs simples (cambios no re-renderizan; la animación los
  // lee en cada render por vía de `naturalsRef`).
  const naturalsRef = useRef<Record<SectionKey, number>>({
    top: H / 3,
    mid: H / 3,
    bottom: H / 3,
  });
  const lastMeasured = useRef<Record<SectionKey, number>>({ top: 0, mid: 0, bottom: 0 });

  const computeTargets = (st: LayoutState): Record<SectionKey, number> => {
    const base: Record<SectionKey, number> = { top: 0, mid: 0, bottom: 0 };
    for (const k of SECTION_KEYS) {
      const b = st.sections[k];
      if (!b?.visible) {
        base[k] = 0;
        continue;
      }
      const h = b.height ?? "content";
      if (h === "content") base[k] = naturalsRef.current[k];
      else if (h === "third") base[k] = H / 3;
      else if (h === "fill") base[k] = H;
      else if (h === "fillRest") base[k] = b.restsOn ? H - naturalsRef.current[b.restsOn] : 0;
      else base[k] = h;
    }
    return base;
  };

  // Último alto natural aceptado por sección. Protege el layout de un artefacto
  // del doble-montaje del slot: al volver a una ruta (p. ej. desde
  // producto-detalle) el contenido se remonta y, si es un árbol con "flex:1",
  // su medición intrínseca puede devolver solo el padding (~32px) en vez del
  // alto real (~290px). Commitear ese valor a la sección hacía que la altura
  // colapsara (bug de "items comprimidos"). Solo se acepta una medida si es la
  // primera para la sección o alcanza la mitad del último alto aceptado (con
  // piso de 100px), de modo que una caída puntual colapsada no contamine el
  // valor natural.
  const applyTargets = useCallback((next: Record<SectionKey, number>) => {
    setLayoutHeights((prev) =>
      SECTION_KEYS.every((k) => prev[k] === next[k]) ? prev : next
    );
  }, []);

  const makeOnMeasure = (k: SectionKey) => (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    const prev = lastMeasured.current[k];
    const collapsed = prev > 0 && h < Math.min(prev * 0.5, 100);
    if (collapsed) return;
    naturalsRef.current[k] = h;
    lastMeasured.current[k] = h;
    applyTargets(computeTargets(state));
  };

  useLayoutEffect(() => {
    const targets = computeTargets(state);
    if (!state.pageScroll) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      innerScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
    applyTargets(targets);
    setPrevRoute(currentRoute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoute.name]);

  const snapshot = useCallback(
    (): AppLayoutDebugSnapshot => {
      const midNatural = naturalsRef.current.mid || 1;
      return {
        route: currentRoute.name,
        anchors: stack.map((r) => r.name),
        anim: {
          scrollY: 0,
          animating: 0,
          top: Math.round(layoutHeights.top),
          mid: Math.round(layoutHeights.mid),
          bottom: Math.round(layoutHeights.bottom),
          topFade: 1,
          midFade: Math.min(layoutHeights.mid / midNatural, 1),
          bottomFade: 1,
        },
        naturals: { ...naturalsRef.current },
        lastMeasured: { ...lastMeasured.current },
        windowH: H,
      };
    },
    [currentRoute.name, stack, H, layoutHeights]
  );

  const renderSection = (k: SectionKey) => {
    const cur = state.sections[k];
    const prevB = prevLayoutState?.sections[k];
    const prevVisible = !!prevB?.visible;
    const visible = !!cur?.visible || prevVisible;
    const height = layoutHeights[k];
    if (!visible) {
      return (
        <View key={k} style={[styles.colBlock, { height }]}>
          <View style={styles.measureCopy} onLayout={makeOnMeasure(k)}>
            {cur?.slot ? slots[cur.slot] : null}
          </View>
        </View>
      );
    }
    const usePrevContent = !cur?.visible && prevVisible;
    const slot = usePrevContent ? prevB?.slot : cur?.slot;
    const content = slot
      ? usePrevContent
        ? prevRoute?.slots?.[slot]
        : slots[slot]
      : null;
    const bg = cur?.backgroundColor ?? prevB?.backgroundColor ?? DEFAULT_COLORS[k];
    const isDynamic = (cur?.height ?? prevB?.height) === "content";
    const scroll = cur?.scroll ?? prevB?.scroll ?? false;
    return (
      <View key={k} style={[styles.colBlock, { backgroundColor: bg, height }]}>
        {isDynamic && (
          <View
            pointerEvents="none"
            style={styles.measureOuter}
            onLayout={makeOnMeasure(k)}
          >
            <View style={styles.measureCopy}>{content}</View>
          </View>
        )}
        {scroll ? (
          <ScrollView
            ref={innerScrollRef}
            style={styles.innerScroll}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          <View style={styles.sectionContent}>{content}</View>
        )}
      </View>
    );
  };

  return (
    <AppLayoutDebugContext.Provider value={{ snapshot }}>
      <AppNavigationContext.Provider value={navigationValue}>
        <View style={[styles.root, { backgroundColor: pageBg }]}>
          <ScrollView
            ref={scrollRef}
            style={styles.pageScroll}
            contentContainerStyle={[styles.pageContent, { backgroundColor: pageBg }]}
            scrollEnabled={!!state.pageScroll}
            showsVerticalScrollIndicator={false}
          >
            {renderSection("top")}
            {showTopDivisor && <Divisor position="top" handle={currentRoute.state === "top"} />}
            {renderSection("mid")}
            {showBottomDivisor && (
              <Divisor position="bottom" handle={currentRoute.state === "bottom"} />
            )}
            {renderSection("bottom")}
          </ScrollView>
          {showBackButton && canGoBack && (
            <View style={styles.backBar} pointerEvents="box-none">
              <Button variant="secondary" size="sm" label="← Volver" onPress={back} />
            </View>
          )}
        </View>
      </AppNavigationContext.Provider>
    </AppLayoutDebugContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  pageScroll: {
    flex: 1,
  },
  pageContent: {
    flexGrow: 1,
  },
  colBlock: {
    width: "100%",
    position: "relative",
  },
  measureOuter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
    zIndex: -1,
  },
  measureCopy: {
    width: "100%",
  },
  sectionContent: {
    flex: 1,
  },
  innerScroll: {
    flex: 1,
  },
  backBar: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 100,
  },
});