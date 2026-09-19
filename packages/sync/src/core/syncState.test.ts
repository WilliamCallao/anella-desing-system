import { describe, expect, it } from "vitest";
import type { LocalDb } from "./db";
import { migrate, SYNC_META_SQL } from "./schema";
import { makeTestDb } from "../test/sqliteCompat";
import { PRODUCT_SQL, JOURNAL_SQL } from "../test/testSchema";
import {
  createSyncStateRepo,
  clearTenantRows,
  type SyncStateTableSpec,
} from "./syncState";
import { upsertRows } from "./sql/upsert";

const PRODUCT_COLUMNS = [
  "id", "tenant_id", "name", "product_type", "product_code", "barcode",
  "is_active", "is_visible", "created_at", "updated_at", "deleted_at",
] as const;

function productRow(id: string, tenantId: string) {
  return [
    id, tenantId, "Leche", "physical", "LEC", "77900001",
    1, 1, "2026-09-14T00:00:00Z", "2026-09-14T00:00:00Z", null,
  ];
}

/** Migra la db de prueba con las tablas de negocio mínimas + el meta del sync. */
async function migrateTestDb(db: LocalDb): Promise<void> {
  await migrate(db, [[PRODUCT_SQL, JOURNAL_SQL, ...SYNC_META_SQL].join("\n")]);
}

describe("syncStateRepo", () => {
  it("reads and writes the per-domain cursor", async () => {
    const db = await makeTestDb();
    await migrateTestDb(db);
    const repo = createSyncStateRepo(db);
    expect(await repo.getCursor("products", "acme", "")).toBeNull();
    await repo.setCursor("products", "acme", "", "2026-09-14T00:00:00.123456Z");
    expect(await repo.getCursor("products", "acme", "")).toBe("2026-09-14T00:00:00.123456Z");
    // stock es per-store: distinto cursor para otra store
    await repo.setCursor("stock", "acme", "store-1", "111");
    await repo.setCursor("stock", "acme", "store-2", "222");
    expect(await repo.getCursor("stock", "acme", "store-1")).toBe("111");
    expect(await repo.getCursor("stock", "acme", "store-2")).toBe("222");
  });

  it("stores the last bell version per domain and tenant", async () => {
    const db = await makeTestDb();
    await migrateTestDb(db);
    const repo = createSyncStateRepo(db);
    expect(await repo.getLastBell("products", "acme")).toBe(0);
    await repo.setLastBell("products", "acme", 1726283941123);
    expect(await repo.getLastBell("products", "acme")).toBe(1726283941123);
  });

  it("keeps bell versions isolated between tenants", async () => {
    const db = await makeTestDb();
    await migrateTestDb(db);
    const repo = createSyncStateRepo(db);
    await repo.setLastBell("products", "t1", 10);
    // el bell de otro tenant no contamina (sync_meta es una sola tabla)
    expect(await repo.getLastBell("products", "t2")).toBe(0);
    await repo.setLastBell("products", "t2", 3);
    expect(await repo.getLastBell("products", "t1")).toBe(10);
    expect(await repo.getLastBell("products", "t2")).toBe(3);
    // mismo tenant, dominios distintos: también aislados
    expect(await repo.getLastBell("prices", "t1")).toBe(0);
  });

  it("clears all sync state and rows for a tenant (incl. tablas sin tenant_id vía parent)", async () => {
    const db = await makeTestDb();
    await migrateTestDb(db);
    // datos de negocio + cursores de acme y de other
    await upsertRows(db, "product", PRODUCT_COLUMNS, [
      productRow("p-1", "acme"),
      productRow("p-2", "other"),
    ]);
    await db.runAsync(
      `INSERT INTO journal_entry (id, tenant_id) VALUES ('je-1', 'acme'), ('je-2', 'other')`
    );
    await db.runAsync(
      `INSERT INTO journal_line (entry_id, account_id) VALUES ('je-1', 'a-1'), ('je-2', 'a-2')`
    );
    const repo = createSyncStateRepo(db);
    await repo.setCursor("products", "acme", "", "c1");
    await repo.setCursor("products", "other", "", "c2");
    await repo.setLastBell("products", "acme", 9);
    await repo.setLastBell("products", "other", 5);

    const specs: readonly SyncStateTableSpec[] = [
      { table: "product" },
      { table: "journal_entry" },
      // journal_line NO tiene tenant_id: se limpia vía su journal_entry (parent);
      // `column` es la FK del hijo (entry_id → journal_entry.id)
      { table: "journal_line", parent: { table: "journal_entry", column: "entry_id" } },
    ];
    await clearTenantRows(db, "acme", specs);

    const state = await db.getFirstAsync<{ c: number }>("SELECT COUNT(*) AS c FROM sync_state");
    expect(state?.c).toBe(1);
    const products = await db.getAllAsync<{ id: string }>("SELECT id FROM product ORDER BY id");
    expect(products.map((r) => r.id)).toEqual(["p-2"]);
    const lines = await db.getAllAsync<{ entry_id: string }>("SELECT entry_id FROM journal_line");
    expect(lines.map((r) => r.entry_id)).toEqual(["je-2"]);
    const otherBell = await repo.getLastBell("products", "other");
    expect(otherBell).toBe(5);
  });
});