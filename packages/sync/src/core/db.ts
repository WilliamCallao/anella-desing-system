export type SQLiteBindValue = string | number | boolean | null | Uint8Array | ArrayBuffer;
export type SQLiteBindParams = readonly SQLiteBindValue[] | Record<string, SQLiteBindValue>;

export interface SQLiteRunResult {
  lastInsertRowId: number;
  changes: number;
}

/** Subset del handle de SQLite que consumen los repos del sync (ver `LocalDb`). */
export interface LocalDb {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params?: SQLiteBindParams): Promise<SQLiteRunResult>;
  getAllAsync<T>(source: string, params?: SQLiteBindParams): Promise<T[]>;
  getFirstAsync<T>(source: string, params?: SQLiteBindParams): Promise<T | null>;
  withExclusiveTransactionAsync(task: (txn: LocalDb) => Promise<void>): Promise<void>;
}