// Producto opening scene: eight scattered "problem" objects (four below
// 1200px) visited by a keyframed camera, then gathered into one SMP student
// record. Reads progress, pointer and exit from the page's DOM loop.
// Desktop only: hovering an object lifts and flattens it. From
// Producto.dc.html initThree.

import * as THREE from "three";
import { clamp01, easeOutExpo } from "../../core/anim";
import { currentLayout } from "../../core/breakpoints";
import type { ProductoMotion } from "../../producto/motion-state";
import { compileInSteps, createStage, startFrameLoop } from "../core/stage";
import { hoveredIndex, trackStagePointer, type StagePointer } from "../core/studio";
import { loadPoppins, yieldToMain } from "../core/textures";
import { PRODUCTO_FONT_STYLES, PRODUCTO_FONT_WEIGHTS, addProductoLighting } from "./producto-lighting";
import { framingFor, recordTarget, sampleKeyframes, type Vec3 } from "./producto-gather/keyframes";
import { buildGatherScene, type GatherObject, type GatherScene } from "./producto-gather/objects";
import { placeObject, placeRecord, type GatherFrame } from "./producto-gather/pose";

const ENTRANCE_MS = 1800;

interface SceneParts {
  camera: THREE.PerspectiveCamera;
  built: GatherScene;
  pointer: StagePointer;
  raycaster: THREE.Raycaster;
  sticky: HTMLElement;
}

/** Positions the camera from the layout's keyframes; returns the record pose for this frame. */
function aimCamera(camera: THREE.PerspectiveCamera, motion: ProductoMotion, now: number): Pick<GatherFrame, "target" | "recordRotation"> {
  const layout = currentLayout();
  const { keyframes, fit, lift, wide } = framingFor(layout, camera.aspect);
  const k = motion.intensity;
  const m = motion.pointer;
  const entrance = Number.isFinite(motion.entranceStartMs) ? easeOutExpo(clamp01((now - motion.entranceStartMs) / ENTRANCE_MS)) : 0;
  const cam = sampleKeyframes(keyframes, motion.progress, 1);
  const look = sampleKeyframes(keyframes, motion.progress, 2);
  camera.position.set(
    look[0] + (cam[0] - look[0]) / fit + m.x * 0.5 * k,
    look[1] + lift + (cam[1] - look[1]) / fit - m.y * 0.35 * k,
    look[2] + (cam[2] - look[2]) / fit + (1 - entrance) * 6,
  );
  camera.lookAt(look[0], look[1] + lift, look[2]);
  const recordRotation: Vec3 = [-0.06 + m.y * 0.08 * k, (wide ? -0.2 : 0) + m.x * 0.15 * k, 0];
  return { target: recordTarget(layout, wide), recordRotation };
}

/** The object or record under the pointer (desktop only), or null. */
function pickHovered(parts: SceneParts): THREE.Object3D | null {
  const { objects, record } = parts.built;
  const candidates = objects.filter((object) => object.root.visible).map((object) => object.root);
  if (record.root.visible) candidates.push(record.root);
  const index = hoveredIndex(parts.raycaster, parts.pointer, parts.camera, candidates);
  parts.sticky.style.cursor = index >= 0 ? "pointer" : "";
  return index >= 0 ? candidates[index] : null;
}

function placeAll(objects: GatherObject[], frame: GatherFrame, hovered: THREE.Object3D | null): void {
  const compact = currentLayout() !== "desktop";
  objects.forEach((object) => {
    const slot = compact ? object.compact : object.wide;
    if (!slot) {
      object.root.visible = false;
      return;
    }
    placeObject(object, slot, frame, hovered === object.root);
  });
}

function renderFrame(stage: { renderer: THREE.WebGLRenderer; scene: THREE.Scene }, parts: SceneParts, motion: ProductoMotion, now: number): void {
  const pose = aimCamera(parts.camera, motion, now);
  const hovered = pickHovered(parts);
  const frame: GatherFrame = {
    progress: motion.progress, timeSeconds: now / 1000, idle: motion.intensity, exit: motion.exit, ...pose,
  };
  placeAll(parts.built.objects, frame, hovered);
  placeRecord(parts.built.record, frame, hovered === parts.built.record.root);
  stage.renderer.render(stage.scene, parts.camera);
}

export async function startProductoGather(container: HTMLElement, sticky: HTMLElement, motion: ProductoMotion): Promise<void> {
  await loadPoppins(PRODUCTO_FONT_WEIGHTS, PRODUCTO_FONT_STYLES);
  const stage = createStage(container, { fov: 34 });
  stage.camera.far = 200;
  stage.camera.updateProjectionMatrix();
  await yieldToMain();
  addProductoLighting(stage);
  const built = await buildGatherScene(stage.renderer);
  built.objects.forEach((object) => stage.scene.add(object.root));
  stage.scene.add(built.record.root);
  await compileInSteps(stage.renderer, stage.scene, stage.camera);
  const parts: SceneParts = {
    camera: stage.camera, built, sticky, pointer: trackStagePointer(sticky), raycaster: new THREE.Raycaster(),
  };
  startFrameLoop((now) => renderFrame(stage, parts, motion, now), () => !motion.openingOffscreen);
}
