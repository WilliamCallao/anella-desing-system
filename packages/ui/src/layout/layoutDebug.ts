/**
 * Instrumentación del motor de layout (`AppLayout`).
 *
 * Objetivo: poder ver, paso a paso, CÓMO se calcula cada pantalla —qué se mide,
 * cuánto, con qué naturales, qué targets se derivan y qué se aplica— sin tener
 * que adivinar. No cambia el comportamiento: solo observa.
 *
 * Dos formas de activarla:
 *  1. Variable de entorno `EXPO_PUBLIC_LAYOUT_DEBUG=1` (Metro la inyecta en el
 *     bundle; requiere reiniciar el dev server tras definirla).
 *  2. En runtime, desde la consola del dev server / debugger:
 *     `__ANTONELLA_LAYOUT_DEBUG__(true)`.
 *
 * El buffer de eventos (últimos 400) SIEMPRE se llena, esté o no activado el log
 * a consola. Para volcarlo:
 *   `__ANTONELLA_LAYOUT_DUMP__()`   → imprime el buffer y lo devuelve.
 *   `__ANTONELLA_LAYOUT_LOG__`      → el array crudo.
 */

export type LayoutDebugEvent = {
  t: number;
  event: string;
  data?: Record<string, unknown>;
};

const RING_MAX = 400;

type DebugGlobal = {
  __ANTONELLA_LAYOUT_LOG__?: LayoutDebugEvent[];
  __ANTONELLA_LAYOUT_DEBUG__?: (on: boolean) => void;
  __ANTONELLA_LAYOUT_DUMP__?: () => LayoutDebugEvent[];
};

function g(): DebugGlobal {
  return globalThis as unknown as DebugGlobal;
}

function ring(): LayoutDebugEvent[] {
  const global = g();
  global.__ANTONELLA_LAYOUT_LOG__ ??= [];
  return global.__ANTONELLA_LAYOUT_LOG__;
}

const envFlag =
  typeof process !== "undefined" && process.env
    ? String(process.env.EXPO_PUBLIC_LAYOUT_DEBUG ?? "").toLowerCase()
    : "";

let forced = envFlag === "1" || envFlag === "true";

/** Activa/desactiva el log a consola en runtime. */
export function setLayoutDebug(on: boolean): void {
  forced = on;
  if (on) {
    // eslint-disable-next-line no-console
    console.log("[APPLAYOUT] debug ON");
  }
}

export function isLayoutDebug(): boolean {
  return forced;
}

/** Registra un evento de layout (siempre en el buffer; a consola si está activo). */
export function layoutDebug(event: string, data?: Record<string, unknown>): void {
  const entry: LayoutDebugEvent = { t: Date.now(), event, data };
  const buffer = ring();
  buffer.push(entry);
  if (buffer.length > RING_MAX) {
    buffer.splice(0, buffer.length - RING_MAX);
  }
  if (forced) {
    // eslint-disable-next-line no-console
    console.log(`[APPLAYOUT ${event}]`, data ? JSON.stringify(data) : "");
  }
}

if (typeof globalThis !== "undefined") {
  const global = g();
  global.__ANTONELLA_LAYOUT_DEBUG__ = setLayoutDebug;
  global.__ANTONELLA_LAYOUT_DUMP__ = () => {
    const buffer = ring().slice();
    // eslint-disable-next-line no-console
    console.log(`[APPLAYOUT] ${buffer.length} eventos`);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(buffer, null, 2));
    return buffer;
  };
}
