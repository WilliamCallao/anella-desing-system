import { describe, expect, it, vi } from "vitest";
import { createHttpSyncTransport, SYNC_PAGE_SIZE, type SyncRequest, type SyncRequestOptions, type SyncPage } from "./transport";
import { isRetryableError } from "./errors";

const WIRE_PAGE = {
  items: [{ id: "p-1" }, { id: "p-3" }],
  deleted_ids: ["p-2"],
  next_cursor: "2026-09-15T00:00:00.123456Z",
  has_more: true,
  server_time: "2026-09-15T00:00:00.000000Z",
};

/** request fake que resuelve `wire` (o la rechaza como error boom). */
const okRequest = (wire: unknown = WIRE_PAGE): SyncRequest =>
  vi.fn(async (_opts: SyncRequestOptions) => wire) as unknown as SyncRequest;

const failingRequest = (boom: unknown): SyncRequest =>
  vi.fn(async () => Promise.reject(boom)) as unknown as SyncRequest;

describe("createHttpSyncTransport", () => {
  it("resuelve una página con la forma exacta de SyncPage<T>", async () => {
    const transport = createHttpSyncTransport(okRequest());

    const page = await transport.getChanges<{ id: string }>({ domain: "products" });

    expect(page.items).toEqual([{ id: "p-1" }, { id: "p-3" }]);
    expect(page.deleted_ids).toEqual(["p-2"]);
    expect(page.next_cursor).toBe("2026-09-15T00:00:00.123456Z");
    expect(page.has_more).toBe(true);
    expect(page.server_time).toBe("2026-09-15T00:00:00.000000Z");
  });

  it("envía GET /sync/changes con domain y omite since si es null/undefined", async () => {
    const request = vi.fn(async (_opts: SyncRequestOptions) => WIRE_PAGE);
    const transport = createHttpSyncTransport(request as unknown as SyncRequest);

    await transport.getChanges({ domain: "prices", since: null });
    await transport.getChanges({ domain: "accounts", since: undefined });
    await transport.getChanges({ domain: "journal", since: "2026-09-14T00:00:00Z" });

    const calls = request.mock.calls.map(([opts]) => opts as SyncRequestOptions);
    expect(calls[0]).toMatchObject({ method: "GET", path: "/sync/changes", query: { domain: "prices" } });
    expect(calls[1]).toMatchObject({ query: { domain: "accounts" } });
    expect(calls[2]).toMatchObject({
      query: {
        domain: "journal",
        since: "2026-09-14T00:00:00Z",
      },
    });
  });

  it("no envía page_size: el consumidor usa el default 100 del gateway (v1)", async () => {
    const request = vi.fn(async (_opts: SyncRequestOptions) => WIRE_PAGE);
    const transport = createHttpSyncTransport(request as unknown as SyncRequest);

    await transport.getChanges({ domain: "products", pageSize: 10 });

    const opts = request.mock.calls[0][0] as SyncRequestOptions;
    expect(opts.query).toEqual({ domain: "products" });
    expect(opts.query).not.toHaveProperty("page_size");
    // constante expuesta para el engine: default del gateway (§paginación del doc backend)
    expect(SYNC_PAGE_SIZE).toBe(100);
  });

  it("pasa el next_cursor del wire tal cual (normalización identidad)", async () => {
    const wire = {
      items: [],
      deleted_ids: [],
      next_cursor: "abcdef.next",
      has_more: false,
      server_time: "2026-09-14T00:00:00Z",
    };
    const transport = createHttpSyncTransport(okRequest(wire));

    const page = await transport.getChanges({ domain: "products" });

    expect(page.next_cursor).toBe("abcdef.next");
  });

  it("normaliza items/deleted_ids null como arrays vacíos", async () => {
    const wire = {
      items: null,
      deleted_ids: null,
      next_cursor: "2026-09-15T00:00:00.123456Z",
      has_more: false,
      server_time: "2026-09-15T00:00:00.000000Z",
    };
    const transport = createHttpSyncTransport(okRequest(wire));

    const page = await transport.getChanges<unknown>({ domain: "products" });

    expect(page.items).toEqual([]);
    expect(page.deleted_ids).toEqual([]);
    expect(page.has_more).toBe(false);
  });

  it("propaga el error del client tal cual (no lo envuelve)", async () => {
    const boom = new Error("el gateway falló");
    const transport = createHttpSyncTransport(failingRequest(boom));

    await expect(
      transport.getChanges<unknown>({ domain: "products" })
    ).rejects.toBe(boom);
  });

  it("expone el endpoint del transporte", () => {
    const transport = createHttpSyncTransport(okRequest());
    expect(transport.endpoint).toBe("/sync/changes");
  });
});

describe("isRetryableError", () => {
  it("error estructural { retryable: true } → retryable", () => {
    expect(isRetryableError({ retryable: true, message: "red caída" })).toBe(true);
  });

  it("{ retryable: false } u objeto sin la flag → NO retryable", () => {
    expect(isRetryableError({ retryable: false })).toBe(false);
    expect(isRetryableError({ message: "quieto" })).toBe(false);
  });

  it("no-objetos (string, null, undefined) → NO retryable", () => {
    expect(isRetryableError("boom")).toBe(false);
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
  });

  it("un Error plano → NO retryable", () => {
    expect(isRetryableError(new Error("git off"))).toBe(false);
  });
});