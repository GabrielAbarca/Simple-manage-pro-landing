// Producto's two scenes share one light rig (initThree and initPortal in
// Producto.dc.html): the PMREM studio environment, a soft hemisphere fill and
// one key light. Brighter fill and a different key than Home's studio.ts.

import * as THREE from "three";
import { makeEnvironment } from "../core/env";
import type { Stage } from "../core/stage";

export function addProductoLighting(stage: Stage): void {
  stage.scene.environment = makeEnvironment(stage.renderer);
  stage.scene.add(new THREE.HemisphereLight(0xffffff, 0xd4d8f5, 0.8));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(4, 8, 10);
  stage.scene.add(key);
}

/** Producto's canvas faces use Poppins italics too (sticky notes, attendance list). */
export const PRODUCTO_FONT_WEIGHTS = ["400", "500", "600", "700", "800"];
export const PRODUCTO_FONT_STYLES = ["italic 500", "italic 600", "italic 700"];
