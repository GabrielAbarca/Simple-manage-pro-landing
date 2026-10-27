// Objects for the Home contact scene, with their rest pose, entrance offset
// and float phase. Values from Home.dc.html initContact.

import * as THREE from "three";
import { HOME_SHADOW_ALPHA, drawShadow } from "../../core/canvas2d";
import { homeSlab } from "../../core/geometry";
import { canvasTexture, redrawWhenFontsSettle } from "../../core/textures";
import { drawBubble } from "../../textures/home/bubble";
import { createAppIconCanvas } from "../../textures/home/app-icon";

const APP_ICON_URL = "/android-chrome-512x512.png";

export interface ContactItem {
  object: THREE.Group;
  position: [number, number, number];
  rotation: [number, number, number];
  from: [number, number, number];
  phase: number;
  hover: number;
}

const clearcoatWhite = () =>
  new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.2, envMapIntensity: 0.9 });

function withShadow(group: THREE.Group, width: number, height: number, depth: number, shadow: THREE.Texture): THREE.Group {
  const material = new THREE.MeshBasicMaterial({ map: shadow, transparent: true, depthWrite: false });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(width * 1.5, height * 1.7), material);
  plane.position.set(0, -height * 0.12, -depth / 2 - 0.25);
  group.add(plane);
  return group;
}

function appIconTile(renderer: THREE.WebGLRenderer, white: THREE.Material, shadow: THREE.Texture): THREE.Group {
  const { canvas, ready } = createAppIconCanvas(APP_ICON_URL);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  ready.then(() => { texture.needsUpdate = true; }).catch(() => { /* icon missing: the tile stays white */ });
  const tile = homeSlab(2.6, 2.6, 0.62, 0.36, white, new THREE.MeshBasicMaterial({ map: texture }), 0.06);
  return withShadow(tile, 2.6, 2.6, 0.36, shadow);
}

function messageBubble(renderer: THREE.WebGLRenderer, shadow: THREE.Texture): THREE.Group {
  const face = canvasTexture(() => drawBubble(), renderer);
  redrawWhenFontsSettle([face]);
  document.fonts.load("500 60px Poppins").then(face.redraw).catch(() => {});
  const material = new THREE.MeshPhysicalMaterial({ color: 0x5a69e9, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 0.8 });
  const bubble = homeSlab(5.6, 2.3, 0.6, 0.2, material, new THREE.MeshBasicMaterial({ map: face.texture }), 0.05);
  return withShadow(bubble, 5.6, 2.3, 0.2, shadow);
}

function typingBubble(white: THREE.Material, shadow: THREE.Texture): { group: THREE.Group; dots: THREE.Mesh[] } {
  const group = withShadow(homeSlab(2.1, 1.0, 0.5, 0.16, white, null, 0.04), 2.1, 1.0, 0.16, shadow);
  const dotMaterial = new THREE.MeshPhysicalMaterial({ color: 0x7380ec, roughness: 0.3, clearcoat: 1 });
  const dots = [-0.48, 0, 0.48].map((x) => {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), dotMaterial);
    dot.position.set(x, 0, 0.2);
    group.add(dot);
    return dot;
  });
  return { group, dots };
}

export function buildContactItems(renderer: THREE.WebGLRenderer): { items: ContactItem[]; dots: THREE.Mesh[] } {
  const white = clearcoatWhite();
  const shadow = new THREE.CanvasTexture(drawShadow(HOME_SHADOW_ALPHA));
  const typing = typingBubble(white, shadow);
  const items: ContactItem[] = [
    { object: appIconTile(renderer, white, shadow), position: [-2.6, 2.0, 0.4], rotation: [0.12, 0.4, -0.1], from: [-3, 3, -5], phase: 0, hover: 0 },
    { object: messageBubble(renderer, shadow), position: [0.7, 0.1, 0], rotation: [-0.04, -0.3, 0.03], from: [5, -1, -4], phase: 1.7, hover: 0 },
    { object: typing.group, position: [-2.0, -2.2, 0.9], rotation: [0.05, 0.28, 0.02], from: [-2, -5, -3], phase: 3.1, hover: 0 },
  ];
  return { items, dots: typing.dots };
}
