import { clamp01, fadeIn, riseIn, smoothstep } from "../core/anim";
import type { ProductoMotion } from "./motion-state";

const CHAPTER_WINDOWS: readonly [number, number][] = [[0.2, 0.36], [0.38, 0.52], [0.54, 0.66], [0.89, 1.5]];
const CHAPTER_RAMP = 0.03;
const STEP_SWITCHES = [0.37, 0.53, 0.76];

export interface OpeningDom {
  section: HTMLElement;
  sticky: HTMLElement;
  headline: HTMLElement;
  cue: HTMLElement | null;
  chapters: HTMLElement[];
  steps: HTMLElement | null;
  stepNumber: HTMLElement | null;
  stepFill: HTMLElement | null;
}

export function findOpeningDom(section: HTMLElement): OpeningDom {
  const pick = (selector: string) => section.querySelector<HTMLElement>(selector);
  return {
    section,
    sticky: pick("[data-opening-sticky]")!,
    headline: pick("[data-opening-headline]")!,
    cue: pick("[data-opening-cue]"),
    chapters: [...section.querySelectorAll<HTMLElement>("[data-chapter]")],
    steps: pick("[data-opening-steps]"),
    stepNumber: pick("[data-opening-step]"),
    stepFill: pick("[data-opening-step-fill]"),
  };
}

export function playOpeningIntro(dom: OpeningDom, reduce: boolean): number {
  if (reduce) return performance.now() - 5000;
  dom.headline.querySelectorAll<HTMLElement>("[data-rise]").forEach((el, i) => riseIn(el, 1200, 200 + i * 100));
  dom.headline.querySelectorAll<HTMLElement>("[data-fade]").forEach((el, i) => fadeIn(el, 900, 600 + i * 90, 14));
  return performance.now() + 150;
}

export function measureScroll(motion: ProductoMotion, opening: HTMLElement, portals: HTMLElement): void {
  const rect = opening.getBoundingClientRect();
  motion.targetProgress = clamp01(-rect.top / (opening.offsetHeight - innerHeight));
  motion.openingOffscreen = rect.bottom < 0 || rect.top > innerHeight;
  motion.exit = clamp01((innerHeight - rect.bottom) / innerHeight);
  const portalsRect = portals.getBoundingClientRect();
  motion.portalsOffscreen = portalsRect.bottom < 0 || portalsRect.top > innerHeight * 1.05;
}

export function createStickyExitPainter(sticky: HTMLElement): (exit: number) => void {
  let lastExit = Number.NaN;
  return (exit) => {
    if (exit === lastExit) return;
    lastExit = exit;
    const eased = exit * exit * (3 - 2 * exit);
    sticky.style.transform = exit > 0 ? `translate3d(0,${exit * innerHeight * 0.5}px,0) scale(${1 - eased * 0.06})` : "";
    sticky.style.opacity = String(1 - eased * 0.9);
  };
}

function paintChapters(chapters: HTMLElement[], progress: number): void {
  chapters.forEach((chapter, i) => {
    const [start, end] = CHAPTER_WINDOWS[i];
    const opacity = clamp01((progress - start) / CHAPTER_RAMP) * clamp01((end - progress) / CHAPTER_RAMP);
    chapter.style.opacity = String(opacity);
    chapter.style.transform = `translateY(${(1 - opacity) * 24}px)`;
    chapter.style.visibility = opacity < 0.001 ? "hidden" : "visible";
    chapter.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
  });
}

function paintStepRail(dom: OpeningDom, progress: number): void {
  const step = STEP_SWITCHES.filter((threshold) => progress >= threshold).length;
  const label = `0${step + 1}`;
  if (dom.steps) dom.steps.style.opacity = String(clamp01((progress - 0.15) / 0.04));
  if (dom.stepNumber && dom.stepNumber.textContent !== label) dom.stepNumber.textContent = label;
  if (dom.stepFill) dom.stepFill.style.transform = `scaleY(${clamp01((progress - 0.15) / 0.8)})`;
}

export function paintOpening(dom: OpeningDom, progress: number): void {
  const lift = smoothstep((progress - 0.025) / 0.07);
  dom.headline.style.opacity = String(1 - lift);
  dom.headline.style.transform = `translateY(${-lift * 120}px)`;
  if (dom.cue) dom.cue.style.opacity = String(1 - clamp01(progress / 0.04));
  paintChapters(dom.chapters, progress);
  paintStepRail(dom, progress);
}
