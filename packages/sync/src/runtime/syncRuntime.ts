import { BellGate, bellShouldPull, type BellBump } from "../core/bell";
import type { LogSink } from "../core/logs";
import {
  advanceRetryTick,
  registerOpenFailure,
  resolveSessionTenant,
  shouldOpenSync,
  shouldRetryOpen,
  type AuthStatusLike,
  type OpenRetryState,
} from "../core/session";

/** Resultado de un pull del session, sin acoplar a la app (shape estructural). */
export interface RuntimePullResult {
  domain: string;
  items: number;
  deleted: number;
  cursor: string | null;
  ok: boolean;
  error?: unknown;
  /** `true` si se aplicó >=1 página del delta antes de un posible fallo de red. */
  fresh: boolean;
}

/**
 * Sesión de sync que el runtime administra. El consumidor la construye (db +
 * engine + repos) con `config.openSession`; el runtime solo la usa para pull,
 * bootstrap, cerrarla y persistir el last_bell de la campana.
 */
export interface RuntimeSession {
  readonly domains: readonly string[];
  pull(domain: string): Promise<RuntimePullResult>;
  bootstrap(): Promise<RuntimePullResult[]>;
  close(): Promise<void>;
  /** Campana RTDB persistida (key por tenant queda dentro de la sesión). */
  getLastBell?(domain: string): Promise<number>;
  setLastBell?(domain: string, version: number): Promise<void>;
}

/** Fuente de identidad del consumidor (useAuth + tenant activo). */
export interface RuntimeIdentity {
  getStatus(): AuthStatusLike;
  getTenantId(): string | null;
}

/** Cache de queries del consumidor (React Query u otro). */
export interface RuntimeQueryCache {
  invalidate(domain: string): void;
  clear(): void;
}

/**
 * Campana RTDB del consumidor. El runtime la suscribe por tenant y la re-suscribe
 * cuando el tenant cambia; los bumps repetidos/regresivos se filtran en el
 * `BellGate` interno del runtime.
 */
export interface RuntimeBellSource {
  subscribe(tenantId: string | null, cb: (bump: BellBump) => void): () => void;
}

/** Timers y eventos de foreground (AppState en RN; fakeable en tests). */
export interface RuntimeClock {
  setInterval(cb: () => void, ms: number): unknown;
  clearInterval(id: unknown): void;
  /** Edge inactive->active (foreground). Opcional: sin él no hay refresh on-foreground. */
  onForeground?(cb: () => void): () => void;
}

export interface SyncRuntimeConfig {
  identity: RuntimeIdentity;
  queryCache: RuntimeQueryCache;
  bellSource: RuntimeBellSource;
  clock: RuntimeClock;
  logs?: LogSink;
  /** Intervalo del poll de respaldo (default 60 s). */
  pollIntervalMs?: number;
  /** Abre la sesión completa para un tenant (db + engine). Nunca debe fallar por contexto. */
  openSession(tenant: string): Promise<RuntimeSession>;
  /** Cierra la sesión y su db; `cleanData` true => limpiar los datos locales del tenant antes. */
  closeSession(session: RuntimeSession, opts?: { cleanData?: boolean }): Promise<void>;
  /** Plegado de error a PullResult de fallo pleno (default: shape estándar). */
  foldPullFailure?(domain: string, error: unknown): RuntimePullResult;
}

export interface SyncRuntimeSnapshot {
  session: RuntimeSession | null;
  tenantId: string | null;
  lastResults: Record<string, RuntimePullResult>;
}

export interface SyncRuntime {
  getSnapshot(): SyncRuntimeSnapshot;
  /** Suscribe al snapshot; devuelve unsubscriber. */
  subscribe(cb: () => void): () => void;
  /** Pull incremental de un dominio; null si no hay sesión viva. Nunca lanza. */
  refreshDomain(domain: string): Promise<RuntimePullResult | null>;
  /** Bump en memoria por dominio (refrescos post-pull de los consumidores). */
  settleBump(domain: string): number;
  /** Re-evalúa la identidad (signIn/signOut/cambio de tenant). Llamar ante cada cambio relevante. */
  syncIdentity(): void;
  /** Arranca poll + foreground + suscripción a la campana. */
  start(): void;
  /** Detiene todo (unmount): cierra la sesión viva sin limpiar datos ni invalidar queries. */
  stop(): void;
}

const TAG = "syncRuntime.ts";

/** Wrapper de LogSink que respeta métodos ausentes (no-op sin logs). */
function makeLogger(logs?: LogSink) {
  return {
    d: (message: string, meta?: Record<string, unknown>) => logs?.debug?.(message, meta),
    i: (message: string, meta?: Record<string, unknown>) => logs?.info?.(message, meta),
    w: (message: string, meta?: Record<string, unknown>) => logs?.warn?.(message, meta),
    e: (message: string, meta?: Record<string, unknown>) => logs?.error?.(message, meta),
  };
}

function baselinePullFailure(domain: string, error: unknown): RuntimePullResult {
  return { domain, items: 0, deleted: 0, cursor: null, ok: false, error, fresh: false };
}

function indexResults(results: RuntimePullResult[]): Record<string, RuntimePullResult> {
  return Object.fromEntries(results.map((r) => [r.domain, r]));
}

export function createSyncRuntime(config: SyncRuntimeConfig): SyncRuntime {
  const { identity, queryCache, bellSource, clock } = config;
  const log = makeLogger(config.logs);
  const fold = config.foldPullFailure ?? baselinePullFailure;
  const pollIntervalMs = config.pollIntervalMs ?? 60_000;

  // Refs espejo del estado vivo (las decisiones asíncronas no cierran stale).
  let sessionRef: RuntimeSession | null = null;
  let tenantRef: string | null = null;
  let openRetryRef: OpenRetryState | null = null;
  const bumpsRef = new Map<string, number>();
  let lastResultsRef: Record<string, RuntimePullResult> = {};
  /** Puerta de versiones de la campana: se recrea por suscripción (tenant). */
  let bellGateRef: BellGate | null = null;
  let bellSub: { tenant: string | null; unsubscribe: () => void } | null = null;
  let pollId: unknown = null;
  let foregroundUnsub: (() => void) | null = null;

  /** Listener de snapshot (el provider lo refleja a React). */
  const listeners = new Set<() => void>();

  /**
   * Epoch de decisiones de ciclo de vida. Se incrementa al ENTRAR a cada
   * decisión (syncIdentity, poll-retry, stop). Un `openSession` en vuelo captura
   * su gen; si al resolver ve `gen !== generationRef`, el contexto cambió
   * (flap de tenant, signout...) y DESCARTA su sesión sin asignar: así un open
   * de t1 que responde tarde NUNCA pisa una sesión ya abierta para t2.
   *
   * INVARIANTE: este epoch es la ÚNICA guarda de caducidad de un open en vuelo.
   * Cada cambio de contexto relevante re-ejecuta `syncIdentity` e incrementa el
   * epoch, así que un open cuyo contexto cambió SIEMPRE ve un gen distinto y se
   * descarta solo. No agregar espejos manuales del tenant "deseado".
   */
  let generationRef = 0;

  function emit(): void {
    for (const cb of listeners) cb();
  }

  function snapshot(): SyncRuntimeSnapshot {
    return { session: sessionRef, tenantId: tenantRef, lastResults: { ...lastResultsRef } };
  }

  /** Unsubscribe/resubscribe de la campana según el tenant activo. */
  function syncBell(tenant: string | null): void {
    if (bellSub) {
      if (bellSub.tenant === tenant) return;
      bellSub.unsubscribe();
      bellSub = null;
    }
    bellGateRef = null;
    if (!tenant) return;
    const gate = new BellGate();
    bellGateRef = gate;
    const unsubscribe = bellSource.subscribe(tenant, (bump) => {
      void handleBump(bump);
    });
    bellSub = { tenant, unsubscribe };
  }

  /**
   * Cierra la sesión viva (engine + db) y limpia referencias. `keepState` true
   * (switch de tenant): deja el estado apuntando a la sesión cerrada hasta que
   * la nueva asignación lo reemplace (evita el destello `session:null` en medio
   * del switch). `cleanData` true (signOut o switch): borra los datos LOCALES del
   * tenant saliente antes de cerrar (Task 8). Nunca lanza.
   */
  async function closeLive(opts?: { keepState?: boolean; cleanData?: boolean }): Promise<void> {
    const live = sessionRef;
    const liveTenant = tenantRef;
    log.i("sync: cerrando sesión viva", {
      tag: TAG,
      tenant: liveTenant ?? null,
      cleanData: opts?.cleanData ?? false,
      keepState: opts?.keepState ?? false,
    });
    if (live) {
      try {
        await config.closeSession(live, { cleanData: opts?.cleanData });
      } catch (error) {
        log.e("error al cerrar la sesión de sync", { tag: TAG, error });
      }
    }
    if (sessionRef === live) {
      sessionRef = null;
      tenantRef = null;
      openRetryRef = null;
      if (!opts?.keepState) emit();
    }
  }

  /**
   * Abre la sesión para `tenant`. El caller (syncIdentity o poll-retry) YA
   * incrementó `generationRef`; acá se captura `gen` y tras CADA await se
   * verifica que el contexto no haya cambiado antes de asignar (race del review:
   * open de t1 resolviendo tarde tras un flap t1->t2->t1).
   */
  async function openFor(tenant: string): Promise<void> {
    const gen = generationRef;
    if (sessionRef && tenantRef !== tenant) {
      // Serializa el switch: cierro la sesión vieja ANTES de abrir la nueva;
      // `keepState` evita el destello session:null. `cleanData` borra los datos
      // locales del tenant saliente y `queryCache.clear` evita que keys no
      // scoped por tenant arrastren estado del tenant anterior.
      log.i("sync: switch de tenant", { tag: TAG, de: tenantRef, a: tenant });
      queryCache.clear();
      await closeLive({ keepState: true, cleanData: true });
    }
    let next: RuntimeSession | null = null;
    try {
      next = await config.openSession(tenant);
      if (gen !== generationRef) {
        log.w("sync: open descartado (contexto cambió durante la apertura)", {
          tag: TAG,
          tenant,
          generacionEsperada: gen,
          generacionActual: generationRef,
        });
        try {
          await config.closeSession(next, { cleanData: false });
        } catch (error) {
          log.e("error al descartar sesión de sync", { tag: TAG, error });
        }
        return;
      }
      sessionRef = next;
      tenantRef = tenant;
      openRetryRef = null;
      emit();
      log.i("sync: sesión abierta", { tag: TAG, tenant, dominios: next.domains });
      next
        .bootstrap()
        .then((results) => {
          if (sessionRef === next) {
            lastResultsRef = indexResults(results);
            emit();
          }
        })
        .catch((error: unknown) => {
          // bootstrap NO rechaza hoy (los errores viajan en cada PullResult);
          // red de seguridad idempotente por si un contrato futuro lo rompe.
          log.e("bootstrap de sync falló", { tag: TAG, error, tenant });
        });
    } catch (error) {
      // Puede venir de openLocalDatabase() o del engine (migrate): apertura
      // fallida -> log + reintento con backoff del poll.
      log.e("no se pudo abrir la sesión de sync", { tag: TAG, error, tenant });
      if (gen === generationRef) {
        openRetryRef = registerOpenFailure(openRetryRef);
        sessionRef = null;
        tenantRef = null;
        emit();
      }
      if (next) {
        try {
          await config.closeSession(next, { cleanData: false });
        } catch (closeError) {
          log.e("error al cerrar sesión de sync tras apertura fallida", { tag: TAG, error: closeError });
        }
      }
    }
  }

  /** Pull de TODOS los dominios activos (poll + foreground). Nunca lanza. */
  async function refreshAll(next: RuntimeSession): Promise<void> {
    log.i("sync: refreshAll inicia (poll/foreground)", { tag: TAG, dominios: next.domains });
    const settled = await Promise.allSettled(next.domains.map((domain) => next.pull(domain)));
    if (sessionRef !== next) return;
    const results: RuntimePullResult[] = settled.map((result, index) => {
      const domain = next.domains[index];
      return result.status === "fulfilled" ? result.value : fold(domain, result.reason);
    });
    log.i("sync: refreshAll completado", {
      tag: TAG,
      ok: `${results.filter((r) => r.ok).length}/${results.length}`,
      resumen: results.map((r) => ({
        domain: r.domain,
        ok: r.ok,
        items: r.items,
        deleted: r.deleted,
        cursor: r.cursor ?? null,
      })),
    });
    lastResultsRef = indexResults(results);
    emit();
    // Sólo los pulls OK tocan el mirror local: invalidar esas queries.
    next.domains.forEach((domain, index) => {
      if (results[index]?.ok) {
        try {
          queryCache.invalidate(domain);
        } catch (error) {
          log.e("error invalidando queries tras refreshAll", { tag: TAG, domain, error });
        }
      }
    });
  }

  /**
   * Pull incremental de un dominio tenant-level; `null` si no hay sesión viva.
   * NUNCA lanza: los errores no-retryables del pull se absorben en un
   * `RuntimePullResult` con `ok:false`.
   */
  async function refreshDomain(domain: string): Promise<RuntimePullResult | null> {
    const live = sessionRef;
    if (!live) return null;
    try {
      const result = await live.pull(domain);
      lastResultsRef = { ...lastResultsRef, [domain]: result };
      emit();
      log.i("sync: refreshDomain", {
        tag: TAG,
        domain,
        ok: result.ok,
        items: result.items,
        deleted: result.deleted,
        cursor: result.cursor ?? null,
        error: result.error instanceof Error ? result.error.message : result.error ?? null,
      });
      return result;
    } catch (error) {
      const failed = fold(domain, error);
      lastResultsRef = { ...lastResultsRef, [domain]: failed };
      emit();
      log.e("sync: refreshDomain falló", { tag: TAG, domain, error });
      return failed;
    }
  }

  /**
   * Bump de la campana RTDB -> pull del dominio afectado si la versión avanza.
   * Filtra dominios fuera de la sesión, descarta repetidos vía BellGate y
   * persiste `setLastBell` (key por tenant, dentro de la sesión) solo cuando el
   * pull salió bien. El write es MONOTÓNICO (`Math.max` contra una relectura):
   * dos pulls concurrentes del mismo dominio nunca bajan `last_bell`. Si la
   * sesión murió en medio, no se escribe el bell de una sesión vieja. Nunca lanza.
   */
  async function handleBump(bump: BellBump): Promise<void> {
    const live = sessionRef;
    const tenant = tenantRef;
    if (!live || !tenant) {
      // Sin sesión viva todavía (bootstrap en curso) el bump se dropea: el
      // bootstrap ya arrastra el delta completo y, al abrirse, la campana
      // re-emite su snapshot (self-heal del diseño).
      log.d("campana recibida sin sesión activa — dropeada (bootstrap/poll la cubren)", {
        tag: TAG,
        domain: bump.domain,
        version: bump.version,
      });
      return;
    }
    const domain = bump.domain;
    const allowed = new Set<string>(live.domains);
    if (!allowed.has(domain)) {
      log.d("campana ignorada: dominio no suscrito", { tag: TAG, domain, version: bump.version });
      return;
    }
    const gate = bellGateRef;
    if (!gate) {
      log.w("campana ignorada: puerta de versiones ausente", { tag: TAG, domain, version: bump.version });
      return;
    }
    try {
      const prev = live.getLastBell ? await live.getLastBell(domain) : 0;
      if (!gate.seen(domain, bump.version)) {
        log.d("campana ignorada: versión repetida/regresiva (gate)", {
          tag: TAG,
          domain,
          version: bump.version,
          prev,
        });
        return;
      }
      if (!bellShouldPull(prev, bump.version)) {
        log.d("campana ignorada: última vista >= versión (bell)", {
          tag: TAG,
          domain,
          version: bump.version,
          prev,
        });
        return;
      }
      log.i("campana dispara pull", { tag: TAG, domain, version: bump.version, prev });
      const result = await refreshDomain(domain);
      if (result?.ok && sessionRef === live) {
        // Monotónico: el pull aplicó el delta completo; un pull redundante
        // posterior es barato e idempotente.
        if (live.getLastBell && live.setLastBell) {
          const fresh = await live.getLastBell(domain);
          await live.setLastBell(domain, Math.max(fresh, bump.version));
        }
        try {
          queryCache.invalidate(domain);
        } catch (error) {
          log.e("error invalidando queries tras campana", { tag: TAG, domain, error });
        }
        log.i("campana procesada", { tag: TAG, domain, version: bump.version, prev, ok: true });
      } else {
        // Pull fallido o sesión cerrada: no se avanza last_bell (reintento en
        // el próximo bump/poll; el guard evita escribir a lo viejo).
        log.e("campana con pull fallido o sesión cerrada", {
          tag: TAG,
          domain,
          version: bump.version,
          prev,
          ok: result?.ok,
        });
      }
    } catch (error) {
      log.e("error procesando la campana", { tag: TAG, domain, version: bump.version, error });
    }
  }

  /** Re-evalúa la identidad: abre/cierra la sesión según auth + tenant. */
  function syncIdentity(): void {
    generationRef += 1;
    const signedIn = shouldOpenSync(identity.getStatus());
    const activeTenant = identity.getTenantId();
    syncBell(signedIn ? activeTenant : null);
    if (!signedIn || !activeTenant) {
      log.i("sync: lifecycle cierra sesión (signout sin tenant/sesión)", {
        tag: TAG,
        status: identity.getStatus(),
        activeTenant: activeTenant ?? null,
      });
      // signOut o tenant ausente: limpiar el cache de queries y los datos
      // LOCALES del tenant saliente (no mezclar tenants en la misma db).
      void closeLive({ cleanData: true });
      queryCache.clear();
      return;
    }
    const nextTenant = resolveSessionTenant(tenantRef, activeTenant);
    if (nextTenant === null) {
      log.d("sync: lifecycle no-op (sesión ya viva)", { tag: TAG, tenant: activeTenant });
      return; // ya hay sesión viva para este tenant
    }
    log.i("sync: lifecycle abre sesión", { tag: TAG, tenant: nextTenant });
    void openFor(nextTenant);
  }

  function start(): void {
    pollId = clock.setInterval(() => {
      const live = sessionRef;
      if (live) {
        log.d("sync: tick de poll", { tag: TAG });
        void refreshAll(live);
        return;
      }
      openRetryRef = advanceRetryTick(openRetryRef);
      const activeTenant = identity.getTenantId();
      if (shouldRetryOpen(openRetryRef)) {
        log.w("sync: reintento de apertura de sesión (backoff)", { tag: TAG, tenant: activeTenant });
        generationRef += 1;
        if (activeTenant) void openFor(activeTenant);
      }
    }, pollIntervalMs);
    if (clock.onForeground) {
      foregroundUnsub = clock.onForeground(() => {
        const live = sessionRef;
        if (live) {
          log.i("sync: app en foreground -> refreshAll", { tag: TAG });
          void refreshAll(live);
        }
      });
    }
    syncIdentity();
  }

  function stop(): void {
    generationRef += 1;
    syncBell(null);
    void closeLive({ cleanData: false });
    if (pollId !== null) clock.clearInterval(pollId);
    pollId = null;
    foregroundUnsub?.();
    foregroundUnsub = null;
  }

  return {
    getSnapshot: snapshot,
    subscribe(cb: () => void): () => void {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    refreshDomain,
    settleBump(domain: string): number {
      const next = (bumpsRef.get(domain) ?? 0) + 1;
      bumpsRef.set(domain, next);
      return next;
    },
    syncIdentity,
    start,
    stop,
  };
}