/** Un bump de versión de la campana para un dominio syncable. */
export interface BellBump {
  domain: string;
  version: number;
}

/** Ventana de coalescing por dominio al escuchar la campana (RTDB, adaptador del consumidor). */
export const BELL_DEBOUNCE_MS = 1000;

/**
 * Decisión de qué `next` requiere un pull: solo versiones estrictamente
 * mayores que la última vista (misma versión o regresiva → no hay nada nuevo).
 */
export function bellShouldPull(prev: number, next: number): boolean {
  return next > prev;
}

/**
 * Puerta de versiones por dominio en memoria: rechaza bumps repetidos o
 * regresivos dentro de una suscripción. Cada llamada a `seen` actualiza el
 * máximo conocido del dominio; el primer valor de un dominio siempre es nuevo.
 */
export class BellGate {
  private readonly seenVersions = new Map<string, number>();

  seen(domain: string, version: number): boolean {
    const prev = this.seenVersions.get(domain) ?? -Infinity;
    if (version > prev) {
      this.seenVersions.set(domain, version);
      return true;
    }
    return false;
  }
}

/** Agenda/ejecuta un timer y devuelve su cancelación (fakeable en tests). */
export type TimerFn = (cb: () => void, ms: number) => () => void;

function defaultTimer(cb: () => void, ms: number): () => void {
  const handle = setTimeout(cb, ms);
  return () => clearTimeout(handle);
}

/**
 * Coalescing por dominio de la campana: un timer por dominio; si dentro de la
 * ventana (`delayMs`) llega otra versión, se acumula la MAYOR y al vencer se
 * emite `{ domain, version }` una sola vez. `dispose` cancela todos los timers
 * pendientes sin emitir. Puro: el timer se inyecta (`TimerFn`) para testearlo
 * sin timers reales.
 */
export class BellDebouncer {
  private readonly timers = new Map<string, { cancel: () => void; version: number }>();

  constructor(
    private readonly emit: (b: BellBump) => void,
    private readonly delayMs: number = BELL_DEBOUNCE_MS,
    private readonly setTimer: TimerFn = defaultTimer
  ) {}

  push(domain: string, version: number): void {
    const existing = this.timers.get(domain);
    if (existing) {
      existing.version = Math.max(existing.version, version);
      return;
    }
    const cancel = this.setTimer(() => {
      const current = this.timers.get(domain);
      if (!current) return;
      this.timers.delete(domain);
      this.emit({ domain, version: current.version });
    }, this.delayMs);
    this.timers.set(domain, { cancel, version });
  }

  dispose(): void {
    for (const { cancel } of this.timers.values()) cancel();
    this.timers.clear();
  }
}

/**
 * Aplana el `val()` del nodo padre `/erp/sync/v1/{tenant}` en bumps válidos.
 * El snapshot es `{ [domain]: { version, wrote_at }, ... }`; se conservan solo
 * los hijos con `version` numérica finita > 0. Cualquier otra forma (null,
 * arrays, nodos sin versión) se ignora devolviendo [].
 */
export function parseBellSnapshot(val: unknown): BellBump[] {
  if (typeof val !== "object" || val === null || Array.isArray(val)) return [];
  const bumps: BellBump[] = [];
  for (const [domain, node] of Object.entries(val as Record<string, unknown>)) {
    if (typeof node !== "object" || node === null || Array.isArray(node)) continue;
    const version = (node as { version?: unknown }).version;
    if (typeof version !== "number" || !Number.isFinite(version) || version <= 0) continue;
    bumps.push({ domain, version });
  }
  return bumps;
}