// The clipboard group from Piloto.dc.html initThree: blurred drop shadow,
// brand board, the "Solicitud Piloto 2027" sheet, metal clip and hinge, and
// the pen. Piloto's slab is its own (4 bevel / 16 curve segments, one
// material, returns a Mesh), so it is inlined here rather than borrowed from
// core/geometry.ts. Every size and position is the approved value.

import * as THREE from "three";
import { context2d, createCanvas, roundRect } from "../../core/canvas2d";
import { roundedRectShape } from "../../core/geometry";
import { canvasTexture, redrawWhenFontsSettle } from "../../core/textures";
import { drawForm } from "../../textures/piloto/form";

interface ClipboardMaterials {
  brand: THREE.MeshPhysicalMaterial;
  ink: THREE.MeshPhysicalMaterial;
  metal: THREE.MeshPhysicalMaterial;
}

function createMaterials(): ClipboardMaterials {
  return {
    brand: new THREE.MeshPhysicalMaterial({ color: 0x5a69e9, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 1 }),
    ink: new THREE.MeshPhysicalMaterial({ color: 0x2a2d3a, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1 }),
    metal: new THREE.MeshPhysicalMaterial({ color: 0xdfe2ea, metalness: 1, roughness: 0.22, envMapIntensity: 1.2 }),
  };
}

function pilotoSlab(width: number, height: number, radius: number, depth: number, material: THREE.Material, bevel: number): THREE.Mesh {
  const geometry = new THREE.ExtrudeGeometry(roundedRectShape(width, height, radius), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 16,
  });
  geometry.translate(0, 0, -depth / 2);
  return new THREE.Mesh(geometry, material);
}

function buildShadow(): THREE.Mesh {
  const canvas = createCanvas(512, 512);
  const ctx = context2d(canvas);
  ctx.filter = "blur(34px)";
  roundRect(ctx, "rgba(70,80,180,0.38)", 92, 110, 328, 300, 40);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 6.4),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false, opacity: 0.6 }),
  );
  shadow.position.set(0.1, -0.5, -0.9);
  return shadow;
}

function buildPaper(renderer: THREE.WebGLRenderer): THREE.Mesh {
  const sheet = canvasTexture(drawForm, renderer);
  renderer.initTexture(sheet.texture);
  redrawWhenFontsSettle([sheet]);
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 3.95),
    new THREE.MeshStandardMaterial({
      map: sheet.texture,
      roughness: 0.85,
      emissive: 0xffffff,
      emissiveMap: sheet.texture,
      emissiveIntensity: 0.35,
      envMapIntensity: 0.6,
    }),
  );
  paper.position.set(0, -0.12, 0.086);
  return paper;
}

function buildClipAndHinge({ metal }: ClipboardMaterials): THREE.Object3D[] {
  const clip = pilotoSlab(1.4, 0.6, 0.14, 0.08, metal, 0.03);
  clip.position.set(0, 2.0, 0.17);
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 32), metal);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 2.2, 0.26);
  return [clip, hinge];
}

function buildPen({ brand, ink, metal }: ClipboardMaterials): THREE.Group {
  const pen = new THREE.Group();
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, y: number, rotationX = 0) => {
    const part = new THREE.Mesh(geometry, material);
    part.position.y = y;
    if (rotationX) part.rotation.x = rotationX;
    pen.add(part);
    return part;
  };
  add(new THREE.CylinderGeometry(0.09, 0.09, 2.2, 40), ink, 0);
  add(new THREE.CylinderGeometry(0.085, 0.068, 0.36, 40), metal, -1.28);
  add(new THREE.ConeGeometry(0.068, 0.22, 40), metal, -1.57, Math.PI);
  add(new THREE.CylinderGeometry(0.092, 0.092, 0.2, 40), brand, 1.2);
  add(new THREE.SphereGeometry(0.092, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), brand, 1.3);
  const pocketClip = add(new THREE.BoxGeometry(0.05, 0.95, 0.035), metal, 0.72);
  pocketClip.position.z = 0.11;
  pen.rotation.z = -0.6;
  pen.position.set(0.55, -0.4, 0.2);
  return pen;
}

export function buildClipboard(renderer: THREE.WebGLRenderer): THREE.Group {
  const materials = createMaterials();
  const clipboard = new THREE.Group();
  clipboard.add(buildShadow());
  clipboard.add(pilotoSlab(3.4, 4.5, 0.24, 0.1, materials.brand, 0.03));
  clipboard.add(buildPaper(renderer));
  clipboard.add(...buildClipAndHinge(materials));
  clipboard.add(buildPen(materials));
  return clipboard;
}
