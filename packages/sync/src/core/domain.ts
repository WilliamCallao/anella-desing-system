import type { LocalDb } from "./db";

/** Página de delta de un dominio (items tipados por el módulo vía cast interno). */
export interface DomainDeltaPage {
  items: unknown[];
  deleted_ids: string[];
}

/**
 * Módulo de un dominio syncable: todo lo que el engine y el entorno necesitan
 * para sincronizar UN dominio, sin switch central. La app conforma sus dominios
 * a este contrato; el engine itera módulos.
 *
 * - `domain` — id del dominio (p.ej. "products"); debe coincidir con el `domain`
 *   que el backend espera en GET /sync/changes.
 * - `ddl` — DDL de NEGOCIO del dominio (el schema/app lo compone con `SYNC_META_SQL`).
 * - `tenantTables` — tablas de tenant que un wipe (logout/switch) debe limpiar;
 *   para tablas sin columna de tenant el consumidor define la spec con `parent`.
 * - `invalidateKeys` — prefijos de queryKeys a invalidar tras un pull OK.
 * - `applyDelta` — aplica una página del delta en el mirror local (upserts y
 *   borrados idempotentes; abre su propia transacción exclusiva).
 */
export interface SyncDomainModule {
  readonly domain: string;
  readonly ddl: readonly string[];
  readonly tenantTables: readonly string[];
  readonly invalidateKeys: readonly string[];
  applyDelta(args: { db: LocalDb; page: DomainDeltaPage; tenantId: string; storeId?: string }): Promise<void>;
}