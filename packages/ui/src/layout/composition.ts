import type { SheetKind } from "./types";

/**
 * Cada "kind" de ruta se resuelve en una composición de capas (hosts):
 *   - host: qué capa porta el contenido de la ruta (base / top / bottom)
 *   - baseColor: color del fondo persistente ("header" | "body")
 *
 * Es la pieza extensible: para agregar un nuevo SheetKind solo se añade
 * un caso acá. El SheetLayout mantiene SIEMPRE las 3 capas montadas y solo
 * anima cuál está visible y el color del fondo.
 */
export type HostKey = "base" | "top" | "bottom";
export type BaseColorKey = "header" | "body";

export interface Composition {
  host: HostKey;
  baseColor: BaseColorKey;
}

export function resolveComposition(kind: SheetKind): Composition {
  switch (kind) {
    case "fullHeader":
      return { host: "base", baseColor: "header" };
    case "fullBody":
      return { host: "bottom", baseColor: "body" };
    case "topSheet":
      return { host: "top", baseColor: "header" };
    case "bottomSheet":
      return { host: "bottom", baseColor: "header" };
  }
}

/** Dirección de entrada/salida de cada host al animar su visibilidad. */
export function hostDirection(side: HostKey): "fromTop" | "fromBottom" | "fade" {
  if (side === "top") return "fromTop";
  if (side === "bottom") return "fromBottom";
  return "fade";
}
