// Piloto's own light rig: tinted panels and a different key and fill than core/env.ts and
// core/studio.ts. Approved values; do not merge with the shared environment.
import * as THREE from "three";

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
