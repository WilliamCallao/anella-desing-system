import type { LogSink } from "./logs";

/** Dominio syncable. El core NO fija el set de dominios (es del consumidor): un `string` libre. */
export type SyncDomain = string;

/**
 * Contrato de transporte pro cambio de UN dominio:
 * - `domain` — dominio syncable.
 * - `since` — cursor a partir del cual traer cambios; `null`/`undefined` =
 *   primera sincronización (el gateway asume `since = epoch`).
 * - `storeId` — sucursal activa del scope; SOLO aplica al dominio `stock`
 *   (el gateway lo rechaza cuando no corresponde). Opcional: omitir para los
 *   dominios tenant-level.
 * - `pageSize` — RESERVADO para fases futuras. v1 NO lo transmite: la app usa
 *   el default del gateway (`SYNC_PAGE_SIZE = 100`).
 */
export interface SyncHint {
  domain: SyncDomain;
  since?: string | null;
  storeId?: string;
  pageSize?: number;
}

/** Forma wire normalizada de una página (snake_case protojson con EmitUnpopulated). */
export interface SyncPage<T> {
  items: T[];
  deleted_ids: string[];
  next_cursor: string;
  has_more: boolean;
  server_time: string;
}

export interface SyncTransport {
  /** Devuelve UNA página; la paginación con el mismo `since` la maneja el engine. */
  getChanges<T>(hint: SyncHint): Promise<SyncPage<T>>;
  readonly endpoint: string;
}

/** Default del gateway para el tamaño de página (el consumidor v1 no lo sobreescribe). */
export const SYNC_PAGE_SIZE = 100;

/** Opciones del request mínimo que el transporte inyecta en cada GET de cambios. */
export interface SyncRequestOptions {
  method?: "GET";
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
}

/**
 * Mínimo del client HTTP que el transporte necesita. El consumidor adapta su
 * propio client de red a esta firma (acoplamiento estructural, SIN importar el
 * client del consumidor). `path`/`query` viajan tal cual: el adaptador los
 * traduce a sus opciones de request específicas.
 */
export type SyncRequest = <T>(opts: SyncRequestOptions) => Promise<T>;

export const SYNC_CHANGES_PATH = "/sync/changes";

/**
 * Transporte HTTP del SyncEngine: envía `GET {path}?domain=…&since=…&store_id=…`
 * y tipa la respuesta como `SyncPage<T>`. `since` se omite cuando es
 * `null`/`undefined`, `store_id` cuando está vacío, y NUNCA se envía `page_size`
 * (v1 usa el default 100 del gateway). Los errores de red/HTTP se propagan tal
 * cual (no se envuelven ni transforman). El wire llega DEL GATEWAY con los arrays
 * ya presentes; `items`/`deleted_ids` null se normalizan a `[]` sin tapar el
 * guard de contrato del engine.
 */
export function createHttpSyncTransport(
  request: SyncRequest,
  opts?: { logs?: LogSink }
): SyncTransport {
  const logs = opts?.logs;
  return {
    endpoint: SYNC_CHANGES_PATH,
    async getChanges<T>(hint: SyncHint): Promise<SyncPage<T>> {
      const query: SyncRequestOptions["query"] = { domain: hint.domain };
      if (hint.since != null) query.since = hint.since;
      if (hint.storeId) query.store_id = hint.storeId;
      logs?.debug?.("sync: GET /sync/changes", {
        domain: hint.domain,
        since: hint.since ?? "bootstrap",
        storeId: hint.storeId ?? undefined,
      });
      const raw = await request<SyncPage<T>>({ method: "GET", path: SYNC_CHANGES_PATH, query });
      const items = raw.items ?? [];
      const deleted_ids = raw.deleted_ids ?? [];
      logs?.debug?.("sync: página recibida", {
        domain: hint.domain,
        items: items.length,
        deleted: deleted_ids.length,
        has_more: raw.has_more,
        next_cursor: raw.next_cursor,
        server_time: raw.server_time,
      });
      return { items, deleted_ids, next_cursor: raw.next_cursor, has_more: raw.has_more, server_time: raw.server_time };
    },
  };
}