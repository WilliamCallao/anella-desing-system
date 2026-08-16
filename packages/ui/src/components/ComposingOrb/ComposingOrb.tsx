// ComposingOrb — el orb "composing" de thinking-orbs (Jakub Antalik, MIT,
// port vía expo-thinking-orbs, Mehdi Davoodi, MIT), extraído a blanco puro
// con fondo transparente. Sólo conserva el modo ribbon y el LUT de color
// blanco: la profundidad 3D se lee por opacidad y radio de los puntos.
//
// El render loop vive en el UI thread (Skia + Reanimated): React renderiza
// una vez por cambio de props y todo el trabajo por frame corre en el
// worklet de `useDerivedValue`. Pausa el orb con `paused` (por ejemplo,
// cuando la pantalla pierde foco) para no quemar frames de fondo.

import { useEffect, useMemo } from "react";
import { View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { Canvas, Picture } from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from "react-native-reanimated";

import { pickDesignSize, resolveRibbon } from "./engine/profiles";
import { buildRibbon, precomputeRibbon } from "./engine/ribbon";
import { buildSolidLUT, recordPicture, WHITE_LUT } from "./engine/paint";
import { acquireDotBuffer, acquireDynamics } from "./engine/scratch";

// Cap the per-frame delta so a pause/resume or a dropped-frame hitch
// advances the phase by at most a few frames instead of the whole gap —
// the animation continues from its current pose without a visible jump.
const MAX_DT_MS = 100;

// Speed multiplier under reduced motion. The orb keeps animating rather
// than freezing on a still frame, but at a third of the pace.
const REDUCED_SPEED = 0.3;

export interface ComposingOrbProps {
  /** Rendered size in points. Default 64. */
  size?: number;
  /** Freeze the animation (stops the frame callback). */
  paused?: boolean;
  /** Multiplier over the tuned clock speed. Default 1. */
  speed?: number;
  /**
   * Dot color as any RN/Skia color string (e.g. `"#000000"`). Defaults to
   * white — ideal on dark surfaces; use black on light ones.
   */
  color?: string;
  /** Extra rotation in radians, added to the mode's own motion. */
  tilt?: {
    yaw?: number;
    pitch?: number;
    roll?: number;
  };
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /** Optional out-slot that receives the per-frame build cost (ms). */
  debugFrameMs?: { set(value: number): void };
}

/**
 * Drive one composing orb and return its per-frame Skia picture. The
 * picture is recorded with bounds `(0, 0, size, size)`; draw it in a
 * `<Picture>`, offset with a `<Group transform={...}>` when composing
 * several into one canvas.
 */
export function useComposingOrbPicture({
  size = 64,
  speed = 1,
  paused = false,
  tilt,
  color,
  debugFrameMs,
}: Omit<ComposingOrbProps, "style" | "accessibilityLabel"> = {}) {
  const designSize = pickDesignSize(size);
  const resolved = useMemo(() => resolveRibbon(designSize), [designSize]);
  const opts = resolved.opts;
  const rMin = opts.rMin ?? 0.3;
  const staticData = useMemo(() => precomputeRibbon(opts), [opts]);
  const lut = useMemo(() => (color ? buildSolidLUT(color) : WHITE_LUT), [color]);
  const reduced = useReducedMotion();
  const effSpeed = resolved.speed * speed * (reduced ? REDUCED_SPEED : 1);
  const effSpeedSV = useSharedValue(effSpeed);
  useEffect(() => {
    effSpeedSV.set(effSpeed);
  }, [effSpeed, effSpeedSV]);

  // Extra rotation as plain numbers mirrored into SharedValues — worklets
  // can only read SharedValues, not React state.
  const ownYawSV = useSharedValue(0);
  const ownPitchSV = useSharedValue(0);
  const ownRollSV = useSharedValue(0);
  const tYaw = tilt?.yaw;
  const tPitch = tilt?.pitch;
  const tRoll = tilt?.roll;
  useEffect(() => {
    if (typeof tYaw === "number") ownYawSV.set(tYaw);
    if (typeof tPitch === "number") ownPitchSV.set(tPitch);
    if (typeof tRoll === "number") ownRollSV.set(tRoll);
  }, [tYaw, tPitch, tRoll, ownYawSV, ownPitchSV, ownRollSV]);
  const yawSV = typeof tYaw === "number" ? ownYawSV : undefined;
  const pitchSV = typeof tPitch === "number" ? ownPitchSV : undefined;
  const rollSV = typeof tRoll === "number" ? ownRollSV : undefined;

  // -1 marks the phase as unseeded; the next active frame seeds it from
  // the shared frame clock so instances mounted at different times lock.
  const phase = useSharedValue(-1);
  useEffect(() => {
    phase.set(-1);
  }, [designSize, phase]);
  const frame = useFrameCallback((info) => {
    "worklet";
    if (phase.get() < 0) {
      phase.set((info.timestamp / 1000) * effSpeedSV.get());
      return;
    }
    let dt = info.timeSincePreviousFrame ?? 0;
    if (dt > MAX_DT_MS) dt = MAX_DT_MS;
    phase.set(phase.get() + (dt / 1000) * effSpeedSV.get());
  }, false);
  useEffect(() => {
    // Reduced motion slows the clock; it does not stop it. Only `paused`
    // stops the clock.
    frame.setActive(!paused);
  }, [paused, frame]);

  const dotCount = staticData.dotCount;
  return useDerivedValue(() => {
    const t = Math.max(0, phase.get());
    const perf = globalThis.performance;
    const timed = debugFrameMs != null && perf != null;
    const t0 = timed ? perf.now() : 0;
    const buf = acquireDotBuffer(dotCount);
    const dyn = acquireDynamics(
      0,
      0,
      0,
      1,
      reduced || yawSV == null ? 0 : yawSV.get(),
      reduced || pitchSV == null ? 0 : pitchSV.get(),
      reduced || rollSV == null ? 0 : rollSV.get(),
    );
    buildRibbon(buf, size, t, opts, staticData, dyn);
    const pic = recordPicture(buf, size, lut, rMin);
    if (timed && debugFrameMs != null) {
      debugFrameMs.set(perf.now() - t0);
    }
    return pic;
  }, [opts, staticData, dotCount, size, rMin, reduced, debugFrameMs, lut]);
}

export function ComposingOrb({
  size = 64,
  style,
  accessibilityLabel,
  ...rest
}: ComposingOrbProps) {
  const picture = useComposingOrbPicture({ size, ...rest });
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? "Composing…"}
      style={[{ width: size, height: size }, style]}
    >
      <Canvas style={{ width: size, height: size }}>
        <Picture picture={picture} />
      </Canvas>
    </View>
  );
}
