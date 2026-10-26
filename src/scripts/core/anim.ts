// Tween and easing helpers shared by every page script. Ported from the
// prototypes' `tw` / `eOut` / `eMove`, minus their hidden-iframe setTimeout
// fallback: a real page gets requestAnimationFrame.

export type Easing = (progress: number) => number;

/** Ease-out-expo: every reveal on the site. */
export const easeOutExpo: Easing = (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));

/** Cubic in-out: movement (intro wipe, calendar fill). */
export const easeInOutCubic: Easing = (k) =>
  k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;

export const easeInOutQuad: Easing = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

export const easeOutCubic: Easing = (k) => 1 - Math.pow(1 - k, 3);

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** Smoothstep on a value clamped to [0, 1]. */
export const smoothstep = (value: number): number => {
  const k = clamp01(value);
  return k * k * (3 - 2 * k);
};

export const prefersReducedMotion = (): boolean =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface TweenOptions {
  durationMs: number;
  delayMs?: number;
  easing?: Easing;
  onFrame: (easedProgress: number) => void;
  onDone?: () => void;
  /** Return false to abandon the tween (e.g. a newer intro phase took over). */
  isCurrent?: () => boolean;
}

export function tween(options: TweenOptions): void {
  const { durationMs, delayMs = 0, easing = easeOutExpo, onFrame, onDone, isCurrent } = options;
  const startTime = performance.now() + delayMs;
  onFrame(0);
  const step = (now: number) => {
    if (isCurrent && !isCurrent()) return;
    const progress = durationMs <= 1 ? 1 : clamp01((now - startTime) / durationMs);
    onFrame(easing(progress));
    if (progress < 1) requestAnimationFrame(step);
    else onDone?.();
  };
  requestAnimationFrame(step);
}

/** Masked headline line: translateY(110%) → 0. */
export function riseIn(element: HTMLElement, durationMs: number, delayMs: number): void {
  tween({
    durationMs,
    delayMs,
    onFrame: (e) => { element.style.transform = `translateY(${(1 - e) * 110}%)`; },
  });
}

/** Fade with a small lift, ending on `transform: none` so nothing stays composited. */
export function fadeIn(element: HTMLElement, durationMs: number, delayMs: number, liftPx = 14): void {
  tween({
    durationMs,
    delayMs,
    onFrame: (e) => {
      element.style.opacity = String(e);
      element.style.transform = e >= 1 ? "none" : `translateY(${(1 - e) * liftPx}px)`;
    },
  });
}
