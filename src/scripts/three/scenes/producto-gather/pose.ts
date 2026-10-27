import { clamp01, smoothstep } from "../../../core/anim";
import { lerp } from "../../core/stage";
import type { Vec3 } from "./keyframes";
import type { GatherObject, LayoutSlot, RecordCard } from "./objects";

export interface GatherFrame {
  progress: number;
  timeSeconds: number;
  idle: number;
  target: Vec3;
  recordRotation: Vec3;
  exit: number;
}

export const easeHover = (current: number, hovered: boolean): number => current + ((hovered ? 1 : 0) - current) * 0.12;

interface ObjectMotion {
  gathered: number;
  spread: number;
  lift: number;
  float: number;
  wobble: number;
}

function objectMotion(object: GatherObject, slot: LayoutSlot, frame: GatherFrame): ObjectMotion {
  const { progress: p, timeSeconds: t, idle: k } = frame;
  const phase = slot.index * 1.3;
  const gathered = smoothstep((p - 0.72 - slot.index * 0.012) / 0.13);
  return {
    gathered,
    spread: 1 - smoothstep(p / 0.14),
    lift: object.hover * (1 - gathered),
    float: Math.sin(t * 0.8 + phase) * 0.12 * k * (1 - gathered),
    wobble: Math.sin(t * 0.6 + phase) * 0.05 * k * (1 - gathered),
  };
}

export function placeObject(object: GatherObject, slot: LayoutSlot, frame: GatherFrame, hovered: boolean): void {
  const { target, recordRotation: rr } = frame;
  object.hover = easeHover(object.hover, hovered);
  const { gathered, spread, lift, float, wobble } = objectMotion(object, slot, frame);
  const [x, y, z] = slot.position;
  object.root.position.set(
    lerp(x * (1 + 0.3 * spread), target[0], gathered),
    lerp(y * (1 + 0.3 * spread) + float, target[1], gathered),
    lerp(z - 3 * spread + lift * 0.9, target[2] - 0.1 - slot.index * 0.07, gathered),
  );
  const [rx, ry, rz] = object.rotation;
  object.root.rotation.set(
    lerp((rx + wobble) * (1 - lift * 0.7), rr[0], gathered),
    lerp(ry * (1 - lift * 0.7), rr[1], gathered),
    lerp((rz - wobble) * (1 - lift * 0.5), rr[2], gathered),
  );
  const fitScale = Math.min(4.8 / object.width, 3.2 / object.height) * 0.94;
  object.root.scale.setScalar(lerp(1, fitScale, gathered) * (1 + lift * 0.1));
  fadeObject(object, 1 - clamp01((frame.progress - 0.84) / 0.05));
}

function fadeObject(object: GatherObject, opacity: number): void {
  object.fades.forEach((entry) => { entry.material.opacity = entry.base * opacity; });
  object.root.visible = opacity > 0.002;
}

export function placeRecord(record: RecordCard, frame: GatherFrame, hovered: boolean): void {
  const { timeSeconds: t, idle: k, target, recordRotation: rr } = frame;
  const shown = clamp01((frame.progress - 0.83) / 0.06);
  record.hover = easeHover(record.hover, hovered);
  record.root.visible = shown > 0.002;
  record.root.position.set(
    target[0],
    target[1] + Math.sin(t * 0.8) * 0.06 * k * shown,
    target[2] - (1 - shown) * 0.6 + record.hover * 0.5 - frame.exit * 3,
  );
  record.root.rotation.set(rr[0] * (1 - record.hover * 0.6), rr[1] * (1 - record.hover * 0.6), rr[2]);
  record.root.scale.setScalar((0.92 + 0.08 * smoothstep(shown)) * (1 + record.hover * 0.06));
  record.fades.forEach((entry) => { entry.material.opacity = entry.base * shown; });
}
