import { describe, expect, it, vi } from "vitest";
import type { BellBump } from "../core/bell";
import {
  createSyncRuntime,
  type RuntimeClock,
  type RuntimePullResult,
  type RuntimeSession,
  type RuntimeBellSource,
  type RuntimeIdentity,
  type RuntimeQueryCache,
  type SyncRuntimeConfig,
} from "./syncRuntime";

/** Sesión fake: pull/bootstrap registran llamadas y devuelven resultados dados. */
class FakeSession implements RuntimeSession {
  readonly domains: string[];
  readonly close = vi.fn(async () => {});
  readonly getLastBell = vi.fn(async (_domain: string) => this.lastBell);
  readonly setLastBell = vi.fn(async (_domain: string, version: number) => {
    this.lastBell = Math.max(this.lastBell, version);
  });
  readonly pull = vi.fn(async (domain: string): Promise<RuntimePullResult> => this.pullResults[domain] ?? {
    domain,
    items: 1,
    deleted: 0,
    cursor: `c${this.pullCount}`,
    ok: true,
    fresh: true,
  });
  readonly bootstrap = vi.fn(async (): Promise<RuntimePullResult[]> =>
    this.domains.map((domain) => this.pullResults[domain] ?? {
      domain,
      items: 1,
      deleted: 0,
      cursor: "b",
      ok: true,
      fresh: true,
    })
  );

  lastBell = 0;
  pullCount = 0;

  constructor(domains: string[] = ["products", "prices", "journal"], pullResults: Record<string, RuntimePullResult> = {}) {
    this.domains = [...domains];
    this.pullResults = pullResults;
    this.pull.mockImplementation(async (domain: string) => {
      const r = this.pullResults[domain] ?? {
        domain,
        items: 1,
        deleted: 0,
        cursor: `c${this.pullCount}`,
        ok: true,
        fresh: true,
      };
      this.pullCount += 1;
      return r;
    });
  }

  private readonly pullResults: Record<string, RuntimePullResult>;

  get closeCalls(): number {
    return this.close.mock.calls.length;
  }
}

class FakeIdentity implements RuntimeIdentity {
  status: "signedOut" | "signedIn" = "signedOut";
  tenant: string | null = null;
  getStatus = () => this.status;
  getTenantId = () => this.tenant;
  signIn(tenant: string): void {
    this.status = "signedIn";
    this.tenant = tenant;
  }
  signOut(): void {
    this.status = "signedOut";
    this.tenant = null;
  }
}

class FakeBellSource implements RuntimeBellSource {
  readonly listeners = new Map<string, Set<(bump: BellBump) => void>>();
  readonly unsubscribed = new Set<string>();
  subscribe(tenantId: string | null, cb: (bump: BellBump) => void): () => void {
    if (!tenantId) {
      return () => {};
    }
    const set = this.listeners.get(tenantId) ?? new Set();
    set.add(cb);
    this.listeners.set(tenantId, set);
    return () => {
      set.delete(cb);
      if (this.unsubscribed) this.unsubscribed.add(tenantId);
      if (set.size === 0) this.listeners.delete(tenantId);
    };
  }
  emit(tenantId: string, bump: BellBump): void {
    for (const cb of this.listeners.get(tenantId) ?? []) cb(bump);
  }
}

class FakeClock implements RuntimeClock {
  intervalCb: (() => void) | null = null;
  cleared = false;
  foregroundCb: (() => void) | null = null;
  setInterval(cb: () => void): unknown {
    this.intervalCb = cb;
    return 1;
  }
  clearInterval(): void {
    this.cleared = true;
  }
  firePoll(): void {
    this.intervalCb?.();
  }
  onForeground(cb: () => void): () => void {
    this.foregroundCb = cb;
    return () => {
      this.foregroundCb = null;
    };
  }
  fireForeground(): void {
    this.foregroundCb?.();
  }
}

class FakeQueryCache implements RuntimeQueryCache {
  readonly invalidated: string[] = [];
  clearCalls = 0;
  invalidate(domain: string): void {
    this.invalidated.push(domain);
  }
  clear(): void {
    this.clearCalls += 1;
  }
}

class Harness {
  readonly identity = new FakeIdentity();
  readonly bell = new FakeBellSource();
  readonly clock = new FakeClock();
  readonly queryCache = new FakeQueryCache();
  readonly opened: string[] = [];
  readonly closed: { tenant?: string; cleanData?: boolean }[] = [];
  readonly sessions: FakeSession[] = [];
  failOpens = false;
  allowSessionsAfter: string | null = null;
  runtime = createSyncRuntime(this.config());

  private config(): SyncRuntimeConfig {
    const harness = this;
    return {
      identity: harness.identity,
      queryCache: harness.queryCache,
      bellSource: harness.bell,
      clock: harness.clock,
      pollIntervalMs: 100,
      async openSession(tenant: string): Promise<RuntimeSession> {
        if (harness.failOpens) throw new Error("open failed");
        const session = new FakeSession();
        harness.opened.push(tenant);
        harness.sessions.push(session);
        return session;
      },
      async closeSession(session: RuntimeSession, opts?: { cleanData?: boolean }): Promise<void> {
        const tenant = harness.sessions.indexOf(session as FakeSession);
        harness.closed.push({ tenant: tenant >= 0 ? harness.opened[tenant] : undefined, cleanData: opts?.cleanData });
        await session.close();
      },
    };
  }

  latestSession(): FakeSession | null {
    return this.sessions[this.sessions.length - 1] ?? null;
  }
}

const DEFAULT_DOMAINS = ["products", "prices", "journal"];

describe("createSyncRuntime", () => {
  it("abre la sesión tras signIn y bootstrapea los dominios", async () => {
    const h = new Harness();
    h.runtime.start();
    expect(h.opened).toEqual([]);

    h.identity.signIn("t1");
    h.runtime.syncIdentity();
    await vi.waitFor(() => expect(h.sessions.length).toBe(1));

    const snap = h.runtime.getSnapshot();
    expect(snap.tenantId).toBe("t1");
    expect(snap.session).not.toBeNull();
    expect(h.sessions[0].domains).toEqual(DEFAULT_DOMAINS);
    await vi.waitFor(() => expect(Object.keys(h.runtime.getSnapshot().lastResults)).toEqual(DEFAULT_DOMAINS));
  });

  it("signOut cierra la sesión limpiando los datos locales y el cache de queries", async () => {
    const h = new Harness();
    h.identity.signIn("t1");
    h.runtime.start();
    await vi.waitFor(() => expect(h.sessions.length).toBe(1));

    h.identity.signOut();
    h.runtime.syncIdentity();
    await vi.waitFor(() => expect(h.runtime.getSnapshot().session).toBeNull());

    expect(h.closed).toContainEqual({ tenant: "t1", cleanData: true });
    expect(h.queryCache.clearCalls).toBeGreaterThanOrEqual(1);
  });

  it("cambio de tenant cierra el anterior con limpieza y abre el nuevo", async () => {
    const h = new Harness();
    h.identity.signIn("t1");
    h.runtime.start();
    await vi.waitFor(() => expect(h.sessions.length).toBe(1));

    h.identity.signIn("t2");
    h.runtime.syncIdentity();
    await vi.waitFor(() => expect(h.sessions.length).toBe(2));

    expect(h.opened).toEqual(["t1", "t2"]);
    expect(h.closed[0]).toEqual({ tenant: "t1", cleanData: true });
    expect(h.queryCache.clearCalls).toBeGreaterThanOrEqual(1);
    expect(h.runtime.getSnapshot().tenantId).toBe("t2");
  });

  it("una apertura fallida no deja sesión y el poll la reintenta con backoff", async () => {
    const h = new Harness();
    h.identity.signIn("t1");
    h.failOpens = true;
    h.runtime.start();
    await vi.waitFor(() => expect(h.sessions.length).toBe(0));
    expect(h.runtime.getSnapshot().session).toBeNull();

    h.failOpens = false;
    h.clock.firePoll();
    await vi.waitFor(() => expect(h.sessions.length).toBe(1));
    expect(h.runtime.getSnapshot().tenantId).toBe("t1");
  });

  it("la campana dispara pull, invalida el dominio y persiste el last_bell monótono", async () => {
    const h = new Harness();
    h.identity.signIn("t1");
    h.runtime.start();
    await vi.waitFor(() => expect(h.sessions.length).toBe(1));
    const session = h.latestSession()!;

    h.bell.emit("t1", { domain: "prices", version: 5 });
    await vi.waitFor(() => expect(session.pull).toHaveBeenCalledWith("prices"));
    expect(session.setLastBell).toHaveBeenCalledWith("prices", 5);
    expect(h.queryCache.invalidated).toContain("prices");

    const pullsAfterFirst = session.pullCount;
    h.bell.emit("t1", { domain: "prices", version: 5 });
    await vi.waitFor(() => expect(session.pullCount).toBe(pullsAfterFirst));

    h.bell.emit("t1", { domain: "prices", version: 6 });
    await vi.waitFor(() => expect(session.pullCount).toBe(pullsAfterFirst + 1));
    expect(session.lastBell).toBe(6);
  });

  it("bump de dominio no suscrito se ignora", async () => {
    const h = new Harness();
    h.identity.signIn("t1");
    h.runtime.start();
    await vi.waitFor(() => expect(h.sessions.length).toBe(1));
    const session = h.latestSession()!;

    h.bell.emit("t1", { domain: "stock", version: 9 });
    await vi.waitFor(() => expect(session.pull).not.toHaveBeenCalledWith("stock"));
  });

  it("stop cierra la sesión sin limpiar datos, desuscribe la campana y corta el poll", async () => {
    const h = new Harness();
    h.identity.signIn("t1");
    h.runtime.start();
    await vi.waitFor(() => expect(h.sessions.length).toBe(1));
    expect(h.bell.listeners.has("t1")).toBe(true);

    h.runtime.stop();

    expect(h.closed).toContainEqual({ tenant: "t1", cleanData: false });
    expect(h.clock.cleared).toBe(true);
    expect(h.bell.listeners.has("t1")).toBe(false);
  });

  it("refreshDomain devuelve null sin sesión y settleBump cuenta por dominio", async () => {
    const h = new Harness();
    h.runtime.start();
    expect(await h.runtime.refreshDomain("products")).toBeNull();

    h.identity.signIn("t1");
    h.runtime.syncIdentity();
    await vi.waitFor(() => expect(h.sessions.length).toBe(1));

    expect(h.runtime.settleBump("products")).toBe(1);
    expect(h.runtime.settleBump("products")).toBe(2);
    expect(h.runtime.settleBump("prices")).toBe(1);
  });
});