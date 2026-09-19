/** DDL de negocio MÍNIMO que los tests del core necesitan (el core no conoce
 * las tablas de negocio del consumidor; los casos de prueba las declaran acá). */

export const PRODUCT_SQL = `CREATE TABLE IF NOT EXISTS product (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT '',
  product_code TEXT NOT NULL DEFAULT '',
  barcode TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT '',
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_product_tenant_updated ON product(tenant_id, updated_at);`;

export const ENTITY_ASSIGNMENT_SQL = `CREATE TABLE IF NOT EXISTS entity_assignment (
  id INTEGER PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  classification_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT '',
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_assignment_entity ON entity_assignment(entity_id);`;

export const JOURNAL_SQL = `CREATE TABLE IF NOT EXISTS journal_entry (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL,
  entry_number TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS journal_line (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id TEXT NOT NULL,
  account_id TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_journal_line_entry ON journal_line(entry_id);`;