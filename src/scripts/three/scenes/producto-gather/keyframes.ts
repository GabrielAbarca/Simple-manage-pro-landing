// Camera keyframes for the opening, one table per layout, from the three
// Producto.dc.html files. Each row is [progress, camera, lookAt]; between rows
// the camera eases with a smoothstep. Phones frame with `fit` from the aspect,
// tablets with a fixed 0.84 and everything lowered 0.9 to clear the captions.

import type { Layout } from "../../../core/breakpoints";
import { smoothstep } from "../../../core/anim";

export type Vec3 = [number, number, number];
type Keyframe = readonly [progress: number, camera: Vec3, lookAt: Vec3];

const DESKTOP_KEYFRAMES: readonly Keyframe[] = [
  [0, [0, 0, 22], [0, 0, 0]],
  [0.1, [0, 0, 19], [0, 0, 0]],
  [0.24, [-4.2, 0.6, 9.5], [-7.0, 0, -1]],
  [0.34, [-4.0, 0.5, 9.2], [-7.0, 0, -1]],
  [0.42, [1.3, 0.4, 10], [-0.4, 0, 0.2]],
  [0.5, [1.5, 0.3, 9.6], [-0.4, 0, 0.2]],
  [0.58, [5.6, -0.4, 7], [4.2, -0.9, -2]],
  [0.65, [5.8, -0.5, 6.6], [4.2, -0.9, -2]],
  [0.75, [0, 0, 17], [0, 0, 0]],
  [0.9, [0, 0, 12.5], [0, 0, 0]],
  [1, [0, 0, 12], [0, 0, 0]],
];

const COMPACT_VISITS: readonly Keyframe[] = [
  [0, [0, 2.6, 27], [0, 2.6, 0]],
  [0.1, [0, 2.1, 24], [0, 2.1, 0]],
  [0.24, [-1.1, 1.1, 14], [-1.1, 1.1, 0]],
  [0.34, [-1.0, 1.0, 13.5], [-1.1, 1.1, 0]],
  [0.42, [0.15, -1.0, 16.5], [0.15, -1.0, 0]],
  [0.5, [0.25, -1.1, 16], [0.15, -1.0, 0]],
  [0.58, [1.2, -4.0, 10.5], [1.2, -4.0, -1]],
  [0.65, [1.3, -4.1, 10], [1.2, -4.0, -1]],
];

const MOBILE_KEYFRAMES: readonly Keyframe[] = [
  ...COMPACT_VISITS,
  [0.75, [0, -1.0, 22], [0, -1.0, 0]],
  [0.9, [0, -1.3, 19], [0, -1.3, 0]],
  [1, [0, -1.3, 18.5], [0, -1.3, 0]],
];

// Tablet ends closer on the record than the phone does.
const TABLET_KEYFRAMES: readonly Keyframe[] = [
  ...COMPACT_VISITS,
  [0.75, [0, -1.0, 19], [0, -1.0, 0]],
  [0.9, [0, -1.3, 12], [0, -1.3, 0]],
  [1, [0, -1.3, 11.5], [0, -1.3, 0]],
];

export interface Framing {
  keyframes: readonly Keyframe[];
  /** Camera distance divisor: below 1 pulls the camera back. */
  fit: number;
  /** Added to both camera and lookAt y. */
  lift: number;
  /** Landscape desktop: the record lands right of centre, turned towards the copy. */
  wide: boolean;
}

export function framingFor(layout: Layout, aspect: number): Framing {
  if (layout === "desktop") {
    return { keyframes: DESKTOP_KEYFRAMES, fit: Math.max(0.55, Math.min(1, aspect / 1.7)), lift: 0, wide: aspect > 1.1 };
  }
  if (layout === "tablet") return { keyframes: TABLET_KEYFRAMES, fit: 0.84, lift: -0.9, wide: false };
  return { keyframes: MOBILE_KEYFRAMES, fit: Math.min(1, aspect / 0.46), lift: 0, wide: false };
}

/** Where the gathered objects and the record card land. */
export function recordTarget(layout: Layout, wide: boolean): Vec3 {
  if (layout !== "desktop") return [0, 0.9, 0];
  return wide ? [2.6, 0.1, 0] : [0, 1.4, 0];
}

/** Port of `kf`: column 1 is the camera, column 2 the lookAt. */
export function sampleKeyframes(keyframes: readonly Keyframe[], progress: number, column: 1 | 2): Vec3 {
  let i = 0;
  while (i < keyframes.length - 2 && progress > keyframes[i + 1][0]) i++;
  const from = keyframes[i];
  const to = keyframes[i + 1];
  const u = smoothstep((progress - from[0]) / (to[0] - from[0]));
  return [0, 1, 2].map((axis) => from[column][axis] + (to[column][axis] - from[column][axis]) * u) as Vec3;
}
