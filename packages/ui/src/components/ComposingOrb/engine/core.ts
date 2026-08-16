// Ported from thinking-orbs by Jakub Antalik (MIT), via expo-thinking-orbs
// (MIT, Mehdi Davoodi). Trimmed to the ribbon ("composing") mode only.
//
// Shared primitives for the dotted 3D thought-orbs. Every frame-time helper
// here is a Reanimated worklet so it can run on the UI thread inside the
// render loop; the same functions are ordinary JS on the RN thread, so the
// precompute step can call them too.

/** Spin + tilt + orthographic projection of a single point. */
export type Projector = (x: number, y: number, z: number, out: Float32Array) => void;

/** Deterministic hash in [0, 1). */
export function hashD(a: number, b: number): number {
  "worklet";
  const h = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return h - Math.floor(h);
}

/** Stable directions on a unit sphere (Fibonacci lattice). */
export function fibDir(i: number, n: number): [number, number, number] {
  "worklet";
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (2 * (i + 0.5)) / n;
  const rad = Math.sqrt(1 - y * y);
  const a = i * golden;
  return [rad * Math.cos(a), y, rad * Math.sin(a)];
}

/** Shortest signed angular distance, wrapped to (-π, π]. */
export function angleDelta(a: number, b: number): number {
  "worklet";
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

/**
 * Shared spin + tilt + orthographic projection.
 *
 * Three rotations, in order, each independent:
 *   `yaw`  — about the globe's own pole.
 *   `tilt` — about the horizontal screen axis.
 *   `roll` — about the VIEW axis, applied after projecting. Leaves `z`
 *            alone, so the painter's z-sort is unaffected.
 */
export function makeProj(
  yaw: number,
  tilt: number,
  cx: number,
  cy: number,
  scale: number,
  roll = 0,
): Projector {
  "worklet";
  const st = Math.sin(tilt);
  const ct = Math.cos(tilt);
  const sy = Math.sin(yaw);
  const cyw = Math.cos(yaw);
  const sr = Math.sin(roll);
  const cr = Math.cos(roll);
  return (x, y, z, out) => {
    const x1 = x * cyw + z * sy;
    const z1 = -x * sy + z * cyw;
    const y1 = y * ct - z1 * st;
    const z2 = y * st + z1 * ct;
    // Skip the rotation entirely when level — the overwhelmingly common
    // case, and two multiplies per dot per frame is not free at 120 Hz.
    const xr = roll === 0 ? x1 : x1 * cr - y1 * sr;
    const yr = roll === 0 ? y1 : x1 * sr + y1 * cr;
    out[0] = cx + xr * scale;
    out[1] = cy - yr * scale;
    out[2] = z2;
  };
}

/**
 * Dot radii were tuned for a 300pt frame; sub-linear scaling keeps small
 * spinners legible. Lower pow = radii shrink less with size.
 */
export function radiusScale(size: number, pow: number): number {
  "worklet";
  return (size / 300) ** pow;
}
