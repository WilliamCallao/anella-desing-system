import Database from "better-sqlite3";
import type { LocalDb, SQLiteBindParams, SQLiteBindValue, SQLiteRunResult } from "../core/db";

function coerceBind(v: SQLiteBindValue | undefined): unknown {
  if (v === true) return 1;
  if (v === false) return 0;
  if (v === undefined) return null;
  if (v instanceof Uint8Array) return Buffer.from(v);
  if (v instanceof ArrayBuffer) return Buffer.from(v);
  return v;
}

/**
 * expo-sqlite: objetos = placeholders NOMBRADOS ($x/:x/@x), arrays = anónimos (?).
 * Mejor-sqlite3 solo conoce '?'. Convención del core: SQL SIEMPRE con '?' anónimos
 * y params como array; este adaptador mapea object -> valores en orden de keys
 * (posición) SOLO para mantener simetría en tests. Nunca usar placeholders nombrados.
 */
function toArray(params?: SQLiteBindParams): unknown[] {
  if (params == null) return [];
  if (typeof params === "string") return [params];
  return (Array.isArray(params) ? [...params] : Object.values(params)).map(coerceBind);
}

/** Wrap mejor-sqlite3 (sync, node) en la misma interfaz async de expo-sqlite. */
export function fromBetterSqlite3(db: Database.Database): LocalDb {
  return {
    async execAsync(source: string) {
      db.exec(source);
    },
    async runAsync(source: string, params?: SQLiteBindParams): Promise<SQLiteRunResult> {
      const info = db.prepare(source).run(...toArray(params));
      return { lastInsertRowId: Number(info.lastInsertRowid), changes: info.changes };
    },
    async getAllAsync<T>(source: string, params?: SQLiteBindParams): Promise<T[]> {
      return db.prepare(source).all(...toArray(params)) as T[];
    },
    async getFirstAsync<T>(source: string, params?: SQLiteBindParams): Promise<T | null> {
      return (db.prepare(source).get(...toArray(params)) ?? null) as T | null;
    },
    async withExclusiveTransactionAsync(task: (txn: LocalDb) => Promise<void>): Promise<void> {
      db.exec("BEGIN");
      try {
        await task(fromBetterSqlite3(db));
        db.exec("COMMIT");
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
    },
  };
}

/** Abre una DB en memoria limpia y migrada para cada test. */
export async function makeTestDb(): Promise<LocalDb> {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  return fromBetterSqlite3(db);
}