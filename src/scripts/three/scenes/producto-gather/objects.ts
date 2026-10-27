// The opening's "problem" objects and the SMP record they gather into, from
// Producto.dc.html initThree. Cards are Producto slabs with canvas faces;
// paper is a curled plane lit by its own texture. Desktop shows all eight;
// phones and tablets keep four (sheet 0, attendance list, phone, report card)
// at their own positions, so every object carries both slots.

import * as THREE from "three";
import { productoSlab } from "../../core/geometry";
import { PRODUCTO_SHADOW_ALPHA, drawShadow } from "../../core/canvas2d";
import { canvasTexture, redrawWhenFontsSettle, yieldToMain, type RedrawableTexture } from "../../core/textures";
import { drawSheet } from "../../textures/producto/sheet";
import { drawAttendance } from "../../textures/producto/attendance";
import { drawPhone } from "../../textures/producto/phone-chat";
import { drawReport } from "../../textures/producto/report";
import { STICKY_NOTE_PRESETS, drawSticky } from "../../textures/producto/sticky";
import { drawRecord } from "../../textures/producto/record";
import type { Vec3 } from "./keyframes";

export interface LayoutSlot {
  /** Position in that layout's object list; drives the gather stagger and depth order. */
  index: number;
  position: Vec3;
}

interface FadingMaterial {
  material: THREE.Material;
  base: number;
}

export interface GatherObject {
  root: THREE.Group;
  width: number;
  height: number;
  rotation: Vec3;
  wide: LayoutSlot;
  compact: LayoutSlot | null;
  fades: FadingMaterial[];
  hover: number;
}

export interface RecordCard {
  root: THREE.Group;
  fades: FadingMaterial[];
  hover: number;
}

interface BuildContext {
  shadowTexture: THREE.Texture;
  texture: (draw: () => HTMLCanvasElement) => THREE.Texture;
}

const noRaycast = () => {};

const whiteBody = () => new THREE.MeshPhysicalMaterial({
  color: 0xffffff, roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.2, envMapIntensity: 0.9, transparent: true,
});

const darkBody = () => new THREE.MeshPhysicalMaterial({
  color: 0x2a2d3a, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1, transparent: true,
});

function addShadow(ctx: BuildContext, group: THREE.Group, width: number, height: number, z: number): THREE.Group {
  const material = new THREE.MeshBasicMaterial({ map: ctx.shadowTexture, transparent: true, depthWrite: false, opacity: 0.75 });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width * 1.5, height * 1.6), material);
  shadow.position.set(0, -height * 0.1, z);
  shadow.raycast = noRaycast;
  group.add(shadow);
  return group;
}

/** Port of `card(w, h, r, d, body, tx, inset)`. */
function card(ctx: BuildContext, size: Vec3, depth: number, body: THREE.Material, draw: () => HTMLCanvasElement, inset = 0) {
  const [width, height, radius] = size;
  const face = new THREE.MeshBasicMaterial({ map: ctx.texture(draw), transparent: true });
  return addShadow(ctx, productoSlab(width, height, radius, depth, body, face, 0.03, inset), width, height, -depth / 2 - 0.22);
}

/** Port of `paper(w, h, curl, tx)`: the right edge curls up, the bottom corner a little more. */
function paper(ctx: BuildContext, width: number, height: number, curl: number, draw: () => HTMLCanvasElement) {
  const geometry = new THREE.PlaneGeometry(width, height, 32, 8);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const u = position.getX(i) / width + 0.5;
    const v = position.getY(i) / height + 0.5;
    position.setZ(i, curl * u * u + curl * 0.35 * Math.pow(1 - v, 3) * u);
  }
  geometry.computeVertexNormals();
  const map = ctx.texture(draw);
  const material = new THREE.MeshStandardMaterial({
    map, roughness: 0.85, side: THREE.DoubleSide, transparent: true,
    emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.35, envMapIntensity: 0.6,
  });
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geometry, material));
  return addShadow(ctx, group, width, height, -0.25);
}

interface ObjectDef {
  build: (ctx: BuildContext) => THREE.Group;
  size: [number, number];
  rotation: Vec3;
  wide: Vec3;
  compact: Vec3 | null;
}

const [stickyOne, stickyTwo] = STICKY_NOTE_PRESETS;

const OBJECT_DEFS: readonly ObjectDef[] = [
  { build: (c) => card(c, [3.3, 2.28, 0.12], 0.06, whiteBody(), () => drawSheet(0)), size: [3.3, 2.28], rotation: [0.1, 0.35, 0.06], wide: [-5.6, 2.3, -0.5], compact: [-1.1, 2.7, 0] },
  { build: (c) => card(c, [3.3, 2.28, 0.12], 0.06, whiteBody(), () => drawSheet(1)), size: [3.3, 2.28], rotation: [-0.12, 0.28, -0.05], wide: [-3.0, -1.6, 1.2], compact: null },
  { build: (c) => card(c, [3.3, 2.28, 0.12], 0.06, whiteBody(), () => drawSheet(2)), size: [3.3, 2.28], rotation: [0.05, 0.5, 0.1], wide: [-7.4, -1.2, -3.2], compact: null },
  { build: (c) => paper(c, 2.25, 3.0, 0.35, drawAttendance), size: [2.25, 3.0], rotation: [0.15, -0.3, 0.12], wide: [3.4, 2.1, -0.8], compact: [1.3, 0.9, -0.8] },
  { build: (c) => card(c, [1.5, 3.0, 0.26], 0.16, darkBody(), drawPhone, 0.07), size: [1.5, 3.0], rotation: [-0.1, -0.25, -0.12], wide: [1.2, -1.9, 1.6], compact: [-1.0, -1.0, 1.0] },
  { build: (c) => paper(c, 2.4, 3.2, -0.3, drawReport), size: [2.4, 3.2], rotation: [0.08, -0.45, -0.08], wide: [6.6, -0.9, -2.0], compact: [1.2, -2.9, -1.0] },
  { build: (c) => paper(c, 1.2, 1.2, 0.12, () => drawSticky(stickyOne.lines, stickyOne.color)), size: [1.2, 1.2], rotation: [0.1, 0.2, 0.18], wide: [-0.8, 3.0, -2.4], compact: null },
  { build: (c) => paper(c, 1.2, 1.2, 0.1, () => drawSticky(stickyTwo.lines, stickyTwo.color)), size: [1.2, 1.2], rotation: [-0.2, -0.2, -0.2], wide: [4.9, -3.0, 0.4], compact: null },
];

/** Every material under `root` with the opacity it was built with, for the fade-out. */
function collectFades(root: THREE.Object3D): FadingMaterial[] {
  const fades: FadingMaterial[] = [];
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const material = node.material as THREE.Material;
    fades.push({ material, base: material.opacity });
  });
  return fades;
}

/**
 * Builds the objects one per task: each draws a large canvas, and all eight in
 * one task blocked a throttled phone for over two seconds.
 */
async function buildObjects(ctx: BuildContext): Promise<GatherObject[]> {
  const objects: GatherObject[] = [];
  let compactIndex = 0;
  for (const [i, def] of OBJECT_DEFS.entries()) {
    await yieldToMain();
    const root = def.build(ctx);
    const compact = def.compact ? { index: compactIndex++, position: def.compact } : null;
    objects.push({
      root, width: def.size[0], height: def.size[1], rotation: def.rotation,
      wide: { index: i, position: def.wide }, compact, fades: collectFades(root), hover: 0,
    });
  }
  return objects;
}

export interface GatherScene {
  objects: GatherObject[];
  record: RecordCard;
}

export async function buildGatherScene(renderer: THREE.WebGLRenderer): Promise<GatherScene> {
  const textures: RedrawableTexture[] = [];
  const ctx: BuildContext = {
    shadowTexture: new THREE.CanvasTexture(drawShadow(PRODUCTO_SHADOW_ALPHA)),
    texture: (draw) => {
      const entry = canvasTexture(draw, renderer);
      // Upload now, inside this object's task, rather than all at once on the first frame.
      renderer.initTexture(entry.texture);
      textures.push(entry);
      return entry.texture;
    },
  };
  const objects = await buildObjects(ctx);
  await yieldToMain();
  const recordRoot = card(ctx, [4.8, 3.2, 0.22], 0.14, whiteBody(), drawRecord);
  redrawWhenFontsSettle(textures);
  return { objects, record: { root: recordRoot, fades: collectFades(recordRoot), hover: 0 } };
}
