import type { LocalDb } from "./db";

/** Prefijo de la key persistida del último bell: `bell:{tenantId}:{domain}`. */
const BELL_KEY_PREFIX = "bell:";

/** Estado de sync SIMPLE (cursores + campana persistida). El wipe de tenant es
 * `clearTenantRows`, separado, porque depende de las tablas del consumidor. */
export interface SyncStateRepo {
  getCursor(domain: string, tenantId: string, storeId: string): Promise<string | null>;
  setCursor(domain: string, tenantId: string, storeId: string, cursor: string): Promise<void>;
  /**
   * Última versión de campana persistida para `domain` + `tenantId`. La key es
   * `bell:{tenantId}:{domain}`: `sync_meta` es una sola tabla sin columna de
   * tenant y el consumidor es multi-tenant sobre la misma db, así que el bell
   * es per-tenant.
   */
  getLastBell(domain: string, tenantId: string): Promise<number>;
  setLastBell(domain: string, tenantId: string, version: number): Promise<void>;
}

export function createSyncStateRepo(db: LocalDb): SyncStateRepo {
  return {
    async getCursor(domain, tenantId, storeId) {
      const row = await db.getFirstAsync<{ cursor: string }>(
        "SELECT cursor FROM sync_state WHERE domain = ? AND tenant_id = ? AND store_id = ?",
        [domain, tenantId, storeId ?? ""]
      );
      return row ? row.cursor : null;
    },
    async setCursor(domain, tenantId, storeId, cursor) {
      await db.runAsync(
        `INSERT INTO sync_state (domain, tenant_id, store_id, cursor, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(domain, tenant_id, store_id) DO UPDATE SET cursor = excluded.cursor, updated_at = excluded.updated_at`,
        [domain, tenantId, storeId ?? "", cursor, new Date().toISOString()]
      );
    },
    async getLastBell(domain, tenantId) {
      const row = await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM sync_meta WHERE key = ?",
        [`${BELL_KEY_PREFIX}${tenantId}:${domain}`]
      );
      const parsed = row ? Number(row.value) : NaN;
      return Number.isFinite(parsed) ? parsed : 0;
    },
    async setLastBell(domain, tenantId, version) {
      await db.runAsync(
        `INSERT INTO sync_meta (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [`${BELL_KEY_PREFIX}${tenantId}:${domain}`, String(version)]
      );
    },
  };
}

/**
 * Especificación de una tabla de negocio para `clearTenantRows`:
 * - `{ table }` — tabla con columna de tenant (`tenantColumn`, default `tenant_id`).
 * - `{ table, parent }` — tabla SIN columna de tenant (p.ej. líneas de un documento):
 *   `parent.column` es la columna FK del HIJO que referencia al `parent.table`
 *   (p.ej. `journal_line.entry_id` → `journal_entry`); se borran las filas del hijo
 *   cuyo FK está entre los `id` del padre que pertenecen al tenant (cascada manual,
 *   sin FK).
 */
export interface SyncStateTableSpec {
  table: string;
  tenantColumn?: string;
  parent?: { table: string; column: string };
}

/** Borra TODOS los datos de un tenant (wipe de logout / cambio de tenant), en una
 * transacción exclusiva: cada tabla de negocio especificada + los cursores
 * `sync_state` del tenant. Nunca afecta a otros tenants de la misma db.
 *
 * Orden: las especificaciones con `parent` (tablas hijo, p.ej. líneas) se
 * procesan SIEMPRE PRIMERO, antes que las tablas directas — el DELETE del hijo
 * subconsultá los `id` del padre con `WHERE tenant_id = ?` ANTES de que el
 * padre sea borrado (cascada manual; el orden de `tables` no importa). */
export async function clearTenantRows(
  db: LocalDb,
  tenantId: string,
  tables: readonly SyncStateTableSpec[]
): Promise<void> {
  await db.withExclusiveTransactionAsync(async (txn) => {
    const childFirst = [
      ...tables.filter((spec) => spec.parent),
      ...tables.filter((spec) => !spec.parent),
    ];
    for (const spec of childFirst) {
      if (spec.parent) {
        await txn.runAsync(
          `DELETE FROM ${spec.table} WHERE ${spec.parent.column} IN (SELECT id FROM ${spec.parent.table} WHERE tenant_id = ?)`,
          [tenantId]
        );
      } else {
        const tenantColumn = spec.tenantColumn ?? "tenant_id";
        await txn.runAsync(`DELETE FROM ${spec.table} WHERE ${tenantColumn} = ?`, [tenantId]);
      }
    }
    await txn.runAsync("DELETE FROM sync_state WHERE tenant_id = ?", [tenantId]);
  });
}