import type { LocalDb, SQLiteBindValue } from "../db";

const UPSERT_CHUNK_ROWS = 40;
const DELETE_BATCH_IDS = 100;

/** Construye el string de placeholders anónimos para una lista de `count` ids. */
export function buildPlaceholders(count: number): string {
  if (count <= 0) return "NULL";
  return Array.from({ length: count }, () => "?").join(", ");
}

/**
 * Inserta/actualiza varias filas con INSERT ... ON CONFLICT(id) DO UPDATE.
 *
 * Contrato implícito: la tabla destino DEBE tener un `id` PRIMARY KEY (TEXT o
 * INTEGER); las filas se emparejan por ese id. No usar en `sync_state`/`sync_meta`
 * (PK compuestas o `key`), ni en tablas cuyo tombstone se indexa por otra columna
 * (el consumidor define su SQL custom). Para mantener el número de variables por
 * sentencia bajo el límite de SQLite en Android (OS SQLite en minSdk24 = 999
 * variables), las filas se emiten en chunks de a lo sumo 40 por sentencia —
 * 40 × 14 columnas = 560 placeholders < 999.
 */
export async function upsertRows(
  db: LocalDb,
  table: string,
  columns: readonly string[],
  rows: ReadonlyArray<readonly unknown[]>
): Promise<void> {
  if (rows.length === 0) return;
  for (const row of rows) {
    if (row.length !== columns.length) {
      throw new Error(`upsertRows: ${table} row has ${row.length} values, expected ${columns.length}`);
    }
  }
  const cols = columns.join(", ");
  const perRow = `(${columns.map(() => "?").join(", ")})`;
  const setClause = columns
    .filter((c) => c !== "id")
    .map((c) => `${c} = excluded.${c}`)
    .join(", ");
  const insert = `INSERT INTO ${table} (${cols}) VALUES %s
    ON CONFLICT(id) DO UPDATE SET ${setClause}`;
  for (let i = 0; i < rows.length; i += UPSERT_CHUNK_ROWS) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK_ROWS);
    const params = chunk.flat() as SQLiteBindValue[];
    const sql = insert.replace("%s", chunk.map(() => perRow).join(", "));
    await db.runAsync(sql, params);
  }
}

/**
 * Borra filas por id, siempre acotado al tenant (tombstone del servidor ya
 * aplicado; aquí es el borrado físico local).
 *
 * Contrato implícito: requiere que la tabla tenga un `id` PRIMARY KEY y columna
 * `tenant_id`. No usar en `sync_state`/`sync_meta` (PK compuestas o `key`).
 */
export async function applyDeletes(db: LocalDb, table: string, ids: string[], tenantId: string): Promise<void> {
  if (ids.length === 0) return;
  for (let i = 0; i < ids.length; i += DELETE_BATCH_IDS) {
    const batch = ids.slice(i, i + DELETE_BATCH_IDS);
    await db.runAsync(
      `DELETE FROM ${table} WHERE id IN (${buildPlaceholders(batch.length)}) AND tenant_id = ?`,
      [...batch, tenantId]
    );
  }
}

/**
 * Cuenta las filas activas (no-tombstone) de un tenant.
 *
 * Contrato implícito: requiere columnas `tenant_id` y `deleted_at` en la tabla.
 * No usar en `sync_state`/`sync_meta` (PK compuestas o `key`).
 */
export async function totalCount(db: LocalDb, table: string, tenantId: string): Promise<number> {
  const row = await db.getFirstAsync<{ c: number }>(
    `SELECT COUNT(*) AS c FROM ${table} WHERE tenant_id = ? AND deleted_at IS NULL`,
    [tenantId]
  );
  return row?.c ?? 0;
}