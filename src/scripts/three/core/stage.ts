// Renderer, camera and frame loop shared by every scene. A scene never draws
// while its section is off screen or the tab is hidden, and the GL context is
// released on pagehide so a back/forward navigation doesn't leak it.

import * as THREE from "three";
import { pixelRatioCap } from "../../core/breakpoints";

export interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  container: HTMLElement;
  resize: () => void;
}

export interface StageOptions {
  fov: number;
  /** "fill" stretches the canvas over an absolutely positioned container. */
  canvasStyle?: string;
}

export function createStage(container: HTMLElement, options: StageOptions): Stage {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(pixelRatioCap());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.cssText =
    options.canvasStyle ?? "position:absolute;inset:0;width:100%;height:100%;display:block;";
  container.insertBefore(renderer.domElement, container.firstChild);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(options.fov, 1, 0.1, 100);
  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(pixelRatioCap());
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener("resize", resize);
  addEventListener("pagehide", () => renderer.dispose(), { once: true });
  return { renderer, scene, camera, container, resize };
}

/** Visible height and width of the z=0 plane for a camera at `distance`. */
export function visibleSize(camera: THREE.PerspectiveCamera, distance = camera.position.z) {
  const height = 2 * Math.tan((camera.fov * Math.PI) / 360) * distance;
  return { height, width: height * camera.aspect };
}

/**
 * rAF loop that calls `frame(now, dt)` only while `isActive()` is true.
 * dt is in seconds and capped at 1, as the prototypes do.
 */
export function startFrameLoop(frame: (now: number, dt: number) => void, isActive: () => boolean): void {
  let lastTime = 0;
  const step = (now: number) => {
    requestAnimationFrame(step);
    const dt = Math.min(1, (now - (lastTime || now)) / 1000);
    lastTime = now;
    if (document.hidden || !isActive()) return;
    frame(now, dt);
  };
  requestAnimationFrame(step);
}

/** True while any part of `element` is inside the viewport. */
export function isOnScreen(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < innerHeight;
}

/** Window pointer in [-1, 1] on both axes; desktop scenes use it for parallax. */
export function trackWindowPointer(): { x: number; y: number } {
  const pointer = { x: 0, y: 0 };
  addEventListener("mousemove", (event) => {
    pointer.x = (event.clientX / innerWidth) * 2 - 1;
    pointer.y = (event.clientY / innerHeight) * 2 - 1;
  });
  return pointer;
}

/** Per-frame smoothing factor: `1 - base^(dt*60)`, frame-rate independent. */
export const smoothingFactor = (base: number, dt: number): number => 1 - Math.pow(base, dt * 60);

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

/**
 * Link shader programs one top-level object per task. Without the parallel
 * shader-compile extension (software GL, many phones) `compileAsync` still
 * links every program in a single task; splitting by object keeps each task
 * short, and programs shared across objects are only linked once.
 */
export async function compileInSteps(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): Promise<void> {
  for (const child of [...scene.children]) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await renderer.compileAsync(child, camera, scene);
  }
}
