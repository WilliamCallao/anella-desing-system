import { describe, expect, it } from "vitest";
import type { LocalDb } from "../db";
import { migrate, SYNC_META_SQL } from "../schema";
import { makeTestDb } from "../../test/sqliteCompat";
import { PRODUCT_SQL, ENTITY_ASSIGNMENT_SQL } from "../../test/testSchema";
import { applyDeletes, upsertRows } from "./upsert";

const PRODUCT_COLUMNS = [
  "id", "tenant_id", "name", "product_type", "product_code", "barcode",
  "is_active", "is_visible", "created_at", "updated_at", "deleted_at",
] as const;

const ASSIGNMENT_COLUMNS = [
  "id", "tenant_id", "entity_id", "entity_type", "classification_id",
  "created_at", "updated_at", "deleted_at",
] as const;

function productRow(over: Partial<Record<(typeof PRODUCT_COLUMNS)[number], unknown>> = {}) {
  return [
    over.id ?? "p-1",
    over.tenant_id ?? "acme",
    over.name ?? "Leche",
    over.product_type ?? "physical",
    over.product_code ?? "LEC",
    over.barcode ?? "77900001",
    over.is_active ?? 1,
    over.is_visible ?? 1,
    over.created_at ?? "2026-09-14T00:00:00Z",
    over.updated_at ?? "2026-09-14T00:00:00Z",
    over.deleted_at ?? null,
  ];
}

/** Migra la db de prueba con las tablas de negocio mínimas + el meta del sync. */
async function migrateTestDb(db: LocalDb): Promise<void> {
  await migrate(db, [[PRODUCT_SQL, ENTITY_ASSIGNMENT_SQL, ...SYNC_META_SQL].join("\n")]);
}

describe("upsertRows", () => {
  it("inserts new rows and updates existing ones on conflict", async () => {
    const db = await makeTestDb();
    await migrateTestDb(db);
    await upsertRows(db, "product", PRODUCT_COLUMNS, [productRow()]);
    await upsertRows(db, "product", PRODUCT_COLUMNS, [productRow({ name: "Leche 2", updated_at: "2026-09-14T01:00:00Z" })]);
    const row = await db.getFirstAsync<{ name: string; updated_at: string }>(
      "SELECT name, updated_at FROM product WHERE id = ?", ["p-1"]
    );
    expect(row?.name).toBe("Leche 2");
    expect(row?.updated_at).toBe("2026-09-14T01:00:00Z");
    const count = await db.getFirstAsync<{ c: number }>("SELECT COUNT(*) AS c FROM product");
    expect(count?.c).toBe(1);
  });

  it("keeps deleted_at as a real tombstone when provided", async () => {
    const db = await makeTestDb();
    await migrateTestDb(db);
    await upsertRows(db, "product", PRODUCT_COLUMNS, [productRow({ deleted_at: "2026-09-14T09:00:00Z" })]);
    const row = await db.getFirstAsync<{ deleted_at: string | null }>(
      "SELECT deleted_at FROM product WHERE id = ?", ["p-1"]
    );
    expect(row?.deleted_at).toBe("2026-09-14T09:00:00Z");
  });
});

describe("applyDeletes", () => {
  it("removes rows by id; ids not present are a no-op", async () => {
    const db = await makeTestDb();
    await migrateTestDb(db);
    await upsertRows(db, "product", PRODUCT_COLUMNS, [productRow(), productRow({ id: "p-2" })]);
    await applyDeletes(db, "product", ["p-1", "missing"], "acme");
    const ids = await db.getAllAsync<{ id: string }>("SELECT id FROM product ORDER BY id");
    expect(ids.map((r) => r.id)).toEqual(["p-2"]);
  });

  it("string ids match an INTEGER primary key and deletes are scoped to the tenant", async () => {
    const db = await makeTestDb();
    await migrateTestDb(db);
    await upsertRows(db, "entity_assignment", ASSIGNMENT_COLUMNS, [
      [5, "acme", "e-1", "product", "c-1", "2026-09-14T00:00:00Z", "2026-09-14T00:00:00Z", null],
    ]);
    await upsertRows(db, "entity_assignment", ASSIGNMENT_COLUMNS, [
      [5, "other", "e-2", "product", "c-2", "2026-09-14T00:00:00Z", "2026-09-14T00:00:00Z", null],
    ]);
    await applyDeletes(db, "entity_assignment", ["5"], "acme");
    const acme = await db.getFirstAsync<{ c: number }>(
      "SELECT COUNT(*) AS c FROM entity_assignment WHERE tenant_id = ?", ["acme"]
    );
    const other = await db.getFirstAsync<{ c: number }>(
      "SELECT COUNT(*) AS c FROM entity_assignment WHERE tenant_id = ?", ["other"]
    );
    expect(acme?.c).toBe(0);
    expect(other?.c).toBe(1);
  });

  it("deletes more than 100 ids chunked into multiple statements, scoped to the tenant", async () => {
    const base = await makeTestDb();
    await migrateTestDb(base);
    let deleteCalls = 0;
    const db: LocalDb = {
      ...base,
      async runAsync(source, params) {
        if (source.startsWith("DELETE")) deleteCalls++;
        return base.runAsync(source, params);
      },
    };
    const ids = Array.from({ length: 150 }, (_, i) => `p-${i + 1}`);
    await upsertRows(
      db, "product", PRODUCT_COLUMNS,
      [...ids.map((id) => productRow({ id })), productRow({ id: "kept", tenant_id: "other" })]
    );
    await applyDeletes(db, "product", ids, "acme");
    const remaining = await db.getAllAsync<{ id: string }>("SELECT id FROM product ORDER BY id");
    expect(remaining.map((r) => r.id)).toEqual(["kept"]);
    const other = await db.getFirstAsync<{ c: number }>(
      "SELECT COUNT(*) AS c FROM product WHERE tenant_id = ?", ["other"]
    );
    expect(other?.c).toBe(1);
    expect(deleteCalls).toBeGreaterThanOrEqual(Math.ceil(ids.length / 100));
  });
});