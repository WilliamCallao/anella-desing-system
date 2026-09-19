import type { LocalDb } from "./db";

/** DDL de las tablas META que el sync administra (las crea/limpia el core):
 * - `sync_state` — cursores por `(domain, tenant_id, store_id)`.
 * - `sync_meta` — pares key/value globales (p.ej. `bell:{tenant}:{domain}`).
 */
export const SYNC_META_SQL: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS sync_state (
    domain TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    store_id TEXT NOT NULL DEFAULT '',
    cursor TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (domain, tenant_id, store_id)
  );`,
  `CREATE TABLE IF NOT EXISTS sync_meta (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL DEFAULT ''
  );`,
];

export const META_SYNC_STEP = SYNC_META_SQL.join("\n");

/**
 * MIGRADOR GENÉRICO: lleva una db a la versión `steps.length`, ejecutando el
 * paso `v` (`steps[v - 1]`) sobre la versión `v - 1`. Un paso es UN string
 * (el puente a las tablas de negocio lo arma el llamador, que decide cómo
 * componer su DDL con `SYNC_META_SQL`). Si la db ya está en una versión
 * >= `steps.length`, no toca nada.
 */
export async function migrate(db: LocalDb, steps: readonly string[]): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const current = row?.user_version ?? 0;
  if (current >= steps.length) return;
  if (current === 0) {
    await db.execAsync("PRAGMA journal_mode = WAL;");
  }
  for (let v = current + 1; v <= steps.length; v++) {
    await db.execAsync(steps[v - 1]);
    await db.runAsync(`PRAGMA user_version = ${v}`);
  }
}