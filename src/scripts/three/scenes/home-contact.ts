// Home contact scene: the app-icon tile, the prefilled WhatsApp message as a
// blue bubble, and a typing bubble whose dots pulse. They fly in as the card
// enters and float. Desktop only: hovering an object (or the "Conversar por
// WhatsApp" CTA, for the bubble) brings it forward, and clicking opens
// WhatsApp. From Home.dc.html initContact.

import * as THREE from "three";
import { clamp01, easeOutCubic, prefersReducedMotion } from "../../core/anim";
import { currentLayout } from "../../core/breakpoints";
import { waHref } from "../../../config";
import { createStage, isOnScreen, startFrameLoop, trackWindowPointer, visibleSize } from "../core/stage";
import { addStudioLighting, hoveredIndex, trackStagePointer } from "../core/studio";
import { buildContactItems, type ContactItem } from "./home-contact/build";

function settleItem(item: ContactItem, index: number, entered: number, t: number, k: number): void {
  const e = easeOutCubic(clamp01((entered * 1.4 - index * 0.12) / 0.6));
  const float = Math.sin(t * 0.9 + item.phase) * 0.12 * k;
  const [px, py, pz] = item.position;
  const [fx, fy, fz] = item.from;
  item.object.position.set(px + (1 - e) * fx, py + (1 - e) * fy + float, pz + (1 - e) * fz);
  item.object.rotation.set(
    item.rotation[0] + (1 - e) * 0.6 + Math.sin(t * 0.7 + item.phase) * 0.03 * k,
    item.rotation[1] - (1 - e) * 0.8,
    item.rotation[2],
  );
}

function applyHover(item: ContactItem): void {
  item.object.position.z += item.hover * 1.3;
  item.object.rotation.y *= 1 - item.hover * 0.85;
  item.object.rotation.x *= 1 - item.hover * 0.6;
  item.object.scale.setScalar(1 + item.hover * 0.12);
}

/** Watches the WhatsApp CTA so hovering it lifts the bubble (desktop only). */
function trackCtaHover(): { hovered: boolean } {
  const state = { hovered: false };
  const cta = document.querySelector<HTMLElement>("[data-contact-whatsapp]");
  cta?.addEventListener("mouseenter", () => { state.hovered = currentLayout() === "desktop"; });
  cta?.addEventListener("mouseleave", () => { state.hovered = false; });
  return state;
}

export function startHomeContact(container: HTMLElement, motionIntensity: number): void {
  const stage = createStage(container, { fov: 30 });
  addStudioLighting(stage);
  const { scene, camera, renderer } = stage;
  camera.position.set(0, 0, 15);
  const root = new THREE.Group();
  scene.add(root);
  const { items, dots } = buildContactItems(renderer);
  items.forEach((item) => root.add(item.object));
  const windowPointer = trackWindowPointer();
  const stagePointer = trackStagePointer(container);
  const cta = trackCtaHover();
  const raycaster = new THREE.Raycaster();
  const reduce = prefersReducedMotion();
  const smoothedPointer = { x: 0, y: 0 };
  let typingPulse = 0;
  let hoverIndex = -1;
  container.addEventListener("click", () => {
    if (hoverIndex >= 0) window.open(waHref(), "_blank", "noopener");
  });

  startFrameLoop((now) => {
    const t = now / 1000;
    const k = reduce ? 0 : motionIntensity;
    const entered = reduce ? 1 : clamp01((innerHeight - container.getBoundingClientRect().top) / (innerHeight * 0.8));
    smoothedPointer.x += (windowPointer.x - smoothedPointer.x) * 0.05;
    smoothedPointer.y += (windowPointer.y - smoothedPointer.y) * 0.05;
    const { width: visW, height: visH } = visibleSize(camera);
    root.scale.setScalar(Math.min(1.05, visW / (currentLayout() === "desktop" ? 9.4 : 8.6), visH / 7.6));
    root.rotation.set(smoothedPointer.y * 0.12 * k, smoothedPointer.x * 0.2 * k, 0);
    hoverIndex = hoveredIndex(raycaster, stagePointer, camera, items.map((item) => item.object));
    container.style.cursor = hoverIndex >= 0 ? "pointer" : "";
    typingPulse += ((cta.hovered ? 1 : 0) - typingPulse) * 0.1;
    items.forEach((item, i) => {
      const wantsHover = hoverIndex === i || (cta.hovered && i === 1);
      item.hover += ((wantsHover ? 1 : 0) - item.hover) * 0.12;
      settleItem(item, i, entered, t, k);
      applyHover(item);
    });
    dots.forEach((dot, i) => {
      dot.scale.setScalar(reduce ? 1 : 0.8 + 0.3 * Math.max(0, Math.sin(t * (3.2 + typingPulse * 2) - i * 0.9)));
    });
    renderer.render(scene, camera);
  }, () => isOnScreen(container));
}
