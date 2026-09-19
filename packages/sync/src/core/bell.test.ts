import { describe, expect, it } from "vitest";
import { BELL_DEBOUNCE_MS, BellDebouncer, BellGate, bellShouldPull, parseBellSnapshot, type BellBump, type TimerFn } from "./bell";

// `subscribeBell` (RTDB) NO se testea en Node: depende de Firebase Realtime
// Database (adaptador del consumidor). Queda como smoke manual en Expo Go.

/** Harness de timers manual: agenda jobs inyectables y los dispara a demanda. */
function makeTimerHarness() {
  interface Job { cb: () => void; cancelled: boolean; fired: boolean }
  const jobs: Job[] = [];
  const setTimer: TimerFn = (cb) => {
    const job = { cb, cancelled: false, fired: false };
    jobs.push(job);
    return () => {
      job.cancelled = true;
    };
  };
  const pendingCount = () => jobs.filter((j) => !j.cancelled && !j.fired).length;
  const fireAll = () => {
    for (const job of jobs) {
      if (job.cancelled) continue;
      job.fired = true;
      job.cb();
    }
  };
  return { setTimer, jobs, pendingCount, fireAll };
}

describe("bellShouldPull", () => {
  it("next > prev → pull", () => {
    expect(bellShouldPull(0, 1)).toBe(true);
    expect(bellShouldPull(5, 10)).toBe(true);
    expect(bellShouldPull(0, 0.5)).toBe(true);
  });

  it("next === prev → no pull", () => {
    expect(bellShouldPull(5, 5)).toBe(false);
    expect(bellShouldPull(0, 0)).toBe(false);
  });

  it("next < prev → no pull", () => {
    expect(bellShouldPull(10, 5)).toBe(false);
    expect(bellShouldPull(5, 0)).toBe(false);
  });

  it("(0, cualquier) → true si el bump avanza desde la versión 0 inicial", () => {
    expect(bellShouldPull(0, 1)).toBe(true);
    expect(bellShouldPull(0, 42)).toBe(true);
  });

  it("versiones negativas coherentes (comparación pura)", () => {
    expect(bellShouldPull(-5, -3)).toBe(true);
    expect(bellShouldPull(-3, -5)).toBe(false);
    expect(bellShouldPull(-1, -1)).toBe(false);
  });
});

describe("BellGate", () => {
  it("primera versión para un dominio → true (es nueva)", () => {
    const gate = new BellGate();
    expect(gate.seen("products", 5)).toBe(true);
  });

  it("misma versión repetida → false", () => {
    const gate = new BellGate();
    expect(gate.seen("products", 5)).toBe(true);
    expect(gate.seen("products", 5)).toBe(false);
  });

  it("versión menor que la conocida → false", () => {
    const gate = new BellGate();
    gate.seen("products", 5);
    expect(gate.seen("products", 3)).toBe(false);
  });

  it("versión mayor → true y actualiza el máximo", () => {
    const gate = new BellGate();
    gate.seen("products", 5);
    expect(gate.seen("products", 7)).toBe(true);
    expect(gate.seen("products", 6)).toBe(false);
    expect(gate.seen("products", 7)).toBe(false);
  });

  it("aislamiento entre dominios: un dominio no afecta al otro", () => {
    const gate = new BellGate();
    expect(gate.seen("products", 5)).toBe(true);
    expect(gate.seen("prices", 5)).toBe(true);
    expect(gate.seen("products", 4)).toBe(false);
    expect(gate.seen("prices", 6)).toBe(true);
  });
});

describe("parseBellSnapshot", () => {
  it("objeto { domain: { version, wrote_at } } → BellBump[]", () => {
    const val = {
      products: { version: 12, wrote_at: "2026-09-17T00:00:00Z" },
      "selling-units": { version: 3 },
    };
    expect(parseBellSnapshot(val)).toEqual([
      { domain: "products", version: 12 },
      { domain: "selling-units", version: 3 },
    ]);
  });

  it("nodo sin version → omitido", () => {
    expect(parseBellSnapshot({ products: { wrote_at: "2026-09-17T00:00:00Z" } })).toEqual([]);
  });

  it("version inválido (string, null, 0, negativo, NaN, Infinity) → omitido", () => {
    const val = {
      a: { version: "abc" },
      b: { version: null },
      c: { version: 0 },
      d: { version: -4 },
      e: { version: NaN },
      f: { version: Infinity },
    };
    expect(parseBellSnapshot(val)).toEqual([]);
  });

  it("valores no-object (null, undefined, número) → []", () => {
    expect(parseBellSnapshot(null)).toEqual([]);
    expect(parseBellSnapshot(undefined)).toEqual([]);
    expect(parseBellSnapshot(42)).toEqual([]);
  });

  it("objeto vacío → []", () => {
    expect(parseBellSnapshot({})).toEqual([]);
  });

  it("junk (array, string) → []", () => {
    expect(parseBellSnapshot([])).toEqual([]);
    expect(parseBellSnapshot("x")).toEqual([]);
    // un nodo de dominio que no es objeto (array / número) también se omite
    expect(parseBellSnapshot({ products: [1, 2] })).toEqual([]);
    expect(parseBellSnapshot({ accounts: 5 })).toEqual([]);
  });
});

describe("BellDebouncer", () => {
  it("bump único → 1 emisión con su versión al vencer la ventana", () => {
    const emitted: BellBump[] = [];
    const timer = makeTimerHarness();
    const deb = new BellDebouncer((b) => emitted.push(b), BELL_DEBOUNCE_MS, timer.setTimer);
    deb.push("products", 7);
    expect(timer.jobs).toHaveLength(1);
    expect(emitted).toHaveLength(0); // la ventana aún no venció
    timer.fireAll();
    expect(emitted).toEqual([{ domain: "products", version: 7 }]);
    expect(timer.pendingCount()).toBe(0);
  });

  it("varios bumps del mismo dominio en la ventana → 1 emisión con la MAYOR versión y 1 solo timer", () => {
    const emitted: BellBump[] = [];
    const timer = makeTimerHarness();
    const deb = new BellDebouncer((b) => emitted.push(b), BELL_DEBOUNCE_MS, timer.setTimer);
    deb.push("products", 3);
    deb.push("products", 9);
    deb.push("products", 5); // menor a la acumulada: no cambia el máximo
    expect(timer.jobs).toHaveLength(1);
    timer.fireAll();
    expect(emitted).toEqual([{ domain: "products", version: 9 }]);
  });

  it("bumps de dominios distintos → emisiones separadas", () => {
    const emitted: BellBump[] = [];
    const timer = makeTimerHarness();
    const deb = new BellDebouncer((b) => emitted.push(b), BELL_DEBOUNCE_MS, timer.setTimer);
    deb.push("products", 1);
    deb.push("prices", 2);
    deb.push("products", 5);
    expect(timer.jobs).toHaveLength(2);
    timer.fireAll();
    expect(emitted).toEqual([
      { domain: "products", version: 5 },
      { domain: "prices", version: 2 },
    ]);
  });

  it("dispose() antes de vencer → 0 emisiones y timers cancelados", () => {
    const emitted: BellBump[] = [];
    const timer = makeTimerHarness();
    const deb = new BellDebouncer((b) => emitted.push(b), BELL_DEBOUNCE_MS, timer.setTimer);
    deb.push("products", 7);
    deb.dispose();
    expect(timer.pendingCount()).toBe(0);
    expect(timer.jobs[0]!.cancelled).toBe(true);
    timer.jobs[0]!.cb(); // un job cancelado que igualmente se dispare no emite
    expect(emitted).toHaveLength(0);
  });
});