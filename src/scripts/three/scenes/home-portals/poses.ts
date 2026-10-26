// Where the slab stack sits for a given fan progress. Desktop fans the slabs
// out sideways; mobile and tablet stack them vertically below the fan title,
// measured from the live headline and title boxes. Ported from the three
// Home.dc.html files; every constant is theirs.

import type { Layout } from "../../../core/breakpoints";
import { lerp } from "../../core/stage";
import { SLAB } from "./build";

export interface PoseInput {
  fan: number;
  entrance: number;
  timeSeconds: number;
  idle: number;
  pointer: { x: number; y: number };
  visibleWidth: number;
  visibleHeight: number;
  aspect: number;
  stageWidth: number;
  stageHeight: number;
  headlineBottom: number;
  fanTitleBottom: number;
  layout: Layout;
}

export interface StackPose {
  position: [number, number];
  scale: number;
  rotation: [number, number, number];
  slabs: [number, number, number][];
}

function desktopPose(input: PoseInput): StackPose {
  const { fan, entrance, timeSeconds: t, idle, pointer, visibleWidth: visW, visibleHeight: visH, aspect } = input;
  const wide = aspect > 1.15;
  const baseX = wide ? visW * (aspect < 1.9 ? 0.27 : 0.2) : 0;
  const baseY = wide ? -0.1 : -visH * 0.22;
  const baseScale = wide ? Math.min(1, visW / 16.5) : Math.min(0.8, visW / 9);
  const fanScale = Math.min(0.74, visW / 20, visH / 11);
  const separation = lerp(0.6 + Math.sin(t * 1.1) * 0.05 * idle, 2.2, fan) * entrance;
  return {
    position: [
      lerp(baseX, wide ? visW * 0.04 : 0, fan),
      lerp(baseY, -visH * 0.04, fan) - (1 - entrance) * 4 + Math.sin(t * 0.8) * 0.08 * idle * (1 - fan * 0.6),
    ],
    scale: lerp(baseScale, fanScale, fan),
    rotation: [
      lerp(-0.95, -0.16, fan) + pointer.y * 0.08 * idle,
      lerp(0, -0.5, fan) + pointer.x * 0.12 * idle + (1 - entrance) * 0.5,
      lerp(0.55, 0.05, fan),
    ],
    slabs: [0, 1, 2].map((i) => [(i - 1) * 4.6 * fan, (1 - i) * 0.25 * fan, (1 - i) * separation]),
  };
}

/** Width the fanned slab may take: the whole column on phones, capped on tablets. */
function stackedSlabWidthPx(layout: Layout, stageWidth: number): number {
  return layout === "tablet" ? Math.min(stageWidth * 0.72, 760) : stageWidth - 48;
}

function stackedPose(input: PoseInput): StackPose {
  const { fan, entrance, timeSeconds: t, idle, visibleWidth: visW, visibleHeight: visH } = input;
  const { stageWidth: w, stageHeight: h, headlineBottom, fanTitleBottom } = input;
  const pixelsPerUnit = h / visH;
  const baseY = -(((headlineBottom + h) / 2) / h - 0.5) * visH;
  const baseScale = Math.min(0.62, visW / 8.4, (h - headlineBottom) / pixelsPerUnit / 6);
  const top = fanTitleBottom + 24;
  const bottom = h - 16;
  const slot = (bottom - top) / 3;
  const captionReserve = 30;
  const fanScale = Math.max(0.05, Math.min(
    (slot - captionReserve - 12) / pixelsPerUnit / SLAB.height,
    stackedSlabWidthPx(input.layout, w) / pixelsPerUnit / SLAB.width,
  ));
  const spacing = slot / pixelsPerUnit / fanScale;
  const fanY = -(((top + bottom) / 2 - captionReserve / 2) / h - 0.5) * visH;
  const separation = lerp(0.6 + Math.sin(t * 1.1) * 0.05 * idle, 0.15, fan) * entrance;
  return {
    position: [0, lerp(baseY, fanY, fan) - (1 - entrance) * 4 + Math.sin(t * 0.8) * 0.06 * idle * (1 - fan)],
    scale: lerp(baseScale, fanScale, fan),
    rotation: [lerp(-0.95, -0.06, fan), lerp(0, -0.28, fan) + (1 - entrance) * 0.5, lerp(0.55, 0, fan)],
    slabs: [0, 1, 2].map((i) => [0, (1 - i) * spacing * fan, (1 - i) * separation]),
  };
}

export function stackPose(input: PoseInput): StackPose {
  return input.layout === "desktop" ? desktopPose(input) : stackedPose(input);
}
