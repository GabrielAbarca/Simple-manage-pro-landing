// Piloto hero scene: the clipboard with the signed application sheet and a
// pen, turning in from the side and then swaying. From Piloto.dc.html
// initThree. The stage fades in over 1400ms after 350ms while the group's
// entrance runs 1800ms (cubic out) from the same delay.

import { clamp01, easeOutCubic, prefersReducedMotion, tween } from "../../core/anim";
import { loadPoppins, yieldToMain } from "../core/textures";
import { compileInSteps, createStage, isOnScreen, startFrameLoop } from "../core/stage";
import { addClipboardLighting } from "./piloto-clipboard/environment";
import { buildClipboard } from "./piloto-clipboard/build";

const ENTRANCE_DELAY_MS = 350;
const ENTRANCE_DURATION_MS = 1800;
const STAGE_FADE_MS = 1400;
const MOTION_INTENSITY = 1;
const HALF_FOV_RADIANS = (15 * Math.PI) / 180;

/** Far enough that the board always fits, however narrow the stage. */
const cameraDistance = (aspect: number): number => Math.max(12.5, 2.9 / (Math.tan(HALF_FOV_RADIANS) * aspect));

function fadeInStage(container: HTMLElement, still: boolean): void {
  if (still) {
    container.style.opacity = "1";
    return;
  }
  tween({
    durationMs: STAGE_FADE_MS,
    delayMs: ENTRANCE_DELAY_MS,
    onFrame: (e) => { container.style.opacity = String(e); },
  });
}

export async function startPilotoClipboard(container: HTMLElement): Promise<void> {
  await loadPoppins(["500", "600", "700", "800"], ["italic 500"]);
  const stage = createStage(container, { fov: 30, canvasStyle: "width:100%;height:100%;display:block;" });
  const { scene, camera, renderer } = stage;
  // One heavy step per task (environment, build, shader link), so the scene
  // never blocks input for long on a throttled phone.
  await yieldToMain();
  addClipboardLighting(scene, renderer);
  await yieldToMain();
  const clipboard = buildClipboard(renderer);
  scene.add(clipboard);
  await compileInSteps(renderer, scene, camera);
  const still = prefersReducedMotion();
  fadeInStage(container, still);
  const entranceStart = performance.now() + ENTRANCE_DELAY_MS;

  startFrameLoop((now) => {
    const t = now / 1000;
    const k = still ? 0 : MOTION_INTENSITY;
    const entrance = still ? 1 : easeOutCubic(clamp01((now - entranceStart) / ENTRANCE_DURATION_MS));
    camera.position.set(0, 0, cameraDistance(camera.aspect));
    clipboard.rotation.set(
      -0.08 + Math.sin(t * 0.32) * 0.07 * k,
      -0.38 + Math.sin(t * 0.42) * 0.5 * k - (1 - entrance) * 0.9,
      0.04 + Math.sin(t * 0.27) * 0.03 * k,
    );
    renderer.render(scene, camera);
  }, () => isOnScreen(container));
}
