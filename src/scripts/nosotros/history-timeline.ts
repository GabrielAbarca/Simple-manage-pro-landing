import { fadeIn, prefersReducedMotion, tween } from "../core/anim";

const TRIGGER_VIEWPORT_FRACTION = 0.8;
const ITEM_STEP_MS = 250;
const FILL_DURATION_MS = 250;
const BEAT_DURATION_MS = 600;
const BEAT_STAGGER_MS = 60;
const BEAT_LIFT_PX = 12;
const PLAYED_DOT_COLOR = "var(--brand-text)";

function playItem(item: HTMLElement, itemIndex: number): void {
  const delayMs = itemIndex * ITEM_STEP_MS;
  const dot = item.querySelector<HTMLElement>("[data-dot]");
  const fill = item.querySelector<HTMLElement>("[data-fill]");
  if (dot) setTimeout(() => { dot.style.background = PLAYED_DOT_COLOR; }, delayMs);
  if (fill) {
    tween({
      durationMs: FILL_DURATION_MS,
      delayMs,
      onFrame: (eased) => { fill.style.transform = `scaleX(${eased})`; },
    });
  }
  item.querySelectorAll<HTMLElement>("[data-beat]").forEach((beat, beatIndex) =>
    fadeIn(beat, BEAT_DURATION_MS, delayMs + beatIndex * BEAT_STAGGER_MS, BEAT_LIFT_PX),
  );
}

export function playHistoryTimeline(list: HTMLElement): void {
  [...list.children].forEach((item, itemIndex) => {
    if (item instanceof HTMLElement) playItem(item, itemIndex);
  });
}

function hasReachedTrigger(list: HTMLElement): boolean {
  return list.getBoundingClientRect().top < innerHeight * TRIGGER_VIEWPORT_FRACTION;
}

export function initHistoryTimeline(list: HTMLElement): void {
  if (prefersReducedMotion()) return;
  let scheduled = false;
  const sweep = () => {
    scheduled = false;
    if (!hasReachedTrigger(list)) return;
    removeEventListener("scroll", schedule);
    removeEventListener("resize", schedule);
    playHistoryTimeline(list);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sweep);
  };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  sweep();
}
