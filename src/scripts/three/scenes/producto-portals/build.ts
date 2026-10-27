// The three portal objects from Producto.dc.html initPortal: a database of
// three white cylinders with periwinkle bands and green LEDs (Administración),
// a brand-blue gradebook with a cream page block (Docente), and a dark phone
// showing the student's grades (Estudiante). Each hangs in a holder group
// with its own blurred drop shadow.

import * as THREE from "three";
import { productoSlab } from "../../core/geometry";
import { PRODUCTO_SHADOW_ALPHA, drawShadow } from "../../core/canvas2d";
import { canvasTexture, redrawWhenFontsSettle } from "../../core/textures";
import { drawGradebook } from "../../textures/producto/gradebook";
import { drawStudentPhone } from "../../textures/producto/student-phone";

type Vec3 = [number, number, number];

export interface PortalObject {
  /** Positioned and scaled each frame; holds the shadow and the body. */
  holder: THREE.Group;
  /** Rotated each frame. */
  body: THREE.Object3D;
  rotation: Vec3;
  scale: number;
  hover: number;
}

const whiteBody = () => new THREE.MeshPhysicalMaterial({
  color: 0xffffff, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.15, envMapIntensity: 0.9,
});

function buildDatabase(): THREE.Group {
  const database = new THREE.Group();
  const band = new THREE.MeshPhysicalMaterial({ color: 0x7380ec, emissive: 0x7380ec, emissiveIntensity: 0.25, roughness: 0.3, clearcoat: 1 });
  const led = new THREE.MeshBasicMaterial({ color: 0x41f1b6 });
  for (let i = 0; i < 3; i++) {
    const y = (i - 1) * 0.66;
    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.52, 72), whiteBody());
    cylinder.position.y = y;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.012, 1.012, 0.07, 72), band);
    ring.position.y = y - 0.13;
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), led);
    light.position.set(Math.sin(0.5) * 0.99, y + 0.07, Math.cos(0.5) * 0.99);
    database.add(cylinder, ring, light);
  }
  return database;
}

function buildGradebook(brand: THREE.Material, face: THREE.Texture): THREE.Group {
  const gradebook = new THREE.Group();
  const pages = new THREE.Mesh(new THREE.BoxGeometry(1.86, 2.46, 0.3), new THREE.MeshStandardMaterial({ color: 0xf7f5ef, roughness: 0.9 }));
  pages.position.x = 0.05;
  const front = productoSlab(2.0, 2.6, 0.08, 0.04, brand, new THREE.MeshBasicMaterial({ map: face }), 0.015, 0);
  front.position.z = 0.19;
  const back = productoSlab(2.0, 2.6, 0.08, 0.04, brand, brand, 0.015, 0);
  back.position.z = -0.19;
  back.rotation.y = Math.PI;
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.6, 0.44), brand);
  spine.position.x = -0.97;
  gradebook.add(pages, front, back, spine);
  return gradebook;
}

function buildPhone(face: THREE.Texture): THREE.Group {
  const dark = new THREE.MeshPhysicalMaterial({ color: 0x2a2d3a, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1 });
  return productoSlab(1.26, 2.6, 0.22, 0.12, dark, new THREE.MeshBasicMaterial({ map: face }), 0.03, 0.06);
}

/** Port of `holder(body, sw, sh, sy)`: a shadow plane 1.4 behind the body. */
function holder(body: THREE.Object3D, shadowTexture: THREE.Texture, size: Vec3): THREE.Group {
  const [width, height, y] = size;
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.55 });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  shadow.position.set(0, y, -1.4);
  shadow.raycast = () => {};
  group.add(shadow, body);
  return group;
}

/** Builds the three objects in panel order: database, gradebook, phone. */
export function buildPortalObjects(renderer: THREE.WebGLRenderer): PortalObject[] {
  const gradebookFace = canvasTexture(drawGradebook, renderer);
  const phoneFace = canvasTexture(drawStudentPhone, renderer);
  redrawWhenFontsSettle([gradebookFace, phoneFace]);
  const shadowTexture = new THREE.CanvasTexture(drawShadow(PRODUCTO_SHADOW_ALPHA));
  const brand = new THREE.MeshPhysicalMaterial({ color: 0x5a69e9, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 1 });
  const database = buildDatabase();
  const gradebook = buildGradebook(brand, gradebookFace.texture);
  const phone = buildPhone(phoneFace.texture);
  return [
    { holder: holder(database, shadowTexture, [3, 3.2, -0.4]), body: database, rotation: [0.34, 0.5, 0], scale: 0.82, hover: 0 },
    { holder: holder(gradebook, shadowTexture, [2.8, 3.6, -0.3]), body: gradebook, rotation: [-0.12, 0.42, 0.1], scale: 0.78, hover: 0 },
    { holder: holder(phone, shadowTexture, [2.2, 3.6, -0.3]), body: phone, rotation: [-0.08, -0.4, -0.12], scale: 0.82, hover: 0 },
  ];
}
