// Ported from thinking-orbs by Jakub Antalik (MIT), via expo-thinking-orbs
// (MIT, Mehdi Davoodi). Trimmed to the ribbon ("composing") mode only.

/** Mode options: numeric, all optional. */
export interface ModeOpts {
  [key: string]: number | undefined;
}

/** Base shape of the time-independent data a mode hoists out of the loop. */
export interface ModeStaticData {
  /** Exact number of dots the mode emits per frame. */
  dotCount: number;
}

/**
 * The per-frame inputs that are NOT fixed by the preset. Passed as one
 * reused object so modes can grow inputs without changing every signature.
 * The ribbon mode only reads `yaw`/`pitch`/`roll`.
 */
export interface ModeDynamics {
  /** Smoothed audio level, 0–1. `0` when no amplitude is being driven. */
  amp: number;
  /** Behaviour index being blended FROM (unused by ribbon). */
  from: number;
  /** Behaviour index being blended TO (unused by ribbon). */
  to: number;
  /** Blend position 0→1 (unused by ribbon). */
  mix: number;
  /** Extra yaw in radians, added to the mode's own rotation. */
  yaw: number;
  /** Extra pitch in radians. */
  pitch: number;
  /** Extra roll in radians about the view axis. */
  roll: number;
}
