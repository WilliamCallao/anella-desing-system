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
import Animated, {
  CurvedTransition,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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
      bottom: {
        visible: true,
        height: "fillRest",
        restsOn: "mid",
        scroll: true,
        slot: "footer",
        backgroundColor: DARK_BG,
      },
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

// Transición nativa de estados (Reanimated layout transitions): anima
// height/posición vía MountingOverrideDelegate (hilo UI) SIN commitear un
// shadow tree por frame, a diferencia de animar `height` con useAnimatedStyle
// (que es lo que producía texto sin repintar en Fabric).
const LAYOUT_DURATION = 300;
const REVEAL_DELAY_MS = 380;
const REVEAL_DURATION_MS = 200;

// Diagnóstico TEMPORAL (producto): seguimiento del tamaño de las secciones
// durante las transiciones.
//   [route-change] objetivos planeados al cambiar de ruta (T/M/B)
//   [heights]      altos comiteados por el motor en cada cambio de estado
//   [measure]      alto natural medido de una sección (onLayout)
//   [layout]       alto REAL de una sección en cada layout que emite
let _logT0 = -1;
const _logT = () => {
  if (_logT0 < 0) _logT0 = Date.now();
  return `${Date.now() - _logT0}ms`;
};
const _revLog = (msg: string, ...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log(`[app-layout] t=${_logT()} ${msg}`, ...args);
};
const _logH = (h: Record<SectionKey, number>) =>
  `T:${Math.round(h.top)} M:${Math.round(h.mid)} B:${Math.round(h.bottom)}`;

// Al colapsar la sección bottom durante una transición (p. ej. accounts→home,
// bottom 548→0 empujada por el mid que crece), la layout transition encogía la
// caja: el body se deslizaba hacia abajo pero a la vez se comprimía en alto. La
// sección mantiene su alto previo mientras la empujan, y recién al terminar el
// layout adopta su alto final (que ya quedó bajo el borde de pantalla). Solo se
// mantiene si la transición es animada; un colapso sin animación aplica directo.
const _withBottomHold = (t: Record<SectionKey, number>, cur: Record<SectionKey, number>) => {
  const held = t.bottom < cur.bottom ? cur.bottom : t.bottom;
  return held === t.bottom ? t : { ...t, bottom: held };
};

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
  /**
   * Anima las transiciones de estado (rutas y colapsos por medición) con
   * layout transitions de Reanimated, en lugar de aplicar las alturas planas
   * de forma inmediata. Default false (motor estático estable).
   */
  animateTransitions?: boolean;
  /**
   * Cuándo revelar el contenido visible de las secciones durante una
   * transición animada. "always": siempre visible (el alto anima con el
   * contenido pintado). "after": el contenido se oculta mientras el alto
   * transiciona y se desvanece al terminar. Default "always".
   */
  contentReveal?: "always" | "after";
};

export function AppLayout({
  initialRoute,
  showBackButton = true,
  animateTransitions = false,
  contentReveal = "always",
}: AppLayoutProps) {
  const { height: H } = useWindowDimensions();

  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? LinearTransition.duration(0)
    : CurvedTransition.duration(LAYOUT_DURATION);
  const revealProgress = useSharedValue(1);
  const revealStyle = useAnimatedStyle(() => ({ opacity: revealProgress.value }));

  const [stack, setStack] = useState<AppRoute[]>([initialRoute]);
  const [prevRoute, setPrevRoute] = useState<AppRoute | null>(null);
  const hasTransition = animateTransitions && prevRoute !== null;

  // Ocultar/revelar el contenido visible durante una transición animada. El
  // ocultamiento ("erase", opacity 0) es un estilo PLANO en un nodo SIN
  // useAnimatedStyle (la opacity animada pisa siempre a la estática aunque vaya
  // después en el arreglo). El latch de `revealHidden` se hace en TIEMPO DE
  // RENDER (patrón de ajuste de estado durante render, ver más abajo), no en un
  // efecto: el primer commit de la ruta nueva ya es invisible y ningún frame
  // pinta el contenido antes de la transición. El fade-in post-layout es la
  // única parte animada por shared value, porque Reanimated bloquea el hilo UI
  // mientras corren las layout transitions y un withSequence programado en el
  // mismo commit no corre hasta que termina el layout.
  const [revealHidden, setRevealHidden] = useState(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startReveal = useCallback(() => {
    if (revealTimer.current) {
      clearTimeout(revealTimer.current);
    }
    revealTimer.current = setTimeout(() => {
      revealTimer.current = null;
      revealProgress.value = 0;
      revealProgress.value = withTiming(1, { duration: REVEAL_DURATION_MS });
      setRevealHidden(false);
    }, REVEAL_DELAY_MS);
  }, [revealProgress, REVEAL_DELAY_MS, REVEAL_DURATION_MS]);

  useEffect(() => {
    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, []);

  // Si la ruta inicial cambia desde afuera (por ejemplo, currentRoute del
  // AppShell), hay que sincronizar el stack interno. Sin esto, AppLayout ignora
  // el cambio de initialRoute y se queda en la pantalla anterior.
  useEffect(() => {
    setStack((s) => (s[0]?.name === initialRoute.name ? s : [initialRoute]));
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

  const revealEnabled = animateTransitions && contentReveal === "after" && !reduceMotion;
  // Latcheo en TIEMPO DE RENDER: la primera renderización de una ruta nueva
  // detecta el cambio de `currentRoute` y oculta el contenido al instante. El
  // patrón "ajustar estado durante render" de React descarta ese render y vuelve
  // a renderizar con `revealHidden=true` ANTES de pintar, así el primer commit
  // de la ruta nueva sale invisible. Ocultar en un efecto llega tarde: el primer
  // commit ya salió con el contenido visible (se veía "montado" antes de la
  // animación). Solo aplica cuando hay una transición real (prevRoute !== null,
  // es decir, ya hubo al menos una navegación).
  const [prevRouteName, setPrevRouteName] = useState(currentRoute.name);
  if (
    revealEnabled &&
    prevRoute !== null &&
    prevRoute.name !== currentRoute.name &&
    prevRouteName !== currentRoute.name
  ) {
    setPrevRouteName(currentRoute.name);
    setRevealHidden(true);
  }

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

  const resolvedState: LayoutState | undefined =
    typeof currentRoute.state === "string"
      ? layoutStates[currentRoute.state]
      : currentRoute.state;
  const state: LayoutState = resolvedState ?? layoutStates.onlyCenter;
  const slots = currentRoute.slots ?? {};

  const prevLayoutState: LayoutState | null = prevRoute
    ? typeof prevRoute.state === "string"
      ? layoutStates[prevRoute.state]
      : prevRoute.state
    : null;

  // Cuando el footer es visible, el fondo inferior toma su color para dar la
  // ilusión de que la hoja oscura ocupa todo el alto disponible (aunque su
  // contenido sea corto y la página scrollee).
  const pageBg = DEFAULT_BG;

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
  const layoutHeightsRef = useRef(layoutHeights);
  layoutHeightsRef.current = layoutHeights;
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const innerScrollRef = useRef<ScrollView>(null);

  // Alto natural (medido) de cada sección. Se mantienen en refs simples (los
  // cambios no re-renderizan; se leen vía `naturalsRef` en cada render).
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
    for (const k of SECTION_KEYS) {
      const v = next[k];
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
        next = { ...next, [k]: 0 };
      }
    }
    setLayoutHeights((prev) => {
      const changed = !SECTION_KEYS.every((k) => prev[k] === next[k]);
      if (changed) {
        _revLog(
          `[heights] ${_logH(prev)} → ${_logH(next)} (${SECTION_KEYS.filter((k) => prev[k] !== next[k]).join(",")})`
        );
      }
      return changed ? next : prev;
    });
  }, []);

  const makeOnMeasure = (k: SectionKey) => (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    const prev = lastMeasured.current[k];
    if (!Number.isFinite(h) || h <= 0) return;
    const collapsed = prev > 0 && h < Math.min(prev * 0.5, 100);
    if (collapsed) return;
    naturalsRef.current[k] = h;
    lastMeasured.current[k] = h;
    _revLog(`[measure] ${k} h=${Math.round(h)} (prev=${Math.round(prev)})`);
    const targets = computeTargets(state);
    applyTargets(
      animateTransitions && prevRoute !== null && !reduceMotion
        ? _withBottomHold(targets, layoutHeightsRef.current)
        : targets
    );
  };

  useLayoutEffect(() => {
    if (!state.pageScroll) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      innerScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
    const targets = computeTargets(state);
    const animated = animateTransitions && prevRoute !== null && !reduceMotion;
    const applied = animated ? _withBottomHold(targets, layoutHeightsRef.current) : targets;
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    if (applied !== targets) {
      _revLog(
        `[hold] bottom ${Math.round(layoutHeightsRef.current.bottom)} → ${Math.round(targets.bottom)} (snap @ ${LAYOUT_DURATION}ms)`
      );
      settleTimer.current = setTimeout(() => {
        settleTimer.current = null;
        applyTargets(targets);
      }, LAYOUT_DURATION);
    }
    _revLog(
      `[route-change] prev=${prevRoute?.name ?? "(ninguna)"} → cur=${currentRoute.name} targets=${_logH(targets)} applied=${_logH(applied)} pageScroll=${state.pageScroll}`
    );
    applyTargets(applied);
    if (revealEnabled && prevRoute) {
      startReveal();
    }
    setPrevRoute(currentRoute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoute.name]);

  const renderSection = (k: SectionKey) => {
    const cur = state.sections[k];
    const prevB = prevLayoutState?.sections[k];
    const prevVisible = !!prevB?.visible;
    const visible = !!cur?.visible || prevVisible;
    const height = layoutHeights[k];
    const animating = animateTransitions && hasTransition;
    let inner: ReactNode;
    if (!visible) {
      inner = (
        <View style={styles.measureCopy} onLayout={makeOnMeasure(k)}>
          {cur?.slot ? slots[cur.slot] : null}
        </View>
      );
    } else {
      const usePrevContent = !cur?.visible && prevVisible;
      const slot = usePrevContent ? prevB?.slot : cur?.slot;
      const content = slot
        ? usePrevContent
          ? prevRoute?.slots?.[slot]
          : slots[slot]
        : null;
      const isDynamic = (cur?.height ?? prevB?.height) === "content";
      const scroll = cur?.scroll ?? prevB?.scroll ?? false;
      // Medición de la propia instancia visible: para secciones "content" sin
      // scroll (p. ej. el header de preset `bottom`), se mide el contenedor
      // visible directamente en vez de montar una copia oculta. Esto elimina el
      // doble-mount del slot (measureCopy invisible + vista visible) que duplica
      // la instancia del contenido (logs [accounts:header] MOUNT x2).
      const selfMeasured = isDynamic && !scroll;
      const body = scroll ? (
        <ScrollView
          ref={innerScrollRef}
          style={styles.innerScroll}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : selfMeasured ? (
        <View style={styles.measureNatural} onLayout={makeOnMeasure(k)}>
          {content}
        </View>
      ) : (
        <View style={styles.sectionContent}>{content}</View>
      );
      const revealContent = revealEnabled;
      inner = (
        <>
          {isDynamic && !selfMeasured && (
            <View
              pointerEvents="none"
              style={styles.measureOuter}
              onLayout={makeOnMeasure(k)}
            >
              <View style={styles.measureCopy}>{content}</View>
            </View>
          )}
          {revealContent ? (
            <View
              style={[styles.reveal, revealHidden && styles.revealHidden]}
            >
              <Animated.View style={[styles.reveal, revealStyle]}>
                {body}
              </Animated.View>
            </View>
          ) : (
            body
          )}
        </>
      );
    }
    const bg = cur?.backgroundColor ?? prevB?.backgroundColor ?? DEFAULT_COLORS[k];
    return (
      <Animated.View
        key={k}
        layout={animating ? transition : undefined}
        collapsable={false}
        onLayout={(e) =>
          _revLog(`[layout] ${k} h=${Math.round(e.nativeEvent.layout.height)}`)
        }
        style={[
          styles.colBlock,
          { backgroundColor: bg, height },
          animating && styles.clip,
        ]}
      >
        {inner}
      </Animated.View>
    );
  };

  return (
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
          {showTopDivisor && (
            <Animated.View
              layout={hasTransition && animateTransitions ? transition : undefined}
              collapsable={false}
            >
              <Divisor position="top" handle={currentRoute.state === "top"} />
            </Animated.View>
          )}
          {renderSection("mid")}
          {showBottomDivisor && (
            <Animated.View
              layout={hasTransition && animateTransitions ? transition : undefined}
              collapsable={false}
            >
              <Divisor position="bottom" handle={currentRoute.state === "bottom"} />
            </Animated.View>
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
  clip: {
    overflow: "hidden",
  },
  reveal: {
    flex: 1,
  },
  revealHidden: {
    opacity: 0,
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
  measureNatural: {
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