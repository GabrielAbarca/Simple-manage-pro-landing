// Producto portals scene: a sticky full-viewport layer behind the panels in
// which the database, the gradebook and the student phone follow their DOM
// anchors. Panel distances come from the page's DOM loop (portal-dom.ts).
// Desktop only: hovering an object (outside the live UI) lifts and flattens
// it. From Producto.dc.html initPortal.

import * as THREE from "three";
import { currentLayout } from "../../core/breakpoints";
import type { ProductoMotion } from "../../producto/motion-state";
import { createStage, startFrameLoop } from "../core/stage";
import { hoveredIndex, type StagePointer } from "../core/studio";
import { loadPoppins } from "../core/textures";
import { PRODUCTO_FONT_STYLES, PRODUCTO_FONT_WEIGHTS, addProductoLighting } from "./producto-lighting";
import { buildPortalObjects, type PortalObject } from "./producto-portals/build";
import { placePortalObject } from "./producto-portals/placement";

const CAMERA_Z = 14;
const HALF_HEIGHT = Math.tan((15 * Math.PI) / 180) * CAMERA_Z;

interface Anchors {
  cluster: HTMLElement;
  wide: HTMLElement[];
  compact: HTMLElement[];
}

function findAnchors(section: HTMLElement): Anchors | null {
  const cluster = section.querySelector<HTMLElement>('[data-portal-anchor="cluster"]');
  if (!cluster) return null;
  return {
    cluster,
    wide: [...section.querySelectorAll<HTMLElement>('[data-portal-anchor="wide"]')],
    compact: [...section.querySelectorAll<HTMLElement>('[data-portal-anchor="compact"]')],
  };
}

/**
 * Pointer over the stage in NDC. The stage sits under the panels, so events
 * come from the section; over a live UI block the objects are not hoverable.
 */
function trackPortalPointer(section: HTMLElement, stage: HTMLElement): StagePointer {
  const pointer: StagePointer = { position: new THREE.Vector2(), inside: false };
  section.addEventListener("pointermove", (event) => {
    if (currentLayout() !== "desktop") return;
    const rect = stage.getBoundingClientRect();
    pointer.position.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1));
    pointer.inside = !(event.target as Element).closest("[data-panel-ui]");
  });
  section.addEventListener("pointerleave", () => { pointer.inside = false; });
  return pointer;
}

/** Port of `toW`: a viewport point to world x/y on the z=0 plane. */
function worldMapper(stage: HTMLElement, camera: THREE.PerspectiveCamera) {
  const rect = stage.getBoundingClientRect();
  const halfWidth = HALF_HEIGHT * camera.aspect;
  return (x: number, y: number): [number, number] => [
    ((x - rect.left) / rect.width * 2 - 1) * halfWidth,
    -((y - rect.top) / rect.height * 2 - 1) * HALF_HEIGHT,
  ];
}

interface SceneParts {
  stage: HTMLElement;
  section: HTMLElement;
  camera: THREE.PerspectiveCamera;
  objects: PortalObject[];
  anchors: Anchors;
  pointer: StagePointer;
  raycaster: THREE.Raycaster;
}

function pickHovered(parts: SceneParts): PortalObject | null {
  const visible = parts.objects.filter((object) => object.holder.visible);
  const index = hoveredIndex(parts.raycaster, parts.pointer, parts.camera, visible.map((object) => object.holder));
  parts.section.style.cursor = index >= 0 ? "pointer" : "";
  return index >= 0 ? visible[index] : null;
}

function placeObjects(parts: SceneParts, motion: ProductoMotion, now: number): void {
  const layout = currentLayout();
  const panels = motion.panels;
  const toWorld = worldMapper(parts.stage, parts.camera);
  const clusterRect = parts.anchors.cluster.getBoundingClientRect();
  const cluster = toWorld(clusterRect.left, clusterRect.top);
  const hovered = pickHovered(parts);
  const anchors = layout === "desktop" ? parts.anchors.wide : parts.anchors.compact;
  parts.objects.forEach((object, i) => {
    const anchor = anchors[i];
    const panel = panels[i + 1];
    if (!anchor || !panel) return;
    object.hover += ((hovered === object ? 1 : 0) - object.hover) * 0.12;
    placePortalObject(object, {
      layout, index: i, introDistance: panels[0].distance, panelDistance: panel.distance, cluster,
      anchorRect: anchor.getBoundingClientRect(), toWorld, viewportHeight: innerHeight,
      timeSeconds: now / 1000, idle: motion.intensity, pointer: motion.pointer,
    }, HALF_HEIGHT);
  });
}

export async function startProductoPortals(container: HTMLElement, section: HTMLElement, motion: ProductoMotion): Promise<void> {
  const anchors = findAnchors(section);
  if (!anchors || !motion.panels.length) return;
  await loadPoppins(PRODUCTO_FONT_WEIGHTS, PRODUCTO_FONT_STYLES);
  const stage = createStage(container, { fov: 30 });
  stage.camera.position.set(0, 0, CAMERA_Z);
  addProductoLighting(stage);
  const objects = buildPortalObjects(stage.renderer);
  objects.forEach((object) => stage.scene.add(object.holder));
  const parts: SceneParts = {
    stage: container, section, camera: stage.camera, objects, anchors,
    pointer: trackPortalPointer(section, container), raycaster: new THREE.Raycaster(),
  };
  startFrameLoop((now) => {
    placeObjects(parts, motion, now);
    stage.renderer.render(stage.scene, stage.camera);
  }, () => !motion.portalsOffscreen);
}
