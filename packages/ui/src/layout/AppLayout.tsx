import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  BackHandler,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  CurvedTransition,
  LinearTransition,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button } from "../components/Button";
import { Divisor } from "./Divisor";
import { layoutDebug, setLayoutDebug } from "./layoutDebug";
import {
  SECTION_DEFAULT_COLORS,
  SECTION_KEYS,
  FULLBOTTOM_DIVISOR_H,
  bottomOverflows,
  computeSectionTargets,
  initialNaturals,
  isValidMeasurement,
  layoutStates,
  resolveLayoutState,
  seedNaturals,
  selectPageBackground,
  shouldResetScroll,
  writeNaturals,
  type AppRoute,
  type LayoutState,
  type NaturalsSnapshot,
  type SectionHeights,
  type SectionKey,
} from "./layoutMath";

// La API pública del motor (tipos + presets) vive ahora en `layoutMath` para que
// la matemática sea testeable en node. Se reexporta acá para no romper los
// imports que pasan por el índice del paquete (`@william-callao/antonella-ui`).
export {
  layoutStates,
  type AppRoute,
  type HeightSpec,
  type LayoutState,
  type LayoutStateName,
  type SectionBehavior,
  type SectionKey,
  type SlotName,
} from "./layoutMath";

// Transición nativa de estados (Reanimated layout transitions): anima
// height/posición vía MountingOverrideDelegate (hilo UI) SIN commitear un
// shadow tree por frame, a diferencia de animar `height` con useAnimatedStyle
// (que es lo que producía texto sin repintar en Fabric).
const LAYOUT_DURATION = 300;
const REVEAL_DELAY_MS = 380;
const REVEAL_DURATION_MS = 200;

// Relecturas del proxy de medición. Un descendiente que anima su PROPIO alto en
// el hilo UI (p. ej. `TransitionView`, que arranca en 0 y crece) hace que el
// `onLayout` de JS del proxy quede con la altura de un frame intermedio y no se
// vuelva a disparar de forma confiable en iOS. Para no medir un alto "capado por
// animación", además del onLayout re-leemos con `measure()` hasta que la altura
// queda estable (dos lecturas iguales) o pasa el tope de tiempo.
const PROBE_INTERVAL_MS = 150;
const PROBE_STABLE_HITS = 2;
const PROBE_MAX_MS = 4000;

const _sanitize = (v: number): number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0;

export type AppNavigation = {
  navigate: (route: AppRoute) => void;
  back: () => void;
  canGoBack: boolean;
  currentRoute: AppRoute;
  stack: AppRoute[];
  replace: (route: AppRoute) => void;
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
   * layout transitions de Reanimated (morph de altura en hilo UI), en lugar de
   * aplicar las alturas planas de forma inmediata. Default false (motor
   * estático estable).
   */
  animateTransitions?: boolean;
  /**
   * Cuándo revelar el contenido visible de las secciones durante una
   * transición animada. "always": siempre visible (el alto anima con el
   * contenido pintado). "after": el contenido se oculta mientras el alto
   * transiciona y se desvanece al terminar. Default "always".
   */
  contentReveal?: "always" | "after";
  /**
   * Enciende el log de instrumentación del motor a consola (equivale a
   * `EXPO_PUBLIC_LAYOUT_DEBUG=1` o a `__ANTONELLA_LAYOUT_DEBUG__(true)`).
   * El buffer de eventos se llena igual; ver `layoutDebug.ts`.
   */
  debug?: boolean;
};

/**
 * Motor de layout por estados. Ver `APPLAYOUT.md`.
 *
 * Modelo de medición (robusto, sin heurísticas de valor):
 *  - Cada sección dinámica (`content`/`minFillRest`) se mide con un PROXY
 *    offscreen NO restringido (posición absoluta, alto auto, `opacity:0`,
 *    `pointerEvents:none`). Al no fijarle alto, la medida es siempre la altura
 *    intrínseca real: el artefacto del `flex:1` que medía ~32px de padding en el
 *    contenedor visible es estructuralmente imposible, así que nunca se descarta
 *    una medición legítima (no existe guard de umbral).
 *  - El proxy vive FUERA del contenedor que recorta (`overflow:hidden`) durante
 *    las transiciones, y se re-mide con `measure()` hasta estabilizar, para no
 *    quedar con el alto "capado" por una animación de un descendiente.
 *  - Los naturales medidos se cachean por nombre de ruta (`NaturalsSnapshot`).
 *    Al volver a una ruta ya vista, se siembran sus naturales y el primer frame
 *    se pinta con el alto correcto → sin "header distinto al volver".
 *  - NUNCA se hereda el alto de otra pantalla: una ruta nunca vista se siembra
 *    con un neutro derivado de la ventana, jamás con los naturales de la ruta
 *    previa (sin "vestigios" entre pantallas).
 *  - El scroll de página e interno se resetea al tope SOLO cuando cambia el
 *    nombre de ruta; los cambios de contenido dentro de la misma ruta preservan
 *    la posición.
 *  - El fondo del page toma el color del cuerpo/mid (`selectPageBackground`) y
 *    se interpola durante la transición: el lienzo no salta a negro antes de que
 *    el header claro termine de contraerse, y no hace falta sobredimensionar el
 *    body con colas.
 *
 * Contrato de slots dinámicos: el contenido de una sección `content`/
 * `minFillRest` se monta DOS veces (proxy + visible). Debe ser puro e
 * idempotente (sin efectos destructivos al montar).
 */
export function AppLayout({
  initialRoute,
  showBackButton = true,
  animateTransitions = false,
  contentReveal = "always",
  debug = false,
}: AppLayoutProps) {
  const { height: H } = useWindowDimensions();
  const HRef = useRef(H);
  HRef.current = H;

  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? LinearTransition.duration(0)
    : CurvedTransition.duration(LAYOUT_DURATION);
  const revealProgress = useSharedValue(1);
  const revealStyle = useAnimatedStyle(() => ({ opacity: revealProgress.value }));

  // El fondo del page tambien es parte de la transicion. Antes cambiaba de
  // golpe con el estado destino: al entrar a fullBottom el lienzo claro pasaba
  // a negro en el primer frame, mientras el header claro todavia se estaba
  // contrayendo. Ahora interpola entre el color anterior y el nuevo durante la
  // misma ventana que las alturas.
  const initialPageBg = selectPageBackground(resolveLayoutState(initialRoute.state));
  const pageBgFrom = useSharedValue(initialPageBg);
  const pageBgTo = useSharedValue(initialPageBg);
  const pageBgProgress = useSharedValue(1);
  const pageBgTargetRef = useRef(initialPageBg);
  const pageBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      pageBgProgress.value,
      [0, 1],
      [pageBgFrom.value, pageBgTo.value],
    ),
  }));

  const [stack, setStack] = useState<AppRoute[]>([initialRoute]);
  const [prevRoute, setPrevRoute] = useState<AppRoute | null>(null);
  const prevRouteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTransition = animateTransitions && prevRoute !== null;

  const initialNaturalsValue = useRef(
    initialNaturals(H, resolveLayoutState(initialRoute.state)),
  ).current;
  const [layoutHeights, setLayoutHeights] = useState<SectionHeights>(() =>
    computeSectionTargets(resolveLayoutState(initialRoute.state), initialNaturalsValue, H)
  );
  const appliedRef = useRef(layoutHeights);

  // Alto natural (medido) de cada sección. El snapshot por ruta permite repintar
  // una ruta ya visitada con su alto correcto en el primer frame.
  const naturalsRef = useRef<SectionHeights>({ ...initialNaturalsValue });
  const routeSnapshotRef = useRef<NaturalsSnapshot>(new Map());

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
  }, [revealProgress]);

  const stateRef = useRef<LayoutState>(layoutStates.onlyCenter);
  const currentRouteNameRef = useRef(initialRoute.name);
  const bodyOverflowRef = useRef(false);
  const [pageCanScroll, setPageCanScroll] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const innerScrollRef = useRef<ScrollView>(null);

  // Medición: refs a los proxies por sección + estado de las relecturas.
  const proxyRefs = useRef<Partial<Record<SectionKey, View | null>>>({});
  const probeTimers = useRef<Partial<Record<SectionKey, ReturnType<typeof setInterval> | null>>>({});
  const probeLast = useRef<Partial<Record<SectionKey, number | null>>>({});
  const probeStable = useRef<Partial<Record<SectionKey, number>>>({});

  useEffect(() => {
    if (debug) setLayoutDebug(true);
  }, [debug]);

  useEffect(() => {
    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
      if (prevRouteTimer.current) clearTimeout(prevRouteTimer.current);
      SECTION_KEYS.forEach((k) => {
        const t = probeTimers.current[k];
        if (t) clearInterval(t);
      });
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
  // detecta el cambio de `currentRoute` y oculta el contenido al instante.
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

  const state: LayoutState = resolveLayoutState(currentRoute.state);
  const slots = currentRoute.slots ?? {};
  stateRef.current = state;

  const prevLayoutState: LayoutState | null = prevRoute
    ? resolveLayoutState(prevRoute.state)
    : null;

  const pageBg = selectPageBackground(state);

  useLayoutEffect(() => {
    const next = pageBg;
    if (!animateTransitions || reduceMotion) {
      pageBgFrom.value = next;
      pageBgTo.value = next;
      pageBgProgress.value = 1;
      pageBgTargetRef.current = next;
      return;
    }
    if (next === pageBgTargetRef.current) return;
    pageBgFrom.value = pageBgTargetRef.current;
    pageBgTo.value = next;
    pageBgTargetRef.current = next;
    pageBgProgress.value = 0;
    pageBgProgress.value = withTiming(1, { duration: LAYOUT_DURATION });
  }, [animateTransitions, pageBg, reduceMotion, pageBgFrom, pageBgTo, pageBgProgress]);

  const topVisible = !!state.sections.top?.visible;
  const midVisible = !!state.sections.mid?.visible;
  const bottomVisible = !!state.sections.bottom?.visible;
  const showTopDivisor = topVisible && (midVisible || bottomVisible);
  const showBottomDivisor = bottomVisible && (topVisible || midVisible);
  const showFullBottomDivisor = bottomVisible && !topVisible && !midVisible;

  const computeTargets = useCallback(
    (st: LayoutState): SectionHeights =>
      computeSectionTargets(st, naturalsRef.current, HRef.current),
    []
  );

  const applyTargets = useCallback((next: SectionHeights) => {
    const sanitized: SectionHeights = {
      top: _sanitize(next.top),
      mid: _sanitize(next.mid),
      bottom: _sanitize(next.bottom),
    };
    if (SECTION_KEYS.every((k) => appliedRef.current[k] === sanitized[k])) return;
    appliedRef.current = sanitized;
    layoutDebug("apply", { targets: sanitized });
    setLayoutHeights(sanitized);
  }, []);

  const clearProbe = useCallback((k: SectionKey) => {
    const timer = probeTimers.current[k];
    if (timer) {
      clearInterval(timer);
      probeTimers.current[k] = null;
    }
  }, []);

  const clearAllProbes = useCallback(() => {
    SECTION_KEYS.forEach((k) => clearProbe(k));
  }, [clearProbe]);

  const recordMeasurement = useCallback(
    (k: SectionKey, h: number, routeName: string) => {
      // Una medida que llega después de un cambio de ruta pertenece a contenido
      // que ya no está: se descarta para no contaminar el snapshot de la nueva.
      if (routeName !== currentRouteNameRef.current) return;
      if (!isValidMeasurement(h)) return;
      if (naturalsRef.current[k] === h) return;
      naturalsRef.current = { ...naturalsRef.current, [k]: h };
      writeNaturals(routeSnapshotRef.current, routeName, naturalsRef.current);
      layoutDebug("measure", {
        section: k,
        height: h,
        route: routeName,
        naturals: naturalsRef.current,
      });
      applyTargets(computeTargets(stateRef.current));
      if (
        k === "bottom" &&
        stateRef.current.pageScroll &&
        stateRef.current.sections.bottom?.visible
      ) {
        const overflows = bottomOverflows(stateRef.current, naturalsRef.current, HRef.current);
        setPageCanScroll(overflows);
        layoutDebug("pageScroll", { overflows });
        // Al pasar de body scrolleable (lista larga) a body que no desborda, se
        // ancla el scroll de página al tope.
        if (!overflows && bodyOverflowRef.current) {
          scrollRef.current?.scrollTo({ y: 0, animated: false });
        }
        bodyOverflowRef.current = overflows;
      }
    },
    [applyTargets, computeTargets]
  );

  const startProbe = useCallback(
    (k: SectionKey) => {
      clearProbe(k);
      const routeAtStart = currentRouteNameRef.current;
      const startedAt = Date.now();
      probeLast.current[k] = null;
      probeStable.current[k] = 0;
      probeTimers.current[k] = setInterval(() => {
        const view = proxyRefs.current[k];
        if (!view || currentRouteNameRef.current !== routeAtStart) {
          clearProbe(k);
          return;
        }
        view.measure((_x, _y, _w, h) => {
          if (currentRouteNameRef.current !== routeAtStart) {
            clearProbe(k);
            return;
          }
          if (!isValidMeasurement(h)) return;
          const last = probeLast.current[k];
          probeLast.current[k] = h;
          if (last === h) {
            probeStable.current[k] = (probeStable.current[k] ?? 0) + 1;
          } else {
            probeStable.current[k] = 0;
            recordMeasurement(k, h, routeAtStart);
          }
          if (
            (probeStable.current[k] ?? 0) >= PROBE_STABLE_HITS ||
            Date.now() - startedAt > PROBE_MAX_MS
          ) {
            clearProbe(k);
          }
        });
      }, PROBE_INTERVAL_MS);
    },
    [clearProbe, recordMeasurement]
  );

  const onProxyLayout = useCallback(
    (k: SectionKey) => (e: LayoutChangeEvent) => {
      const h = e.nativeEvent.layout.height;
      if (isValidMeasurement(h)) {
        recordMeasurement(k, h, currentRouteNameRef.current);
      }
      startProbe(k);
    },
    [recordMeasurement, startProbe]
  );

  useLayoutEffect(() => {
    // Reset de scroll SOLO al cambiar de ruta: la instancia del ScrollView se
    // reutiliza entre rutas, y sin esto la ruta nueva se pintaba en el offset de
    // la anterior (parpadeo con la página scrolleada). Dentro de la misma ruta
    // (categorías ↔ subcategorías, filtros) la posición se preserva.
    const reset = shouldResetScroll(currentRouteNameRef.current, currentRoute.name);
    if (reset) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      innerScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
    currentRouteNameRef.current = currentRoute.name;

    // Las relecturas pendientes pertenecen al contenido de la ruta anterior.
    clearAllProbes();

    // Sin vestigios de alturas entre pantallas: la ruta nueva se siembra SOLO
    // con su snapshot o con un neutro derivado de la ventana — nunca con los
    // naturales de la ruta previa.
    naturalsRef.current = seedNaturals(
      routeSnapshotRef.current,
      currentRoute.name,
      initialNaturals(HRef.current, state)
    );
    layoutDebug("seed", {
      route: currentRoute.name,
      lastRoute: prevRoute?.name ?? null,
      resetScroll: reset,
      naturals: naturalsRef.current,
    });
    bodyOverflowRef.current = false;

    const targets = computeTargets(state);
    applyTargets(targets);
    const overflows = !!state.pageScroll && bottomOverflows(state, naturalsRef.current, HRef.current);
    setPageCanScroll(overflows);
    layoutDebug("route", {
      route: currentRoute.name,
      state: currentRoute.state,
      targets,
      pageCanScroll: overflows,
    });

    if (revealEnabled && prevRoute) {
      startReveal();
    }

    // `prevRoute` no se pisa en el mismo commit: es la ruta saliente que
    // `renderSection` necesita para mantener su contenido montado mientras el
    // morph la contrae. Si se reemplaza acá, la sección desaparece en el
    // siguiente render y la transición queda a medias. Se libera recién al
    // terminar la ventana de animación.
    if (prevRouteTimer.current) clearTimeout(prevRouteTimer.current);
    if (!prevRoute) {
      setPrevRoute(currentRoute);
    } else {
      prevRouteTimer.current = setTimeout(() => {
        prevRouteTimer.current = null;
        setPrevRoute(currentRoute);
      }, reduceMotion ? 0 : LAYOUT_DURATION);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoute.name]);

  const renderSection = (k: SectionKey) => {
    const cur = state.sections[k];
    const prevB = prevLayoutState?.sections[k];
    const prevVisible = !!prevB?.visible;
    // La sección se mantiene montada mientras sale (prevVisible) para que el
    // morph de la transición no recorte su contenido de golpe.
    if (!cur?.visible && !prevVisible) return null;

    const usePrevContent = !cur?.visible && prevVisible;
    const behavior = usePrevContent ? prevB : cur;
    const slot = behavior?.slot;
    const content = slot
      ? usePrevContent
        ? prevRoute?.slots?.[slot]
        : slots[slot]
      : null;
    const isDynamic = behavior?.height === "content" || behavior?.height === "minFillRest";
    const scroll = behavior?.scroll ?? false;
    const height = layoutHeights[k];
    const bg = behavior?.backgroundColor ?? SECTION_DEFAULT_COLORS[k];

    // El proxy mide SOLO el contenido de la ruta actual. Medir el contenido
    // saliente (usePrevContent) escribiría el natural de la ruta anterior bajo
    // el nombre de la ruta nueva, contaminando el snapshot.
    const measureCurrent = isDynamic && !usePrevContent;

    const body = scroll ? (
      <ScrollView
        ref={innerScrollRef}
        style={styles.innerScroll}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    ) : (
      <View style={styles.sectionContent}>{content}</View>
    );

    return (
      <Animated.View
        key={k}
        layout={hasTransition && animateTransitions ? transition : undefined}
        collapsable={false}
        style={[
          styles.colBlock,
          { backgroundColor: bg, height },
        ]}
      >
        {measureCurrent && (
          <View
            ref={(r) => {
              proxyRefs.current[k] = r;
            }}
            pointerEvents="none"
            style={styles.measureOuter}
            onLayout={onProxyLayout(k)}
          >
            <View style={styles.measureCopy}>{content}</View>
          </View>
        )}
        {/* El recorte de la transición va en un wrapper interno: el proxy de
            medición queda FUERA de él, así `overflow:hidden` nunca "capa" la
            altura medida. */}
        <View style={[styles.sectionFill, hasTransition && animateTransitions && styles.clip]}>
          {revealEnabled ? (
            <View style={[styles.reveal, revealHidden && styles.revealHidden]}>
              <Animated.View style={[styles.reveal, revealStyle]}>{body}</Animated.View>
            </View>
          ) : (
            body
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <AppNavigationContext.Provider value={navigationValue}>
      <Animated.View style={[styles.root, pageBgStyle]}>
        <ScrollView
          ref={scrollRef}
          style={styles.pageScroll}
          contentContainerStyle={styles.pageContent}
          scrollEnabled={!!state.pageScroll && pageCanScroll}
          bounces={false}
          overScrollMode="never"
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
          {(showBottomDivisor || showFullBottomDivisor) && (
            <Animated.View
              layout={hasTransition && animateTransitions ? transition : undefined}
              collapsable={false}
            >
              <Divisor
                position="bottom"
                handle={currentRoute.state === "bottom" || showFullBottomDivisor}
                height={FULLBOTTOM_DIVISOR_H}
                style={showFullBottomDivisor ? undefined : { transform: [{ translateY: 5 }] }}
              />
            </Animated.View>
          )}
          {renderSection("bottom")}
        </ScrollView>
        {showBackButton && canGoBack && (
          <View style={styles.backBar} pointerEvents="box-none">
            <Button variant="secondary" size="sm" label="← Volver" onPress={back} />
          </View>
        )}
      </Animated.View>
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
  // El contenido visible llena la sección de alto fijo. El recorte de la
  // transición se agrega encima (styles.clip) solo cuando hay morph.
  sectionFill: {
    flex: 1,
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
  // Proxy de medición: absoluto, invisible y sin alto fijo. Mide la altura
  // intrínseca real del contenido sin que el alto de la sección lo restrinja.
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
