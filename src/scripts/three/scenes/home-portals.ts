// Home hero scene: the three portal slabs, scroll-fanned over the 300vh hero.
// Also drives the hero's DOM: headline lift, fan title, captions projected
// from each slab's corner, and the desktop scroll cue.

import * as THREE from "three";
import { clamp01, easeOutExpo, prefersReducedMotion, smoothstep } from "../../core/anim";
import { currentLayout } from "../../core/breakpoints";
import { compileInSteps, createStage, smoothingFactor, startFrameLoop, trackWindowPointer, visibleSize } from "../core/stage";
import { loadPoppins } from "../core/textures";
import { SLAB, buildPortalSlabs } from "./home-portals/build";
import { stackPose } from "./home-portals/poses";

interface HeroDom {
  stage: HTMLElement;
  headline: HTMLElement;
  fanTitle: HTMLElement;
  captions: HTMLElement[];
  cue: HTMLElement | null;
}

function findHeroDom(hero: HTMLElement): HeroDom {
  return {
    stage: hero.querySelector<HTMLElement>("[data-hero-stage]")!,
    headline: hero.querySelector<HTMLElement>("[data-hero-headline]")!,
    fanTitle: hero.querySelector<HTMLElement>("[data-fan-title]")!,
    captions: [...hero.querySelectorAll<HTMLElement>("[data-caption]")],
    cue: hero.querySelector<HTMLElement>(".cue"),
  };
}

function heroProgress(hero: HTMLElement): number {
  const rect = hero.getBoundingClientRect();
  return clamp01(-rect.top / (hero.offsetHeight - innerHeight));
}

function paintHeadline(dom: HeroDom, lift: number, fan: number, heroStarted: boolean): void {
  dom.headline.style.transform = `translateY(${-lift * 140}px)`;
  dom.headline.style.opacity = String(1 - lift);
  dom.headline.style.pointerEvents = lift > 0.5 ? "none" : "auto";
  if (dom.cue && heroStarted) dom.cue.style.visibility = lift > 0.6 ? "hidden" : "visible";
  const titleOpacity = clamp01((fan - 0.45) / 0.3);
  dom.fanTitle.style.opacity = String(titleOpacity);
  dom.fanTitle.style.transform = `translateY(${(1 - titleOpacity) * 30}px)`;
}

function paintCaptions(dom: HeroDom, slabs: THREE.Group[], camera: THREE.Camera, fan: number): void {
  const point = new THREE.Vector3();
  const width = dom.stage.clientWidth;
  const height = dom.stage.clientHeight;
  dom.captions.forEach((caption, i) => {
    point.set(-SLAB.width / 2 + 0.2, -SLAB.height / 2 - 0.35, 0).applyMatrix4(slabs[i].matrixWorld).project(camera);
    const screenX = (point.x * 0.5 + 0.5) * width;
    const screenY = (-point.y * 0.5 + 0.5) * height;
    const opacity = clamp01((fan - 0.6 - i * 0.1) / 0.25);
    caption.style.opacity = String(opacity);
    caption.style.transform = `translate(${screenX}px, ${screenY + (1 - opacity) * 16}px)`;
  });
}

function bottomOf(element: HTMLElement): number {
  return element.offsetTop + element.offsetHeight;
}

export async function startHomePortals(
  hero: HTMLElement,
  getEntranceStart: () => number,
  motionIntensity: number,
): Promise<void> {
  await loadPoppins();
  const dom = findHeroDom(hero);
  const { renderer, scene, camera } = createStage(dom.stage, { fov: 28 });
  camera.position.set(0, 0, 18);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc4c8f2, 1.4));
  const light = new THREE.DirectionalLight(0xffffff, 1.4);
  light.position.set(4, 6, 9);
  scene.add(light);
  const slabs = await buildPortalSlabs(renderer);
  const root = new THREE.Group();
  slabs.forEach((slab) => root.add(slab));
  scene.add(root);
  await compileInSteps(renderer, scene, camera);

  const pointer = trackWindowPointer();
  const idle = prefersReducedMotion() ? 0 : motionIntensity;
  const smoothed = { x: 0, y: 0, progress: 0 };

  startFrameLoop((now, dt) => {
    const pointerEase = smoothingFactor(0.95, dt);
    smoothed.x += (pointer.x - smoothed.x) * pointerEase;
    smoothed.y += (pointer.y - smoothed.y) * pointerEase;
    smoothed.progress += (heroProgress(hero) - smoothed.progress) * smoothingFactor(0.88, dt);
    const p = smoothed.progress;
    const entranceStart = getEntranceStart();
    const entrance = Number.isFinite(entranceStart) ? easeOutExpo(clamp01((now - entranceStart) / 2000)) : 0;
    const fan = smoothstep((p - 0.12) / 0.5);
    const { width: visibleWidth, height: visibleHeight } = visibleSize(camera);
    const pose = stackPose({
      fan, entrance, idle, timeSeconds: now / 1000, pointer: smoothed,
      visibleWidth, visibleHeight, aspect: camera.aspect,
      stageWidth: dom.stage.clientWidth, stageHeight: dom.stage.clientHeight,
      headlineBottom: bottomOf(dom.headline), fanTitleBottom: bottomOf(dom.fanTitle),
      layout: currentLayout(),
    });
    root.position.set(pose.position[0], pose.position[1], 0);
    root.scale.setScalar(pose.scale);
    root.rotation.set(...pose.rotation);
    slabs.forEach((slab, i) => slab.position.set(...pose.slabs[i]));
    root.updateMatrixWorld();
    paintCaptions(dom, slabs, camera, fan);
    paintHeadline(dom, smoothstep(p / 0.28), fan, Number.isFinite(entranceStart));
    renderer.render(scene, camera);
  }, () => hero.getBoundingClientRect().bottom >= 0);
}
