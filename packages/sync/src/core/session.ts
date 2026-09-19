/** Subconjunto del AuthStatus del consumidor que le importa a la sesión de sync. */
export type AuthStatusLike = "unknown" | "signedIn" | "signedOut";

/** La sesión de sync solo se abre con la sesión de auth activa. */
export function shouldOpenSync(authStatus: AuthStatusLike): boolean {
  return authStatus === "signedIn";
}

/**
 * Decide si hay que (re)abrir una sesión de sync:
 * - sin tenant activo → nada
 * - mismo tenant que ya tiene sesión viva → nada (no re-bootstrap)
 * - tenant distinto (o primera vez) → abrir sesión para ese tenant
 */
export function resolveSessionTenant(prevSessionTenant: string | null, activeTenant: string): string | null {
  if (!activeTenant) return null;
  if (activeTenant === prevSessionTenant) return null;
  return activeTenant;
}

/**
 * Máximo de reintentos CONSECUTIVOS de apertura que el poll de respaldo hace
 * antes de rendirse (con backoff exponencial entre medio). Solo una señal de
 * contexto (signIn o cambio de tenant) revive el reintento.
 */
export const MAX_OPEN_RETRIES = 5;

/** Estado del reintento de apertura que el runtime mantiene entre polls. */
export interface OpenRetryState {
  /** Fallos consecutivos de apertura (0 = sin fallo previo). */
  failures: number;
  /** Ticks de poll acumulados desde el último fallo/reintento. */
  tick: number;
}

/**
 * Decide si el poll de respaldo debe reintentar HOY abrir la sesión.
 * Backoff exponencial: tras `failures` fallos se esperan `2^(failures-1)`
 * ciclos de poll (1,2,4,8,16…). El tope es `MAX_OPEN_RETRIES` reintentos
 * CONSECUTIVOS: con `failures > MAX_OPEN_RETRIES` (el 6º fallo seguido) se
 * apaga el reintento hasta que una señal de contexto (signIn / cambio de
 * tenant) lo reactive. `null` o `failures=0` nunca reintenta.
 */
export function shouldRetryOpen(retry: OpenRetryState | null): boolean {
  if (!retry) return false;
  if (retry.failures <= 0) return false;
  if (retry.failures > MAX_OPEN_RETRIES) return false;
  return retry.tick >= 2 ** (retry.failures - 1);
}

/** Avanza un tick de poll del estado de reintento (no-op si no hay estado). */
export function advanceRetryTick(retry: OpenRetryState | null): OpenRetryState | null {
  if (!retry) return null;
  return { failures: retry.failures, tick: retry.tick + 1 };
}

/** Registra un fallo de apertura y reinicia el conteo de ticks. Tope en `MAX_OPEN_RETRIES + 1`. */
export function registerOpenFailure(retry: OpenRetryState | null): OpenRetryState {
  const base = retry ?? { failures: 0, tick: 0 };
  return { failures: Math.min(base.failures + 1, MAX_OPEN_RETRIES + 1), tick: 0 };
}