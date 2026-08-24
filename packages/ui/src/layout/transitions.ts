import type { SheetKind } from "./types";

/**
 * Dirección de entrada/salida de una capa durante una transición.
 * Es la pieza extensible del sistema: agregar un nuevo SheetKind solo
 * requiere registrar su dirección en ENTER_DIR / EXIT_DIR.
 */
export type LayerDirection =
  | "fromTop"
  | "fromBottom"
  | "fade"
  | "toTop"
  | "toBottom"
  | "stay";

export interface TransitionSpec {
  /** De dónde entra la capa nueva. */
  enter: LayerDirection;
  /** Hacia dónde sale la capa vieja. */
  exit: LayerDirection;
  /** true cuando from===to: no se translada la capa, se hace cross-fade de contenido. */
  crossFadeContent: boolean;
}

const ENTER_DIR: Record<SheetKind, LayerDirection> = {
  topSheet: "fromTop",
  bottomSheet: "fromBottom",
  fullHeader: "fade",
  fullBody: "fade",
};

const EXIT_DIR: Record<SheetKind, LayerDirection> = {
  topSheet: "toTop",
  bottomSheet: "toBottom",
  fullHeader: "fade",
  fullBody: "fade",
};

export function resolveTransition(from: SheetKind, to: SheetKind): TransitionSpec {
  if (from === to) {
    return { enter: "stay", exit: "stay", crossFadeContent: true };
  }
  return {
    enter: ENTER_DIR[to],
    exit: EXIT_DIR[from],
    crossFadeContent: false,
  };
}

/** Signo del desplazamiento vertical para una dirección de translate. */
export function directionSign(dir: LayerDirection): number {
  if (dir === "fromTop" || dir === "toTop") return -1;
  if (dir === "fromBottom" || dir === "toBottom") return 1;
  return 0;
}
