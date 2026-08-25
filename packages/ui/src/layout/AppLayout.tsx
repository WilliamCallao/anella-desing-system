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
  withTiming,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { Button } from "../components/Button";
import { Text } from "../components/text";
import { resolveSemantic, lightSemantic } from "@antonella/theme";

const _semantic = resolveSemantic(lightSemantic);
const DEFAULT_BG = _semantic.default.bg.default;

export type SectionKey = "red" | "blue" | "yellow";
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
      red: { visible: true, height: "third", slot: "header", backgroundColor: "#FF3B30" },
      blue: { visible: true, height: "third", slot: "body", backgroundColor: "#007AFF" },
      yellow: { visible: true, height: "third", slot: "footer", backgroundColor: "#FFCC00" },
    },
  },
  bottom: {
    pageScroll: true,
    sections: {
      red: { visible: false },
      blue: { visible: true, height: "content", fadeOnScroll: true, slot: "header", backgroundColor: "#007AFF" },
      yellow: { visible: true, height: "content", slot: "footer", backgroundColor: "#FFCC00" },
    },
  },
  fullBottom: {
    pageScroll: true,
    sections: {
      red: { visible: false },
      blue: { visible: false },
      yellow: { visible: true, height: "content", slot: "footer", backgroundColor: "#FFCC00" },
    },
  },
  onlyCenter: {
    pageScroll: false,
    sections: {
      red: { visible: false },
      blue: { visible: true, height: "fill", scroll: true, slot: "body", backgroundColor: "#007AFF" },
      yellow: { visible: false },
    },
  },
  top: {
    pageScroll: false,
    sections: {
      red: { visible: true, height: "content", sticky: true, slot: "header", backgroundColor: "#FF3B30" },
      blue: { visible: true, height: "fillRest", restsOn: "red", scroll: true, slot: "body", backgroundColor: "#007AFF" },
      yellow: { visible: false },
    },
  },
};

const SECTION_KEYS: SectionKey[] = ["red", "blue", "yellow"];
const DEFAULT_COLORS: Record<SectionKey, string> = {
  red: "#FF3B30",
  blue: "#007AFF",
  yellow: "#FFCC00",
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

  const redHeight = useSharedValue(H / 3);
  const blueHeight = useSharedValue(H / 3);
  const yellowHeight = useSharedValue(H / 3);
  const redNatural = useSharedValue(H / 3);
  const blueNatural = useSharedValue(H / 3);
  const yellowNatural = useSharedValue(H / 3);

  const heights: Record<SectionKey, SharedValue<number>> = {
    red: redHeight,
    blue: blueHeight,
    yellow: yellowHeight,
  };
  const naturals: Record<SectionKey, SharedValue<number>> = {
    red: redNatural,
    blue: blueNatural,
    yellow: yellowNatural,
  };

  const animating = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const computeTargets = (st: LayoutState): Record<SectionKey, number> => {
    const base: Record<SectionKey, number> = { red: 0, blue: 0, yellow: 0 };
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
    if (animating.value === 0) {
      const b = state.sections[k];
      if (b?.height === "content") {
        heights[k].value = h;
      }
      for (const j of SECTION_KEYS) {
        const bj = state.sections[j];
        if (bj?.visible && bj.height === "fillRest" && bj.restsOn === k) {
          heights[j].value = H - h;
        }
      }
    }
  };

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    scrollY.value = 0;
    animating.value = 1;
    const targets = computeTargets(state);
    const done = () => {
      animating.value = 0;
      for (const k of SECTION_KEYS) {
        const b = state.sections[k];
        if (!b?.visible) continue;
        if (b.height === "content") heights[k].value = naturals[k].value;
        else if (b.height === "fillRest" && b.restsOn) {
          heights[k].value = H - naturals[b.restsOn].value;
        }
      }
    };
    for (const k of SECTION_KEYS) {
      heights[k].value = withTiming(targets[k], { duration: TRANSITION }, done);
    }
    if (debug) {
      // eslint-disable-next-line no-console
      console.log("[APP] transition ->", currentRoute.name, targets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoute.name]);

  const redStyle = useAnimatedStyle(() => ({ height: redHeight.value }));
  const blueStyle = useAnimatedStyle(() => ({
    height: blueHeight.value,
    opacity:
      state.sections.blue?.fadeOnScroll && state.pageScroll
        ? interpolate(scrollY.value, [0, COLLAPSE_DISTANCE], [1, 0], Extrapolation.CLAMP)
        : 1,
  }), [state, H]);
  const yellowStyle = useAnimatedStyle(() => ({ height: yellowHeight.value }));

  const stylesFor = {
    red: redStyle,
    blue: blueStyle,
    yellow: yellowStyle,
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
            style={styles.innerScroll}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onScroll}
          >
            {content}
          </Animated.ScrollView>
        ) : (
          <View style={styles.sectionContent}>{content}</View>
        )}
      </Animated.View>
    );
  };

  return (
    <AppNavigationContext.Provider value={navigationValue}>
      <View style={[styles.root, { backgroundColor: DEFAULT_BG }]}>
        <Animated.ScrollView
          ref={scrollRef}
          style={styles.pageScroll}
          contentContainerStyle={styles.pageContent}
          scrollEnabled={!!state.pageScroll}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
        >
          {renderSection("red")}
          {renderSection("blue")}
          {renderSection("yellow")}
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
