// Port of `makeEnv` from design_handoff_smp_landing/design/desktop/{Home,Producto}.dc.html
// (identical in both). The panel sizes, positions and over-range colours are the
// approved studio lighting, so constants must not be "tidied". Piloto inlines a
// slightly different variant of its own; this is not that one.

import * as THREE from "three";

type EnvironmentPanel = readonly [
  width: number,
  height: number,
  x: number,
  y: number,
  z: number,
  color: THREE.Color,
];

function addLightPanel(scene: THREE.Scene, [width, height, x, y, z, color]: EnvironmentPanel): void {
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }),
  );
  panel.position.set(x, y, z);
  panel.lookAt(0, 0, 0);
  scene.add(panel);
}

function buildStudioScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(20, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xe6e8f6, side: THREE.BackSide }),
    ),
  );
  addLightPanel(scene, [10, 5, 0, 9, 1, new THREE.Color(4, 4, 4)]);
  addLightPanel(scene, [6, 8, -9, 1, 5, new THREE.Color(2.6, 2.6, 2.8)]);
  addLightPanel(scene, [6, 6, 9, 0, -3, new THREE.Color(1.8, 1.9, 2.8)]);
  return scene;
}

// The prototype never freed the throwaway studio scene. Its GPU buffers are
// released here once baked; the returned texture does not depend on them.
function disposeStudioScene(scene: THREE.Scene): void {
  scene.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    node.geometry.dispose();
    (node.material as THREE.Material).dispose();
  });
}

export function makeEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = buildStudioScene();
  const environment = pmrem.fromScene(studio, 0.04).texture;
  pmrem.dispose();
  disposeStudioScene(studio);
  return environment;
}
