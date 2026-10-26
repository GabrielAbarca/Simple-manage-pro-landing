// Reveal-on-scroll for [data-rv] groups. A rAF-throttled scroll sweep, not an
// IntersectionObserver: IO reports only when an element crosses its threshold,
// and a fling scroll that skips that moment leaves a section hidden for the
// rest of the visit. The sweep checks every pending group on every frame that
// scrolled, and stops listening once nothing is left.

import { fadeIn, prefersReducedMotion, riseIn } from "./anim";

interface StaggerTiming {
  durationMs: number;
  baseDelayMs: number;
  stepMs: number;
}

export interface RevealProfile {
  /** Reveal once the group's top is above this fraction of the viewport. */
  threshold: number;
  rise: StaggerTiming;
  fade: StaggerTiming & { liftPx: number };
}

// Values from the prototypes' reveal() methods.
export const REVEAL_PROFILES: Record<string, RevealProfile> = {
  page: {
    threshold: 0.82,
    rise: { durationMs: 1100, baseDelayMs: 120, stepMs: 90 },
    fade: { durationMs: 900, baseDelayMs: 450, stepMs: 100, liftPx: 14 },
  },
  contacto: {
    threshold: 0.9,
    rise: { durationMs: 1100, baseDelayMs: 120, stepMs: 90 },
    fade: { durationMs: 900, baseDelayMs: 450, stepMs: 100, liftPx: 14 },
  },
  home: {
    threshold: 0.85,
    rise: { durationMs: 1100, baseDelayMs: 0, stepMs: 100 },
    fade: { durationMs: 900, baseDelayMs: 150, stepMs: 90, liftPx: 24 },
  },
};

export function revealGroup(group: ParentNode, profile: RevealProfile): void {
  const { rise, fade } = profile;
  group.querySelectorAll<HTMLElement>("[data-rise]").forEach((el, i) =>
    riseIn(el, rise.durationMs, rise.baseDelayMs + i * rise.stepMs),
  );
  group.querySelectorAll<HTMLElement>("[data-fade]").forEach((el, i) =>
    fadeIn(el, fade.durationMs, fade.baseDelayMs + i * fade.stepMs, fade.liftPx),
  );
}

function isDue(group: HTMLElement, threshold: number): boolean {
  const rect = group.getBoundingClientRect();
  return rect.top < innerHeight * threshold && rect.bottom > 0;
}

export function initReveal(profile: RevealProfile): void {
  if (prefersReducedMotion()) return;
  let pending = [...document.querySelectorAll<HTMLElement>("[data-rv]")];
  let scheduled = false;
  const sweep = () => {
    scheduled = false;
    pending = pending.filter((group) => {
      if (!isDue(group, profile.threshold)) return true;
      revealGroup(group, profile);
      return false;
    });
    if (!pending.length) {
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    }
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
