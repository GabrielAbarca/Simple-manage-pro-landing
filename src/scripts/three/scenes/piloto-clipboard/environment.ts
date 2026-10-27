// Piloto's own studio, inlined in Piloto.dc.html initThree rather than
// shared: its light panels are tinted Color(a, a, a * 1.05) and its key and
// fill lights differ from core/env.ts and core/studio.ts. Constants are the
// approved values; do not merge this with the shared environment.

import * as THREE from "three";

/** [width, height, x, y, z, brightness] per light panel. */
const LIGHT_PANELS: readonly (readonly [number, number, number, number, number, number])[] = [
  [10, 5, 0, 9, 1, 4],
  [6, 8, -9, 1, 5, 2.6],
  [6, 6, 9, 0, -3, 1.9],
];

function buildStudioScene(): THREE.Scene {
  const studio = new THREE.Scene();
  studio.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(20, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xe6e8f6, side: THREE.BackSide }),
    ),
  );
  for (const [width, height, x, y, z, brightness] of LIGHT_PANELS) {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(brightness, brightness, brightness * 1.05),
        side: THREE.DoubleSide,
      }),
    );
    panel.position.set(x, y, z);
    panel.lookAt(0, 0, 0);
    studio.add(panel);
  }
  return studio;
}

// The baked texture no longer needs the throwaway scene's GPU buffers.
function disposeStudioScene(studio: THREE.Scene): void {
  studio.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    node.geometry.dispose();
    (node.material as THREE.Material).dispose();
  });
}

export function addClipboardLighting(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = buildStudioScene();
  scene.environment = pmrem.fromScene(studio, 0.04).texture;
  pmrem.dispose();
  disposeStudioScene(studio);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd4d8f5, 0.8));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(4, 8, 10);
  scene.add(key);
}
