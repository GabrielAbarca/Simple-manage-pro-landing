// Home "La seguridad nos importa." scene. The disks drop in as the section
// enters, the stack turns slowly and the padlock orbits it. Desktop only:
// hovering spreads the stack and lifts the lock, clicking spins it once and
// clanks the shackle. From Home.dc.html initPilot.

import * as THREE from "three";
import { clamp01, easeOutCubic, prefersReducedMotion } from "../../core/anim";
import { currentLayout } from "../../core/breakpoints";
import { createStage, startFrameLoop, isOnScreen, trackWindowPointer } from "../core/stage";
import { addStudioLighting, hoveredIndex, trackStagePointer } from "../core/studio";
import { DISK, ORBIT, buildDatabase, type DatabaseScene } from "./home-security/build";

interface MotionState {
  hover: number;
  spinTarget: number;
  spin: number;
  clank: number;
  camera: { x: number; y: number };
}

function placeDisks(db: DatabaseScene, entered: number, t: number, k: number, hover: number): void {
  const pitch = DISK.height + 0.12 + 0.3 * hover;
  db.disks.forEach((disk, j) => {
    const e = easeOutCubic(clamp01((entered * 1.5 - j * 0.14) / 0.4));
    disk.position.y = DISK.height / 2 + j * pitch + (1 - e) * 7 + Math.sin(t * 1.3 + j) * 0.03 * k;
    disk.visible = e > 0.001;
  });
}

function placeLock(db: DatabaseScene, entered: number, t: number, k: number, state: MotionState): void {
  const appear = easeOutCubic(clamp01((entered * 1.5 - 0.55) / 0.45));
  const angle = t * 0.55 * Math.max(0.25, k) + 0.9 + state.spin * 0.5;
  const x = Math.cos(angle) * ORBIT.radiusX;
  const z = Math.sin(angle) * ORBIT.radiusZ;
  db.lock.position.set(x, ORBIT.centerY + 0.35 * state.hover + Math.sin(angle * 2) * 0.18, z);
  db.lock.rotation.set(0.08, Math.atan2(x, z) * 0.55, Math.sin(angle) * 0.08);
  db.lock.scale.setScalar(appear * (1 + state.hover * 0.12));
  db.lock.visible = appear > 0.001;
  db.shackle.position.y = -state.clank * 0.14 * Math.abs(Math.sin(state.clank * 9));
  db.lockShadow.position.set(x, -0.19, z);
  db.lockShadow.scale.setScalar(appear);
  db.ring.material.opacity = 0.45 * appear;
}

/** Floor on the camera fit: lower below desktop so the orbit ring isn't cropped. */
const fitFloor = () => (currentLayout() === "desktop" ? 0.5 : 0.36);

export function startHomeSecurity(container: HTMLElement, motionIntensity: number): void {
  const stage = createStage(container, { fov: 28 });
  addStudioLighting(stage);
  const { scene, camera, renderer } = stage;
  const db = buildDatabase();
  scene.add(db.root);
  const windowPointer = trackWindowPointer();
  const stagePointer = trackStagePointer(container);
  const raycaster = new THREE.Raycaster();
  const reduce = prefersReducedMotion();
  const state: MotionState = { hover: 0, spinTarget: 0, spin: 0, clank: 0, camera: { x: 0, y: 0 } };
  let hovered = false;
  container.addEventListener("click", () => {
    if (!hovered) return;
    state.spinTarget += Math.PI * 2;
    state.clank = 1;
  });

  startFrameLoop((now) => {
    const t = now / 1000;
    const k = reduce ? 0 : motionIntensity;
    const entered = reduce ? 1 : clamp01((innerHeight - container.getBoundingClientRect().top) / (innerHeight * 0.85));
    state.camera.x += (windowPointer.x - state.camera.x) * 0.05;
    state.camera.y += (windowPointer.y - state.camera.y) * 0.05;
    const fit = Math.max(fitFloor(), Math.min(1, camera.aspect / 1.5));
    camera.position.set(state.camera.x * 1.0 * k, 3.2 - state.camera.y * 0.6 * k, 9.6 / fit);
    camera.lookAt(0, 1.2, 0);
    hovered = hoveredIndex(raycaster, stagePointer, camera, [db.spin, db.lock]) >= 0;
    container.style.cursor = hovered ? "pointer" : "";
    state.hover += ((hovered ? 1 : 0) - state.hover) * 0.12;
    state.spin += (state.spinTarget - state.spin) * 0.06;
    state.clank *= 0.92;
    db.spin.rotation.y = t * 0.22 * k + state.spin;
    placeDisks(db, entered, t, k, state.hover);
    placeLock(db, entered, t, k, state);
    renderer.render(scene, camera);
  }, () => isOnScreen(container));
}
