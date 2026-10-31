import { describe, expect, it } from "vitest";
import {
  FULLBOTTOM_DIVISOR_H,
  SECTION_DEFAULT_COLORS,
  bottomOverflows,
  bottomViewport,
  computeSectionTargets,
  fullBottomTransitionDuration,
  initialNaturals,
  isValidMeasurement,
  layoutStates,
  resolveLayoutState,
  seedNaturals,
  selectPageBackground,
  shouldResetScroll,
  writeNaturals,
  type LayoutState,
  type SectionHeights,
} from "./layoutMath";

const H = 800;

const heights = (top: number, mid: number, bottom: number): SectionHeights => ({
  top,
  mid,
  bottom,
});

describe("resolveLayoutState", () => {
  it("resuelve un preset por nombre", () => {
    expect(resolveLayoutState("bottom")).toBe(layoutStates.bottom);
  });

  it("devuelve el estado custom tal cual", () => {
    const custom: LayoutState = {
      sections: { top: { visible: false }, mid: { visible: true }, bottom: { visible: false } },
    };
    expect(resolveLayoutState(custom)).toBe(custom);
  });
});

describe("isValidMeasurement", () => {
  it("rechaza 0, negativos y no finitos", () => {
    expect(isValidMeasurement(0)).toBe(false);
    expect(isValidMeasurement(-32)).toBe(false);
    expect(isValidMeasurement(Number.NaN)).toBe(false);
    expect(isValidMeasurement(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("acepta medidas positivas, incluso chicas (header colapsado 110, artefacto 32)", () => {
    expect(isValidMeasurement(32)).toBe(true);
    expect(isValidMeasurement(110)).toBe(true);
    expect(isValidMeasurement(2203)).toBe(true);
  });
});

describe("computeSectionTargets", () => {
  it("onlyCenter: el mid llena la pantalla y no hay divisor de bottom", () => {
    const t = computeSectionTargets(layoutStates.onlyCenter, initialNaturals(H), H);
    expect(t).toEqual({ top: 0, mid: H, bottom: 0 });
  });

  it("bottom: mid = natural del header, bottom = max(natural, resto bajo el header)", () => {
    // Header chico (110) → el bottom rellena H - 110.
    const small = computeSectionTargets(layoutStates.bottom, heights(0, 110, 300), H);
    expect(small.mid).toBe(110);
    expect(small.bottom).toBe(Math.max(300, H - 110));

    // Lista larga (2000) → el bottom crece con el contenido, sin cola artificial.
    const large = computeSectionTargets(layoutStates.bottom, heights(0, 110, 2000), H);
    expect(large.bottom).toBe(2000);
  });

  it("bottom: NO infla el alto con colas artificiales (regresión BODY_TAIL)", () => {
    const t = computeSectionTargets(layoutStates.bottom, heights(0, 110, 200), H);
    // Antes: max(natural, H) + 600. Ahora: exactamente el resto bajo el header.
    expect(t.bottom).toBe(H - 110);
    expect(t.bottom).toBeLessThan(H + 1);
  });

  it("fullBottom: contrae la hoja por el alto del divisor superior", () => {
    const t = computeSectionTargets(layoutStates.fullBottom, heights(0, 0, H), H);
    expect(t.bottom).toBe(H - FULLBOTTOM_DIVISOR_H);
  });

  it("fullBottom: la hoja llena la pantalla como mínimo y scrollea con el page", () => {
    const state = layoutStates.fullBottom;
    expect(state.pageScroll).toBe(true);
    expect(state.sections.bottom?.height).toBe("minFillRest");
    expect(state.sections.bottom?.scroll).not.toBe(true);
    expect(computeSectionTargets(state, heights(0, 0, 10), H).bottom).toBe(
      H - FULLBOTTOM_DIVISOR_H,
    );
  });

  it("fullBottom: nunca deja el bottom negativo", () => {
    const contentState: LayoutState = {
      pageScroll: false,
      sections: {
        top: { visible: false },
        mid: { visible: false },
        bottom: { visible: true, height: "content", slot: "footer" },
      },
    };
    const t = computeSectionTargets(contentState, heights(0, 0, 10), H);
    expect(t.bottom).toBe(0);
  });

  it("fullBottom: el neutro inicial del bottom es la ventana, no un tercio", () => {
    expect(initialNaturals(H, layoutStates.fullBottom).bottom).toBe(H);
    expect(initialNaturals(H).bottom).toBe(H / 3);
  });

  it("top: fillRest descuenta el natural de la sección ancla y la oculta queda en 0", () => {
    const t = computeSectionTargets(layoutStates.top, heights(200, 600, 0), H);
    expect(t.top).toBe(200);
    expect(t.mid).toBe(H - 200);
    expect(t.bottom).toBe(0);
  });

  it("secciones invisibles siempre 0 aunque tengan natural medido", () => {
    const custom: LayoutState = {
      sections: {
        top: { visible: false },
        mid: { visible: true, height: "content" },
        bottom: { visible: false },
      },
    };
    const t = computeSectionTargets(custom, heights(999, 777, 999), H);
    expect(t).toEqual({ top: 0, mid: 777, bottom: 0 });
  });

  it("un cambio de header recalcula de forma determinista con los nuevos naturales", () => {
    // Simula entrar a una categoría: el header pasa de 264 a 110 y el resultado
    // debe encogerse exactamente, sin arrastrar el valor previo.
    const before = computeSectionTargets(layoutStates.bottom, heights(0, 264, 300), H);
    const after = computeSectionTargets(layoutStates.bottom, heights(0, 110, 300), H);
    expect(before.mid).toBe(264);
    expect(after.mid).toBe(110);
    expect(after.bottom).toBe(H - 110);
  });
});

describe("selectPageBackground", () => {
  it("bottom: el mid (header claro) manda sobre la hoja oscura (sin corte en los morphs)", () => {
    expect(selectPageBackground(layoutStates.bottom)).toBe(SECTION_DEFAULT_COLORS.mid);
  });

  it("onlyCenter: el mid es la última visible → fondo claro", () => {
    expect(selectPageBackground(layoutStates.onlyCenter)).toBe(SECTION_DEFAULT_COLORS.mid);
  });

  it("fullBottom (sin mid): cae al color de la hoja oscura", () => {
    expect(selectPageBackground(layoutStates.fullBottom)).toBe(SECTION_DEFAULT_COLORS.bottom);
  });

  it("sin secciones visibles cae al fondo por defecto", () => {
    const empty: LayoutState = {
      sections: { top: { visible: false }, mid: { visible: false }, bottom: { visible: false } },
    };
    expect(selectPageBackground(empty)).toBe(selectPageBackground(layoutStates.onlyCenter));
  });

  it("respeta un backgroundColor custom del mid cuando está visible", () => {
    const custom: LayoutState = {
      sections: {
        top: { visible: true, backgroundColor: "#111111" },
        mid: { visible: true, backgroundColor: "#222222" },
        bottom: { visible: false },
      },
    };
    expect(selectPageBackground(custom)).toBe("#222222");
  });
});

describe("bottomViewport / bottomOverflows", () => {
  it("el viewport del bottom es H menos el ancla (header)", () => {
    expect(bottomViewport(layoutStates.bottom, heights(0, 300, 0), H)).toBe(H - 300);
  });

  it("sin ancla el viewport es H", () => {
    expect(bottomViewport(layoutStates.fullBottom, heights(0, 0, 0), H)).toBe(H);
  });

  it("detecta overflow solo cuando el contenido supera el viewport visible", () => {
    expect(bottomOverflows(layoutStates.bottom, heights(0, 300, H - 300 + 1), H)).toBe(true);
    expect(bottomOverflows(layoutStates.bottom, heights(0, 300, 10), H)).toBe(false);
  });
});

describe("fullBottomTransitionDuration", () => {
  it("header completamente visible: usa la ventana completa", () => {
    expect(
      fullBottomTransitionDuration(layoutStates.bottom, layoutStates.fullBottom, 240, 0, 300),
    ).toBe(300);
  });

  it("header a medio scroll: acorta la ventana a la parte visible", () => {
    expect(
      fullBottomTransitionDuration(layoutStates.bottom, layoutStates.fullBottom, 240, 120, 300),
    ).toBe(150);
  });

  it("header ya fuera de pantalla: no hay morph de cabecera", () => {
    expect(
      fullBottomTransitionDuration(layoutStates.bottom, layoutStates.fullBottom, 240, 240, 300),
    ).toBe(0);
    expect(
      fullBottomTransitionDuration(layoutStates.bottom, layoutStates.fullBottom, 240, 500, 300),
    ).toBe(0);
  });

  it("otros cambios de estado conservan la ventana completa", () => {
    expect(
      fullBottomTransitionDuration(layoutStates.fullBottom, layoutStates.bottom, 240, 120, 300),
    ).toBe(300);
  });
});

describe("shouldResetScroll", () => {
  it("resetea al cambiar de ruta", () => {
    expect(shouldResetScroll("catalogo", "accounts")).toBe(true);
    expect(shouldResetScroll(null, "home")).toBe(true);
  });

  it("NO resetea cuando el nombre de ruta es el mismo (cambio de contenido intra-ruta)", () => {
    expect(shouldResetScroll("catalogo", "catalogo")).toBe(false);
  });
});

describe("seedNaturals / writeNaturals (snapshot por ruta)", () => {
  it("siembra una ruta nunca vista con el neutro, NO con los naturales de otra ruta", () => {
    const snap = new Map<string, SectionHeights>();
    // La ruta previa tenía un header grande (264); el neutro es una derivación de
    // la ventana. No debe quedar vestigio del header grande.
    const neutral = initialNaturals(H);
    const seeded = seedNaturals(snap, "catalogo", neutral);
    expect(seeded).toEqual(neutral);
    expect(seeded.mid).not.toBe(264);
  });

  it("al volver a una ruta ya vista usa su snapshot exacto (header igual al volver)", () => {
    const snap = new Map<string, SectionHeights>();
    writeNaturals(snap, "accounts", heights(0, 110, 400));
    writeNaturals(snap, "catalogo", heights(0, 264, 2000));
    // El neutro no debe pisar el snapshot de accounts.
    const seeded = seedNaturals(snap, "accounts", initialNaturals(H));
    expect(seeded).toEqual(heights(0, 110, 400));
    // Y es una copia, no la misma referencia del snapshot.
    seeded.mid = 1;
    expect(snap.get("accounts")?.mid).toBe(110);
  });

  it("writeNaturals guarda una copia (no una referencia viva)", () => {
    const snap = new Map<string, SectionHeights>();
    const live = heights(0, 100, 200);
    writeNaturals(snap, "home", live);
    live.mid = 999;
    expect(snap.get("home")?.mid).toBe(100);
  });
});
