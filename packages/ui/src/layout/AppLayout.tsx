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
export type HeightSpec = "content" | "fill" | "fillRest" | "minFillRest" | "third" | number;
export type SlotName = "header" | "body" | "footer";

export type SectionBehavior = {
  /** Si la sección se renderiza. Default true. */
  visible?: boolean;
  /** Cómo se determina su alto: contenido medido, llenar (H), rellenar resto, al menos rellenar el resto creciendo con el contenido, un tercio, o px fijos. Default "content". */
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
        height: "minFillRest",
        restsOn: "mid",
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
// (que es lo que producía texto sin repintar en Fabric). El morph interpolado
// de altura no deja franja clara abajo porque las alturas se commitean directo
// al target desde el primer commit (max(actual, target) en renderSection): con
// mid y bottom animando en sincronía, box_bottom = mid + h >= H en todo el
// tramo, así la hoja oscura nunca descubre el fondo claro del page.
const LAYOUT_DURATION = 300;
const REVEAL_DELAY_MS = 380;
const REVEAL_DURATION_MS = 200;

// Ventana posterior a un cambio de ruta durante la cual la medición de una
// sección se protege del artefacto del doble-montaje (ver makeOnMeasure). Solo
// en esa ventana se descarta una medida que caiga por debajo de la mitad del
// último alto aceptado; fuera de ella las medidas se commitean libres, porque
// un colapso legítimo y de un solo salto (p. ej. el header de catálogo que pasa
// de expandido ~264 a solo barra ~110 al entrar en una categoría) no debe
// rechazarse como si fuera un artefacto de remount.
const REMOUNT_WINDOW_MS = 500;

// Cola de cobertura del body: cuando el bottom es la última sección visible y
// su contenido no llena la pantalla, su alto no se limita a H sino que se estira
// BODY_TAIL px por debajo del borde inferior. La hoja oscura "rebalsa" la
// pantalla (queda fuera de vista, la página no la puede scrollear) y así el
// borde inferior de la hoja nunca coincide con el borde del viewport, por lo
// que no puede filtrarse el fondo claro bajo la hoja en ningún reflow/scroll.
const BODY_TAIL = 600;

// Alto del divisor superior que se muestra en el patrón full-bottom. Es 25
// (igual al divisor bottom del preset) y se resta del alto de la hoja (fill H)
// para que el contenido total (divisor + hoja) quede en exactamente una
// pantalla y no se recorte el pie del detalle.
const FULLBOTTOM_DIVISOR_H = 25;

// Sobresalir del cap fuera de su caja para que la superficie oscura continúe
// sin costuras: FULLBOTTOM_OVERSCAN px por encima del tope de pantalla (el
// ScrollView recorta el excedente, así el borde visible corta por el medio de
// la superficie y no aparece una línea de subpixel sobre el fondo claro) y
// FULLBOTTOM_EXTEND px por debajo, sobre el tope de la hoja (cubre cualquier
// resto de costura entre cap y hoja).
const FULLBOTTOM_OVERSCAN = 5;
const FULLBOTTOM_EXTEND = 5;

// Colchón inferior del patrón full-bottom: pinta la hoja N px por debajo del
// borde de pantalla (recortado por el viewport) para que el borde visible
// corte por el medio de la superficie oscura y no asome una línea de subpixel
// en el borde inferior. Es absoluto, no aporta al flujo ni agrega scroll.
const FULLBOTTOM_CUSHION = 5;

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
  // Patrón full-bottom (p. ej. producto-detalle): la hoja ocupa toda la pantalla
  // (top y mid ocultos). Sin divisor, su borde superior queda "recto" pegado al
  // borde del viewport. Se agrega el divisor de esquinas superiores redondeadas
  // arriba, que queda como overflow permanente (la hoja "rebalsa" el tope) para
  // que la transición y el reposo no se vean rectos.
  const showFullBottomDivisor = bottomVisible && !topVisible && !midVisible;

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
  const stateRef = useRef(state);
  stateRef.current = state;
  const bodyOverflowRef = useRef(false);
  // Overflow del footer medido como estado (no ref): el gate de scrollEnabled
  // depende de `naturals.bottom > viewport`, y ese valor puede cambiar (p. ej.
  // datos que llegan tras el estado de carga) sin que cambien los altos
  // commiteados — durante la ventana de remount `_withBottomHold` los sostiene y
  // applyTargets devuelve el mismo layout, por lo que no había re-render y el
  // scroll quedaba desactivado hasta una remontada posterior (ir a subcategoría
  // y volver). Setear el flag acá fuerza la re-render con el estado correcto.
  const [pageCanScroll, setPageCanScroll] = useState(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const innerScrollRef = useRef<ScrollView>(null);
  // TEMPORAL (diagnóstico): refs para medir posición absoluta en ventana.
  const rootViewRef = useRef<View>(null);
  const capHolderRef = useRef<View>(null);

  // Alto natural (medido) de cada sección. Se mantienen en refs simples (los
  // cambios no re-renderizan; se leen vía `naturalsRef` en cada render).
  const naturalsRef = useRef<Record<SectionKey, number>>({
    top: H / 3,
    mid: H / 3,
    bottom: H / 3,
  });
  const lastMeasured = useRef<Record<SectionKey, number>>({ top: 0, mid: 0, bottom: 0 });
  const routeChangedAt = useRef(0);

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
      else if (h === "minFillRest") {
        const rest = b.restsOn ? H - naturalsRef.current[b.restsOn] : 0;
        base[k] = Math.max(naturalsRef.current[k], rest);
      } else base[k] = h;
    }
    return base;
  };

  // Alto del viewport que ve el contenido del bottom: lo que queda de pantalla
  // por debajo de la sección sobre la que se apoya (p. ej. el header con el
  // preset "bottom"). Es el umbral correcto para decidir si la hoja desborda el
  // área visible: antes se comparaba contra H completo, lo que dejaba una zona
  // muerta (contenido entre "H - header" y H) donde el contenido excedía la
  // vista pero el scroll seguía desactivado ("no scrollea por más que exceda").
  const bottomViewport = (): number => {
    const b = stateRef.current.sections.bottom;
    if (!b?.restsOn) return H;
    const rest = H - naturalsRef.current[b.restsOn];
    return rest > 0 ? rest : H;
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
    // Piso de cobertura del body (anti-parpadeo): cuando el bottom es la última
    // sección visible, su alto nunca baja del alto de PANTALLA completo. La
    // hoja oscura cubre el viewport por sí sola, de modo que ningún cambio de
    // tamaño dentro de la misma ruta (subcategoría → categorías) deja asomar el
    // fondo claro bajo la hoja durante el reflow/medición.
    if (stateRef.current.sections.bottom?.visible) {
      const spec = stateRef.current.sections.bottom?.height;
      const isCover = spec === "content" || spec === "minFillRest";
      const natural = naturalsRef.current.bottom;
      const floor = Math.max(next.bottom, H);
      // Cuando el contenido NO llena la pantalla, se estira la hoja con la cola
      // (queda anclada, fuera de vista). Cuando SÍ llena la pantalla y scrollea,
      // la hoja termina con el contenido: agregar la cola ahí la volvería
      // scrolleable (offset extra de página), el "scroll en oscuro" que se
      // evita. Para altura fija ("fill"/"third") queda exacto.
      next = { ...next, bottom: isCover && natural <= bottomViewport() ? floor + BODY_TAIL : floor };
      // Patrón full-bottom (top y mid ocultos, hoja a pantalla completa): el
      // divisor superior ocupa su lugar en el flujo, así que la hoja (fill H) se
      // contrae por ese alto para que el contenido total no exceda la ventana
      // (si no, el pie del detalle quedaría recortado sin scroll).
      const fullBottom =
        !stateRef.current.sections.top?.visible &&
        !stateRef.current.sections.mid?.visible;
      if (fullBottom) {
        next = {
          ...next,
          bottom: Math.max(0, next.bottom - (FULLBOTTOM_DIVISOR_H - FULLBOTTOM_OVERSCAN)),
        };
      }
    }
    setLayoutHeights((prev) => {
      const changed = !SECTION_KEYS.every((k) => prev[k] === next[k]);
      return changed ? next : prev;
    });
  }, [H]);

  const makeOnMeasure = (k: SectionKey) => (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    const prev = lastMeasured.current[k];
    if (!Number.isFinite(h) || h <= 0) return;
    // Solo se descarta una medida "colapsada" dentro de la ventana posterior a
    // un cambio de ruta: es el artefacto del doble-montaje del slot al volver a
    // una ruta (p. ej. desde producto-detalle), donde un árbol con "flex:1"
    // recién remontado puede medir solo su padding (~32px) en vez del alto real
    // (~290px). Commitear ese valor colapsaba la sección ("items comprimidos").
    // Se usa Math.max (no min): con min el umbral quedaba capado en 100px para
    // secciones altas, y una remedición parcial (~300px de un prev de ~800px)
    // pasaba el filtro y commiteaba el alto corto ("contenido aplastado").
    // Fuera de la ventana (o para la primera medida) no hay guard: un colapso
    // real de un solo salto (header de catálogo 264→110 al entrar en categoría)
    // debe commitease, o la sección se quedaba con un hueco muerto.
    const inRemountWindow = Date.now() - routeChangedAt.current < REMOUNT_WINDOW_MS;
    const collapsed =
      inRemountWindow && prev > 0 && h < Math.max(prev * 0.5, 100);
    if (collapsed) return;
    naturalsRef.current[k] = h;
    lastMeasured.current[k] = h;
    // Al pasar de body scrolleable (lista larga, página scrolleada) a body que
    // no desborda la pantalla (panel corto), se ancla el scroll de página al
    // tope. Se compara contra el flujo de overflow previo (no contra el alto
    // commiteado, que ahora incluye la cola de cobertura y siempre lo supera)
    // para no resetear la posición en remediciones dentro de la lista larga.
    if (
      k === "bottom" &&
      state.pageScroll &&
      stateRef.current.sections.bottom?.visible
    ) {
      const overflows = naturalsRef.current.bottom > bottomViewport();
      setPageCanScroll(overflows);
      if (!overflows && bodyOverflowRef.current) {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      }
      bodyOverflowRef.current = overflows;
    }
    const targets = computeTargets(state);
    // El hold del bottom protege solo la ventana de remount de un cambio de
    // ruta (mediciones transitorias del doble-montaje mientras el morph corre).
    // Un cambio de contenido DENTRO de la misma ruta (p. ej. categorías→
    // subcategorías, lista alta → vista corta) dispara mediciones que deben
    // aplicar el alto directo; si no, el bottom quedaba pinzado en el alto
    // previo y la vista corta scrolleaba en oscuro.
    applyTargets(
      animateTransitions && prevRoute !== null && !reduceMotion && inRemountWindow
        ? _withBottomHold(targets, layoutHeightsRef.current)
        : targets
    );
  };

  useLayoutEffect(() => {
    if (!state.pageScroll) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      innerScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
    setPageCanScroll(
      !!state.pageScroll && naturalsRef.current.bottom > bottomViewport()
    );
    routeChangedAt.current = Date.now();
    const targets = computeTargets(state);
    const animated = animateTransitions && prevRoute !== null && !reduceMotion;
    const applied = animated ? _withBottomHold(targets, layoutHeightsRef.current) : targets;
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    if (applied !== targets) {
      settleTimer.current = setTimeout(() => {
        settleTimer.current = null;
        applyTargets(targets);
      }, LAYOUT_DURATION);
    }
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
    const isDynamic = ["content", "minFillRest"].includes(
      (cur?.height ?? prevB?.height) as string
    );
    // Secciones dinámicas (content/minFillRest) se miden a sí mismas: su
    // contenido debe montarse contra el alto FINAL (target), no contra el alto
    // de la ruta anterior. Si monta contra un alto transitorio más chico — al
    // volver de producto-detalle el bottom arranca en 812 y recién después va a
    // 2203 — el árbol flex:1 del contenido se encoge a ~0 por flexShrink y NO se
    // recupera cuando la sección crece (subcategorías "aplastadas": body root
    // 2163→40, filas 66→24). Renderizar con max(actual, target) monta el
    // contenido a su altura real y mide bien.
    const target = computeTargets(state);
    const height = isDynamic ? Math.max(layoutHeights[k], target[k]) : layoutHeights[k];
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
        layout={hasTransition && animateTransitions ? transition : undefined}
        collapsable={false}
        style={[
          styles.colBlock,
          { backgroundColor: bg, height },
          hasTransition && animateTransitions && styles.clip,
        ]}
      >
        {k === "bottom" && showFullBottomDivisor && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -FULLBOTTOM_CUSHION,
              height: FULLBOTTOM_CUSHION,
              backgroundColor: bg,
            }}
          />
        )}
        {inner}
      </Animated.View>
    );
  };

  return (
    <AppNavigationContext.Provider value={navigationValue}>
      <View
        ref={rootViewRef}
        style={[styles.root, { backgroundColor: pageBg }]}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.pageScroll}
          contentContainerStyle={[styles.pageContent, { backgroundColor: pageBg }]}
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
              <View ref={capHolderRef} collapsable={false}>
                <Divisor
                  position="bottom"
                  handle={currentRoute.state === "bottom" || showFullBottomDivisor}
                  height={FULLBOTTOM_DIVISOR_H}
                  extend={showFullBottomDivisor ? FULLBOTTOM_EXTEND : 0}
                  style={
                    // El traslado de 5px es para ubicar el borde bajo el mid
                    // (header). En full-bottom no hay header: el cap sobresale
                    // FULLBOTTOM_OVERSCAN px por encima del tope (recortado por
                    // el ScrollView) y FULLBOTTOM_EXTEND px sobre la hoja; la
                    // hoja se contrae en (FULLBOTTOM_DIVISOR_H - OVERSCAN) para
                    // que divisor + hoja sigan sumando exactamente una pantalla.
                    showFullBottomDivisor
                      ? { marginTop: -FULLBOTTOM_OVERSCAN }
                      : { transform: [{ translateY: 5 }] }
                  }
                />
              </View>
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