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
import { BackHandler, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useDerivedValue,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
  type SharedValue,
} from "react-native-reanimated";
import { Button } from "../components/Button";
import { Text } from "../components/text";
import { Divisor } from "./Divisor";
import { resolveSemantic, lightSemantic } from "@antonella/theme";

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
      mid: { visible: true, height: "content", fadeOnScroll: true, slot: "header", backgroundColor: DEFAULT_BG },
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
const COLLAPSE_DISTANCE = 80;
const TRANSITION = 320;

const AppNavigationContext = createContext<AppNavigation | null>(null);

export function useAppNavigation(): AppNavigation {
  const ctx = useContext(AppNavigationContext);
  if (!ctx) {
    throw new Error("useAppNavigation debe usarse dentro de <AppLayout>");
  }
  return ctx;
}

export type AppLayoutProps = {
  initialRoute: AppRoute;
  /** Muestra un botón de volver global cuando canGoBack. Default true. */
  showBackButton?: boolean;
  /** Logs de debug en consola. Default false. */
  debug?: boolean;
};

export function AppLayout({
  initialRoute,
  showBackButton = true,
  debug = false,
}: AppLayoutProps) {
  const { height: H } = useWindowDimensions();

  const [stack, setStack] = useState<AppRoute[]>([initialRoute]);
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

  const topNatural = useSharedValue(H / 3);
  const midNatural = useSharedValue(H / 3);
  const bottomNatural = useSharedValue(H / 3);

  const naturals: Record<SectionKey, SharedValue<number>> = {
    top: topNatural,
    mid: midNatural,
    bottom: bottomNatural,
  };

  const animating = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const innerScrollRef = useRef<Animated.ScrollView>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Motor de transición: un solo driver `progress` (0 -> 1). Cada altura se
  // deriva como interpolate(progress, [fromH, toH]). `toH` se actualiza en vivo
  // con la medición del contenido, de modo que ninguna sección salta a 0 de
  // golpe: todo es interpolación continua y coordinada.
  const progress = useSharedValue(1);
  const fromH: Record<SectionKey, SharedValue<number>> = {
    top: useSharedValue(H / 3),
    mid: useSharedValue(H / 3),
    bottom: useSharedValue(H / 3),
  };
  const toH: Record<SectionKey, SharedValue<number>> = {
    top: useSharedValue(H / 3),
    mid: useSharedValue(H / 3),
    bottom: useSharedValue(H / 3),
  };
  const topDisplay = useDerivedValue(() =>
    interpolate(progress.value, [0, 1], [fromH.top.value, toH.top.value])
  );
  const midDisplay = useDerivedValue(() =>
    interpolate(progress.value, [0, 1], [fromH.mid.value, toH.mid.value])
  );
  const bottomDisplay = useDerivedValue(() =>
    interpolate(progress.value, [0, 1], [fromH.bottom.value, toH.bottom.value])
  );
  const display: Record<SectionKey, SharedValue<number>> = {
    top: topDisplay,
    mid: midDisplay,
    bottom: bottomDisplay,
  };

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const computeTargets = (st: LayoutState): Record<SectionKey, number> => {
    const base: Record<SectionKey, number> = { top: 0, mid: 0, bottom: 0 };
    for (const k of SECTION_KEYS) {
      const b = st.sections[k];
      if (!b?.visible) {
        base[k] = 0;
        continue;
      }
      const h = b.height ?? "content";
      if (h === "content") base[k] = naturals[k].value;
      else if (h === "third") base[k] = H / 3;
      else if (h === "fill") base[k] = H;
      else if (h === "fillRest") base[k] = b.restsOn ? H - naturals[b.restsOn].value : 0;
      else base[k] = h;
    }
    return base;
  };

  const makeOnMeasure = (k: SectionKey) => (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    naturals[k].value = h;
    const b = state.sections[k];
    if (b?.height === "content") {
      fromH[k].value = display[k].value;
      toH[k].value = h;
    }
    for (const j of SECTION_KEYS) {
      const bj = state.sections[j];
      if (bj?.visible && bj.height === "fillRest" && bj.restsOn === k) {
        fromH[j].value = display[j].value;
        toH[j].value = H - h;
      }
    }
  };

  useLayoutEffect(() => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    animating.value = 1;
    if (!state.pageScroll) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      innerScrollRef.current?.scrollTo({ y: 0, animated: false });
      scrollY.value = 0;
    }
    const targets = computeTargets(state);
    for (const k of SECTION_KEYS) {
      fromH[k].value = display[k].value;
      toH[k].value = targets[k];
    }
    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: TRANSITION, easing: Easing.inOut(Easing.cubic) },
      () => {
        animating.value = 0;
      }
    );
    settleTimerRef.current = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      scrollY.value = 0;
    }, TRANSITION);
    if (debug) {
      // eslint-disable-next-line no-console
      console.log("[APP] transition ->", currentRoute.name, targets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoute.name]);

  const topStyle = useAnimatedStyle(() => ({ height: topDisplay.value }));
  const midStyle = useAnimatedStyle(() => ({ height: midDisplay.value }));
  const bottomStyle = useAnimatedStyle(() => ({ height: bottomDisplay.value }));

  const stylesFor = {
    top: topStyle,
    mid: midStyle,
    bottom: bottomStyle,
  };

  // El fade se aplica solo al CONTENIDO de la sección (no a su fondo), para que
  // al scrollear desaparezca el contenido pero el color de fondo permanezca.
  const topFade = useAnimatedStyle(
    () => ({
      opacity: state.sections.top?.fadeOnScroll
        ? interpolate(scrollY.value, [0, COLLAPSE_DISTANCE], [1, 0], Extrapolation.CLAMP)
        : 1,
    }),
    [state]
  );
  const midFade = useAnimatedStyle(
    () => ({
      opacity: state.sections.mid?.fadeOnScroll
        ? interpolate(scrollY.value, [0, COLLAPSE_DISTANCE], [1, 0], Extrapolation.CLAMP)
        : 1,
    }),
    [state]
  );
  const bottomFade = useAnimatedStyle(
    () => ({
      opacity: state.sections.bottom?.fadeOnScroll
        ? interpolate(scrollY.value, [0, COLLAPSE_DISTANCE], [1, 0], Extrapolation.CLAMP)
        : 1,
    }),
    [state]
  );
  const fadeFor = {
    top: topFade,
    mid: midFade,
    bottom: bottomFade,
  };

  const renderSection = (k: SectionKey) => {
    const b = state.sections[k];
    if (!b?.visible) {
      return (
        <Animated.View key={k} style={[styles.colBlock, stylesFor[k]]}>
          <View style={styles.measureCopy} onLayout={makeOnMeasure(k)}>
            {b.slot ? slots[b.slot] : null}
          </View>
        </Animated.View>
      );
    }
    const bg = b.backgroundColor ?? DEFAULT_COLORS[k];
    const isDynamic = b.height === "content";
    const content = b.slot ? slots[b.slot] : null;
    return (
      <Animated.View
        key={k}
        style={[styles.colBlock, { backgroundColor: bg, overflow: "hidden" }, stylesFor[k]]}
      >
        {isDynamic && (
          <View style={styles.measureCopy} onLayout={makeOnMeasure(k)}>
            {content}
          </View>
        )}
        {b.scroll ? (
          <Animated.ScrollView
            ref={innerScrollRef}
            style={styles.innerScroll}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onScroll}
          >
            <Animated.View style={fadeFor[k]}>{content}</Animated.View>
          </Animated.ScrollView>
        ) : (
          <Animated.View style={styles.sectionContent}>
            <Animated.View style={fadeFor[k]}>{content}</Animated.View>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  return (
    <AppNavigationContext.Provider value={navigationValue}>
      <View style={[styles.root, { backgroundColor: pageBg }]}>
        <Animated.ScrollView
          ref={scrollRef}
          style={styles.pageScroll}
          contentContainerStyle={[styles.pageContent, { backgroundColor: pageBg }]}
          scrollEnabled={!!state.pageScroll}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
        >
          {renderSection("top")}
          {showTopDivisor && <Divisor position="top" handle={currentRoute.state === "top"} />}
          {renderSection("mid")}
          {showBottomDivisor && (
            <Divisor position="bottom" handle={currentRoute.state === "bottom"} />
          )}
          {renderSection("bottom")}
        </Animated.ScrollView>
        {showBackButton && canGoBack && (
          <View style={styles.backBar} pointerEvents="box-none">
            <Button variant="secondary" size="sm" label="← Volver" onPress={back} />
          </View>
        )}
      </View>
    </AppNavigationContext.Provider>
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
  measureCopy: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
    zIndex: -1,
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
