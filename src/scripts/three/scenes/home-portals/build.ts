// The three portal slabs (admin, teacher, student) for the Home hero. Each is
// a rounded 6.4 x 4 slab with a console texture on its face and a blurred
// drop shadow behind it. Geometry values from Home.dc.html initThree.

import * as THREE from "three";
import { roundedRectShape } from "../../core/geometry";
import { drawShadow } from "../../core/canvas2d";
import { canvasTexture, redrawWhenFontsSettle, type RedrawableTexture } from "../../core/textures";
import { drawAdmin } from "../../textures/home/admin";
import { drawTeacher } from "../../textures/home/teacher";
import { drawStudent } from "../../textures/home/student";

export const SLAB = { width: 6.4, height: 4, radius: 0.3, depth: 0.12 } as const;
const HOME_SHADOW_ALPHA = 0.42;

function faceGeometry(shape: THREE.Shape): THREE.ShapeGeometry {
  const geometry = new THREE.ShapeGeometry(shape, 20);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getX(i) + SLAB.width / 2) / SLAB.width, (position.getY(i) + SLAB.height / 2) / SLAB.height);
  }
  return geometry;
}

function bodyGeometry(shape: THREE.Shape): THREE.ExtrudeGeometry {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: SLAB.depth,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3,
    curveSegments: 20,
  });
  geometry.translate(0, 0, -SLAB.depth / 2);
  return geometry;
}

function shadowPlane(): THREE.Mesh {
  const texture = new THREE.CanvasTexture(drawShadow(HOME_SHADOW_ALPHA));
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(SLAB.width * 1.45, SLAB.height * 1.7), material);
  plane.position.set(0, -0.45, -SLAB.depth / 2 - 0.06);
  return plane;
}

/** Builds the three slabs; returns them in admin, teacher, student order. */
export function buildPortalSlabs(renderer: THREE.WebGLRenderer): THREE.Group[] {
  const shape = roundedRectShape(SLAB.width, SLAB.height, SLAB.radius);
  const body = bodyGeometry(shape);
  const face = faceGeometry(shape);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0 });
  const textures: RedrawableTexture[] = [drawAdmin, drawTeacher, drawStudent].map((draw) => canvasTexture(draw, renderer));
  redrawWhenFontsSettle(textures);
  return textures.map(({ texture }) => {
    const group = new THREE.Group();
    const faceMesh = new THREE.Mesh(face, new THREE.MeshBasicMaterial({ map: texture }));
    faceMesh.position.z = SLAB.depth / 2 + 0.025;
    group.add(shadowPlane(), new THREE.Mesh(body, bodyMaterial), faceMesh);
    return group;
  });
}
