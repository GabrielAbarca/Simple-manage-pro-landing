// The lit "studio" the Home security/contact scenes share (the prototypes'
// makeStage): a PMREM room environment for the clearcoat materials, a soft
// hemisphere fill and one key light. Plus the stage-local pointer that drives
// desktop hover raycasts.

import * as THREE from "three";
import { currentLayout } from "../../core/breakpoints";
import { makeEnvironment } from "./env";
import type { Stage } from "./stage";

export function addStudioLighting(stage: Stage): void {
  stage.scene.environment = makeEnvironment(stage.renderer);
  stage.scene.add(new THREE.HemisphereLight(0xffffff, 0xd4d8f5, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(4, 9, 7);
  stage.scene.add(key);
}

export interface StagePointer {
  position: THREE.Vector2;
  inside: boolean;
}

/**
 * Pointer in normalised device coordinates over `element`. Hover and
 * click-to-act are desktop-only in the design, so on mobile and tablet the
 * pointer never reports itself inside.
 */
export function trackStagePointer(element: HTMLElement): StagePointer {
  const pointer: StagePointer = { position: new THREE.Vector2(), inside: false };
  element.addEventListener("pointermove", (event) => {
    if (currentLayout() !== "desktop") return;
    const rect = element.getBoundingClientRect();
    pointer.position.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1));
    pointer.inside = true;
  });
  element.addEventListener("pointerleave", () => { pointer.inside = false; });
  return pointer;
}

/** Index of the item whose object tree contains the first ray hit, or -1. */
export function hoveredIndex(
  raycaster: THREE.Raycaster,
  pointer: StagePointer,
  camera: THREE.Camera,
  objects: THREE.Object3D[],
): number {
  if (!pointer.inside) return -1;
  raycaster.setFromCamera(pointer.position, camera);
  const hit = raycaster.intersectObjects(objects, true)[0];
  if (!hit) return -1;
  return objects.findIndex((root) => {
    for (let node: THREE.Object3D | null = hit.object; node; node = node.parent) if (node === root) return true;
    return false;
  });
}
