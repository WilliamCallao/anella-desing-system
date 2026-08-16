// Ported from thinking-orbs by Jakub Antalik (MIT), via expo-thinking-orbs
// (MIT, Mehdi Davoodi). Trimmed to the ribbon ("composing") mode only.
//
// Density profiles + the multiplier machinery that scales them. Only the
// ribbon row survives; the two design sizes (20 / 64) are the ones shipped
// by the original preset table for the "composing" state.

import type { ModeOpts } from "./types";

// 2-D lattices (lanes × segments) come in pairs — each side takes √scale so
// the TOTAL dot count scales by `scale`; flat lists scale linearly.
const COUNT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["latRings", "lonDensity"],
  ["rings", "lonDensity"],
  ["lanes", "segs"],
];
const COUNT_KEYS = ["orbitN", "ghostN"];

// Every key that sets a dot's rendered radius — scaling all of them keeps
// a dot's near/far falloff intact while shrinking or growing the mark.
const RADIUS_KEYS = ["rBase", "rDepth", "rActive", "rDot", "ghostR", "partR", "partRDepth"];

export function scaleCounts(opts: ModeOpts, scale: number): ModeOpts {
  const out: ModeOpts = { ...opts };
  const done = new Set<string>();
  const rt = Math.sqrt(scale);
  for (const [a, b] of COUNT_PAIRS) {
    const va = out[a];
    const vb = out[b];
    if (va != null && vb != null && !done.has(a) && !done.has(b)) {
      out[a] = Math.max(2, Math.round(va * rt));
      out[b] = Math.max(2, Math.round(vb * rt));
      done.add(a);
      done.add(b);
    }
  }
  for (const k of COUNT_KEYS) {
    const v = out[k];
    if (v != null && !done.has(k)) out[k] = Math.max(1, Math.round(v * scale));
  }
  return out;
}

export function scaleRadii(opts: ModeOpts, scale: number): ModeOpts {
  const out: ModeOpts = { ...opts };
  for (const k of RADIUS_KEYS) {
    const v = out[k];
    if (v != null) out[k] = v * scale;
  }
  // Remember the multiplier itself — spacing-derived radii use it.
  out.rSizeMul = (out.rSizeMul ?? 1) * scale;
  return out;
}

/** Base (fine) profile for the ribbon mode, before preset multipliers. */
const BASE_RIBBON: ModeOpts = {
  lanes: 5,
  segs: 88,
  ghostN: 150,
  rBase: 1.1,
  rDepth: 1.7,
  rsPow: 0.6,
  rMin: 0.3,
};

interface RibbonPreset {
  speed: number;
  count: number;
  size: number;
  extra?: ModeOpts;
}

/** The shipped tunings for "composing" at each design size. */
const RIBBON_PRESETS: Record<number, RibbonPreset> = {
  64: {
    speed: 2.34,
    count: 0.25,
    size: 0.85,
    extra: { spin: 0, bandMul: 3.9, wobMul: 1 },
  },
  20: {
    speed: 3.12,
    count: 0.051,
    size: 1.073,
    extra: { spin: 0, bandMul: 4.94, wobMul: 1 },
  },
};

/** Below this rendered size the 20-tuned design reads better. */
const DESIGN_CUTOFF = 36;

/** Snap any rendered size to the nearer tuned design. */
export function pickDesignSize(size: number): number {
  return size >= DESIGN_CUTOFF ? 64 : 20;
}

/** Resolve a design size to its fully-scaled draw options + clock speed. */
export function resolveRibbon(designSize: number): { opts: ModeOpts; speed: number } {
  const preset = RIBBON_PRESETS[designSize];
  let opts: ModeOpts = { ...BASE_RIBBON };
  if (preset.count !== 1) opts = scaleCounts(opts, preset.count);
  if (preset.size !== 1) opts = scaleRadii(opts, preset.size);
  if (preset.extra) opts = { ...opts, ...preset.extra };
  return { opts, speed: preset.speed };
}
