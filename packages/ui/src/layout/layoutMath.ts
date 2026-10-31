import type { ReactNode } from "react";
import { resolveSemantic, lightSemantic } from "@william-callao/antonella-theme";

/**
 * Matemática pura del motor de layout (`AppLayout`).
 *
 * Este módulo NO importa `react-native` ni toca el ciclo de vida de React: solo
 * derivaciones deterministas sobre el estado, las alturas naturales medidas y el
 * alto de ventana. Vive aparte para poder testearse en node (vitest) y para que
 * la lógica del motor deje de ser una caja negra embebida en el componente.
 *
 * Reglas del modelo (ver `APPLAYOUT.md`):
 *  - Las secciones son dinámicas (`content`/`minFillRest`) o estáticas
 *    (`fill`/`fillRest`/`third`/px). Solo las dinámicas se miden.
 *  - El alto de una sección derivada nunca inventa colas ni overscans: la
 *    cobertura del fondo se resuelve pintando el fondo del page con el color del
 *    cuerpo/mid (`selectPageBackground`).
 *  - El scroll se resetea al tope SOLO cuando cambia el nombre de ruta; los
 *    cambios de contenido dentro de la misma ruta preservan la posición.
 */

export type SectionKey = "top" | "mid" | "bottom";
export type HeightSpec = "content" | "fill" | "fillRest" | "minFillRest" | "third" | number;
export type SlotName = "header" | "body" | "footer";

export type SectionBehavior = {
  /** Si la sección se renderiza. Default true. */
  visible?: boolean;
  /** Cómo se determina su alto. `content`/`minFillRest` son dinámicas (se miden). Default "content". */
  height?: HeightSpec;
  /** La sección scrollea internamente (ScrollView propio). */
  scroll?: boolean;
  /** Se mantiene fija (no participa del scroll de página). */
  sticky?: boolean;
  /** Se desvanece al hacer scroll de página (requiere pageScroll). */
  fadeOnScroll?: boolean;
  /** A qué slot de contenido está asociada (header/body/footer). */
  slot?: SlotName;
  /** Para height "fillRest"/"minFillRest": de qué sección (su alto natural) se descuenta H. */
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

export const SECTION_KEYS: SectionKey[] = ["top", "mid", "bottom"];

export type SectionHeights = Record<SectionKey, number>;

/** Naturales por ruta, para repintar una ruta ya vista con su alto correcto. */
export type NaturalsSnapshot = Map<string, SectionHeights>;

const _semantic = resolveSemantic(lightSemantic);
const DEFAULT_BG = _semantic.default.bg.default;
const DARK_BG = _semantic.darkness.bg.default;

/** Colores por defecto de cada sección (los usa `selectPageBackground`). */
export const SECTION_DEFAULT_COLORS: Record<SectionKey, string> = {
  top: DARK_BG,
  mid: DEFAULT_BG,
  bottom: DARK_BG,
};

export const DEFAULT_PAGE_BG = DEFAULT_BG;

/** Alto del divisor del patrón full-bottom (top y mid ocultos). */
export const FULLBOTTOM_DIVISOR_H = 25;

/**
 * Presets = las 5 variantes del motor, reutilizables por nombre.
 *
 * Nota: `bottom` ya NO estira la hoja con una cola artificial (`BODY_TAIL`).
 * La costura bajo la hoja la cubre `selectPageBackground` (fondo del page =
 * color de la última sección visible), no el alto de la sección.
 */
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
    // Hoja inmersiva: el bottom llena el viewport como mínimo y crece con el
    // contenido. Antes era `content`: si el detalle era corto, la mitad inferior
    // quedaba a merced del color del page y asomaba el lienzo claro durante el
    // morph. `minFillRest` sin ancla usa H como piso y conserva el pageScroll
    // para que un detalle largo siga siendo navegable sin un ScrollView anidado.
    pageScroll: true,
    sections: {
      top: { visible: false },
      mid: { visible: false },
      bottom: {
        visible: true,
        height: "minFillRest",
        slot: "footer",
        backgroundColor: DARK_BG,
      },
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

export type SectionColors = Record<SectionKey, string>;

/** Resuelve un estado por nombre a su preset (o devuelve el estado custom tal cual). */
export function resolveLayoutState(
  state: LayoutState | LayoutStateName,
  presets: Record<LayoutStateName, LayoutState> = layoutStates,
): LayoutState {
  return typeof state === "string" ? presets[state] : state;
}

/** Una altura natural medida es válida si es finita y positiva. */
export function isValidMeasurement(height: number): boolean {
  return Number.isFinite(height) && height > 0;
}

/**
 * Alturas naturales iniciales (antes de medir), a partir del alto de ventana.
 *
 * `fullBottom` arranca con el bottom a pantalla completa: es una hoja inmersiva
 * y sembrarlo con H/3 hacía que la primera transición la encogiera y volviera a
 * crecer al medir. El resto de los estados conserva el neutro de un tercio.
 */
export function initialNaturals(H: number, state?: LayoutState): SectionHeights {
  const out = { top: H / 3, mid: H / 3, bottom: H / 3 };
  if (
    state &&
    !state.sections.top?.visible &&
    !state.sections.mid?.visible &&
    state.sections.bottom?.visible
  ) {
    out.bottom = H;
  }
  return out;
}

/**
 * Alto del viewport que ve el contenido de la sección `bottom`: lo que queda de
 * pantalla por debajo de la sección sobre la que se apoya (`restsOn`). Es el
 * umbral para decidir si la hoja desborda el área visible (y por tanto si el
 * page debe poder scrollear).
 */
export function bottomViewport(state: LayoutState, naturals: SectionHeights, H: number): number {
  const anchor = state.sections.bottom?.restsOn;
  if (!anchor) return H;
  const rest = H - naturals[anchor];
  return rest > 0 ? rest : H;
}

/** ¿El contenido de `bottom` excede el viewport visible → el page debe scrollear? */
export function bottomOverflows(state: LayoutState, naturals: SectionHeights, H: number): boolean {
  const b = state.sections.bottom;
  if (!b?.visible) return false;
  return naturals.bottom > bottomViewport(state, naturals, H);
}

/**
 * Deriva el alto commiteado de cada sección a partir de las alturas naturales
 * medidas y el alto de ventana. No agrega cobertura artificial: si el bottom es
 * la última sección visible y su contenido es corto, la sección queda corta y el
 * fondo del page (color de la última visible) cubre el resto.
 */
export function computeSectionTargets(
  state: LayoutState,
  naturals: SectionHeights,
  H: number,
): SectionHeights {
  const out: SectionHeights = { top: 0, mid: 0, bottom: 0 };
  for (const k of SECTION_KEYS) {
    const b = state.sections[k];
    if (!b?.visible) {
      out[k] = 0;
      continue;
    }
    const h = b.height ?? "content";
    if (h === "content") out[k] = naturals[k];
    else if (h === "third") out[k] = H / 3;
    else if (h === "fill") out[k] = H;
    else if (h === "fillRest") out[k] = b.restsOn ? H - naturals[b.restsOn] : 0;
    else if (h === "minFillRest") {
      // Sin ancla, el piso es la ventana completa. Lo usa fullBottom para
      // cubrir la pantalla aunque el detalle sea corto.
      const rest = b.restsOn ? H - naturals[b.restsOn] : H;
      out[k] = Math.max(naturals[k], rest);
    } else out[k] = h;
  }
  // Patrón full-bottom: el divisor superior ocupa su lugar en el flujo, así que
  // la hoja (fill H) se contrae por ese alto para que el contenido total no
  // exceda la ventana (si no, el pie del detalle quedaría recortado sin scroll).
  const fullBottom = !state.sections.top?.visible && !state.sections.mid?.visible;
  if (fullBottom && state.sections.bottom?.visible) {
    out.bottom = Math.max(0, out.bottom - FULLBOTTOM_DIVISOR_H);
  }
  return out;
}

/**
 * Color del fondo del page (el lienzo detrás de las secciones, visible en los
 * huecos que abren/cierran las transiciones).
 *
 * Regla: si el `mid` (el cuerpo/header, típicamente CLARO) está visible, su
 * color manda — así el fondo que se asoma durante los morphs es el claro del
 * header y no aparece un "corte" oscuro. Solo cuando no hay `mid` (patrón
 * full-bottom: todo hoja oscura) se usa el color de la última sección visible.
 */
export function selectPageBackground(
  state: LayoutState,
  colors: SectionColors = SECTION_DEFAULT_COLORS,
): string {
  const mid = state.sections.mid;
  if (mid?.visible) {
    return mid.backgroundColor ?? colors.mid;
  }
  for (let i = SECTION_KEYS.length - 1; i >= 0; i--) {
    const k = SECTION_KEYS[i];
    if (state.sections[k]?.visible) {
      return state.sections[k]?.backgroundColor ?? colors[k];
    }
  }
  return DEFAULT_PAGE_BG;
}

/**
 * Ventana del morph al entrar a `fullBottom` desde un layout con `mid` visible.
 *
 * Si el usuario scrolleó la página, parte del header ya no está en pantalla:
 * animar los 300 ms completos lo hace reaparecer y volver a colapsar. La
 * duración se acorta en proporción a la parte visible; si el header ya salió
 * por arriba, no hay morph (0).
 */
export function fullBottomTransitionDuration(
  prevState: LayoutState | null,
  currentState: LayoutState,
  headerHeight: number,
  scrollY: number,
  baseDuration: number,
): number {
  if (!prevState) return baseDuration;
  const entersFullBottom =
    !!prevState.sections.mid?.visible &&
    !currentState.sections.mid?.visible &&
    !currentState.sections.top?.visible &&
    !!currentState.sections.bottom?.visible;
  if (!entersFullBottom) return baseDuration;
  if (headerHeight <= 0) return 0;
  const scrolled = Number.isFinite(scrollY) ? Math.max(0, scrollY) : 0;
  const visibleHeader = Math.max(0, Math.min(headerHeight, headerHeight - scrolled));
  return Math.round(baseDuration * (visibleHeader / headerHeight));
}

/**
 * El scroll de página (e interno) se resetea al tope SOLO cuando cambia el
 * nombre de ruta. Los cambios de contenido dentro de la misma ruta (categorías
 * → subcategorías, filtros de búsqueda) preservan la posición.
 */
export function shouldResetScroll(prevRouteName: string | null, nextRouteName: string): boolean {
  return prevRouteName !== nextRouteName;
}

/**
 * Siembra los naturales para una ruta: su snapshot si ya fue visitada (repinta
 * en el primer frame con su alto correcto), o un `neutral` derivado de la
 * ventana (ver `initialNaturals`).
 *
 * IMPORTANTE: `neutral` NUNCA deben ser los naturales de otra pantalla. Heredar
 * el alto de la ruta previa es un "vestigio" entre pantallas: al volver a una
 * ruta con header chico pero habiendo estado en una con header grande, el motor
 * quedaba convencido de que seguía en la grande. La ruta nueva se siembra SOLO
 * con su propio snapshot o con el neutro; el proxy la re-mide enseguida.
 */
export function seedNaturals(
  snapshot: NaturalsSnapshot,
  routeName: string,
  neutral: SectionHeights,
): SectionHeights {
  const snap = snapshot.get(routeName);
  return snap ? { ...snap } : { ...neutral };
}

/** Guarda los naturales actuales como snapshot de la ruta (para futuros regresos). */
export function writeNaturals(
  snapshot: NaturalsSnapshot,
  routeName: string,
  naturals: SectionHeights,
): void {
  snapshot.set(routeName, { ...naturals });
}
