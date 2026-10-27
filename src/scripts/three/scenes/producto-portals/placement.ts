// Where each portal object sits for a frame, ported from the loop in
// Producto.dc.html initPortal. In the intro all three cluster around the
// intro anchor (offsets CL); as panel 01 approaches, object 0 travels to its
// own anchor, and 1 and 2 jump to theirs once the intro has passed. The gate
// `g` scales an object in and out around its panel: desktop measures the
// panel's distance, phones and tablets the anchor's.

import type { Layout } from "../../../core/breakpoints";
import { smoothstep } from "../../../core/anim";
import { lerp } from "../../core/stage";
import type { PortalObject } from "./build";

type Vec3 = [number, number, number];

const CLUSTER_OFFSETS: Record<"wide" | "compact", readonly Vec3[]> = {
  wide: [[0.15, 0.1, 0.3], [-2.0, 1.3, -0.8], [2.0, -1.05, -0.4]],
  compact: [[0.1, 0.9, 0.3], [-0.95, -0.4, -0.8], [0.95, -1.4, -0.4]],
};

/** Phones show the objects a little smaller; tablets and desktop at full size. */
const LAYOUT_SCALE: Record<Layout, number> = { desktop: 1, tablet: 1.0, mobile: 0.85 };

export interface PlacementInput {
  layout: Layout;
  index: number;
  /** Intro panel's and this object's panel distance from the viewport centre. */
  introDistance: number;
  panelDistance: number;
  /** World x/y of the intro anchor, and the object's anchor rect top/left in px. */
  cluster: [number, number];
  anchorRect: DOMRect;
  toWorld: (x: number, y: number) => [number, number];
  viewportHeight: number;
  timeSeconds: number;
  idle: number;
  pointer: { x: number; y: number };
}

interface Travel {
  /** 0 in the cluster, 1 at the panel anchor. */
  follow: number;
  anchor: [number, number];
  gate: number;
}

function travel(input: PlacementInput): Travel {
  const { layout, index, introDistance: dI, panelDistance: pd, anchorRect: r, viewportHeight: vh } = input;
  const follow = index === 0 ? smoothstep(-dI / 0.95) : dI < -0.95 ? 1 : 0;
  if (layout === "desktop") {
    // Desktop anchors ride 72% of their distance from the viewport centre.
    const anchor = input.toWorld(r.left, vh / 2 + (r.top - vh / 2) * 0.72);
    const gate = follow > 0 ? smoothstep((pd + 1.35) / 0.4) * (index === 0 ? 1 : smoothstep((1.2 - pd) / 0.45)) : 1;
    return { follow, anchor, gate };
  }
  const anchorDistance = (r.top - vh / 2) / vh;
  const gate = follow > 0 ? smoothstep((anchorDistance + 0.85) / 0.35) * (index === 0 ? 1 : smoothstep((0.85 - anchorDistance) / 0.35)) : 1;
  return { follow, anchor: input.toWorld(r.left, r.top), gate };
}

/** Places, scales and turns one object; hides it when gated out or far off screen. */
export function placePortalObject(object: PortalObject, input: PlacementInput, halfHeight: number): void {
  const { index: i, idle: k, timeSeconds: t, pointer: m } = input;
  const { follow: f, anchor, gate } = travel(input);
  const offset = CLUSTER_OFFSETS[input.layout === "desktop" ? "wide" : "compact"][i];
  const distance = lerp(input.introDistance, input.panelDistance, f);
  const flatten = 1 - object.hover * 0.7;
  const y = lerp(input.cluster[1] + offset[1], anchor[1], f) + Math.sin(t * 0.8 + i * 1.7) * 0.1 * k;
  object.holder.position.set(lerp(input.cluster[0] + offset[0], anchor[0], f), y, lerp(offset[2], 0, f) + object.hover * 0.6);
  const scale = LAYOUT_SCALE[input.layout] * object.scale * lerp(0.74, 1, f) * gate * (0.9 + 0.1 * Math.min(1, k)) * (1 + object.hover * 0.08);
  object.holder.visible = scale > 0.01 && Math.abs(y) < halfHeight * 1.8;
  object.holder.scale.setScalar(Math.max(0.0001, scale));
  const [rx, ry, rz] = object.rotation;
  object.body.rotation.set(
    rx * flatten + m.y * 0.1 * k + distance * 0.45 * k,
    ry * flatten + distance * 0.6 * k + Math.sin(t * 0.5 + i) * 0.12 * k * flatten + m.x * 0.15 * k,
    rz * flatten,
  );
}
