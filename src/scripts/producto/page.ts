import { prefersReducedMotion } from "../core/anim";
import { reportSceneError, whenNear } from "../core/lazy-scene";
import { smoothingFactor, trackWindowPointer } from "../three/core/stage";
import { initAdminConsole } from "./admin-console";
import { initAttendanceConsole } from "./attendance-console";
import { initStudentConsole } from "./student-console";
import { createProductoMotion, type ProductoMotion } from "./motion-state";
import { createStickyExitPainter, findOpeningDom, measureScroll, paintOpening, playOpeningIntro, type OpeningDom } from "./opening";
import { collectPanels, findPortalRail, paintPortals, type PortalRail } from "./portal-dom";

function resetScrollPosition(): void {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);
  if (!location.hash) return;
  setTimeout(() => {
    const target = document.getElementById(location.hash.slice(1));
    if (target) scrollTo(0, target.getBoundingClientRect().top + scrollY);
  }, 400);
}

interface LoopTargets {
  opening: OpeningDom;
  portals: HTMLElement;
  rail: PortalRail;
}

function startDomLoop(motion: ProductoMotion, targets: LoopTargets): void {
  const paintExit = createStickyExitPainter(targets.opening.sticky);
  let lastTime = 0;
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - (lastTime || now)) / 1000);
    lastTime = now;
    measureScroll(motion, targets.opening.section, targets.portals);
    motion.progress += (motion.targetProgress - motion.progress) * smoothingFactor(0.86, dt);
    const pointerEase = smoothingFactor(0.95, dt);
    motion.pointer.x += (motion.rawPointer.x - motion.pointer.x) * pointerEase;
    motion.pointer.y += (motion.rawPointer.y - motion.pointer.y) * pointerEase;
    if (!motion.portalsOffscreen) paintPortals(motion.panels, targets.rail, motion.intensity, motion.reduce);
    paintExit(motion.exit);
    if (!motion.openingOffscreen) paintOpening(targets.opening, motion.progress);
  };
  requestAnimationFrame(frame);
}

function startOpeningScene(opening: OpeningDom, motion: ProductoMotion): void {
  const stage = opening.section.querySelector<HTMLElement>("[data-opening-stage]");
  if (!stage) return;
  requestAnimationFrame(() =>
    import("../three/scenes/producto-gather")
      .then((scene) => scene.startProductoGather(stage, opening.sticky, motion))
      .catch((error) => reportSceneError("producto-gather", error)),
  );
}

function startPortalsScene(portals: HTMLElement, motion: ProductoMotion): void {
  const stage = portals.querySelector<HTMLElement>("[data-portals-stage]");
  if (!stage) return;
  whenNear(stage, () =>
    import("../three/scenes/producto-portals")
      .then((scene) => scene.startProductoPortals(stage, portals, motion))
      .catch((error) => reportSceneError("producto-portals", error)),
  );
}

export function initProductoPage(): void {
  const openingSection = document.querySelector<HTMLElement>("[data-opening]");
  const portals = document.querySelector<HTMLElement>("[data-portals]");
  if (!openingSection || !portals) return;
  resetScrollPosition();
  const reduce = prefersReducedMotion();
  const opening = findOpeningDom(openingSection);
  const motion = createProductoMotion(reduce, collectPanels(portals));
  motion.rawPointer = trackWindowPointer();
  motion.entranceStartMs = playOpeningIntro(opening, reduce);
  startDomLoop(motion, { opening, portals, rail: findPortalRail(portals) });
  initAdminConsole(portals);
  initAttendanceConsole(portals);
  initStudentConsole(portals);
  startOpeningScene(opening, motion);
  startPortalsScene(portals, motion);
}
