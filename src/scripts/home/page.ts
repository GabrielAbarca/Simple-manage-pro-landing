// Home orchestration: intro, early exit on scroll, and the three scenes.
// The hero scene starts right after first paint; the other two load when
// their stage comes within a viewport.

import { prefersReducedMotion } from "../core/anim";
import { reportSceneError, whenNear } from "../core/lazy-scene";
import { HomeIntro, revealHeroHeadline } from "./intro";

// The approved design plays the intro on every visit. Set false to play it
// once per session (sessionStorage "smp-intro-seen" is already written).
const ALWAYS_PLAY_INTRO = true;
const EARLY_EXIT_PROGRESS = 0.015;
export const HOME_MOTION_INTENSITY = 1.6;

function introAlreadySeen(): boolean {
  try { return sessionStorage.getItem("smp-intro-seen") === "1"; } catch { return false; }
}

function heroScrollProgress(hero: HTMLElement): number {
  const rect = hero.getBoundingClientRect();
  const scrollable = hero.offsetHeight - innerHeight;
  return scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
}

/** The design always opens Home at the top, then honours a #fragment. */
function resetScrollPosition(): void {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);
  if (!location.hash) return;
  setTimeout(() => {
    const target = document.getElementById(location.hash.slice(1));
    if (target) scrollTo(0, target.getBoundingClientRect().top + scrollY);
  }, 400);
}

function startIntro(hero: HTMLElement, onHeroIn: (entranceStartMs: number) => void): void {
  const shouldPlay = (ALWAYS_PLAY_INTRO || !introAlreadySeen()) && !prefersReducedMotion();
  const intro = shouldPlay ? HomeIntro.create(onHeroIn) : null;
  if (!intro) {
    document.querySelector<HTMLElement>("[data-intro]")?.style.setProperty("display", "none");
    onHeroIn(revealHeroHeadline(true));
    return;
  }
  intro.start();
  const onScroll = () => {
    if (!intro.isRunning) return removeEventListener("scroll", onScroll);
    if (heroScrollProgress(hero) > EARLY_EXIT_PROGRESS) intro.exitEarly();
  };
  addEventListener("scroll", onScroll, { passive: true });
}

function loadSecondaryScenes(): void {
  const security = document.querySelector<HTMLElement>("[data-security-stage]");
  const contact = document.querySelector<HTMLElement>("[data-contact-stage]");
  if (security) {
    whenNear(security, () =>
      import("../three/scenes/home-security")
        .then((scene) => scene.startHomeSecurity(security, HOME_MOTION_INTENSITY))
        .catch((error) => reportSceneError("home-security", error)),
    );
  }
  if (contact) {
    whenNear(contact, () =>
      import("../three/scenes/home-contact")
        .then((scene) => scene.startHomeContact(contact, HOME_MOTION_INTENSITY))
        .catch((error) => reportSceneError("home-contact", error)),
    );
  }
}

export function initHomePage(): void {
  const hero = document.querySelector<HTMLElement>("[data-home-hero]");
  if (!hero) return;
  resetScrollPosition();
  let entranceStartMs = Number.POSITIVE_INFINITY;
  startIntro(hero, (startMs) => { entranceStartMs = startMs; });
  requestAnimationFrame(() =>
    import("../three/scenes/home-portals")
      .then((scene) => scene.startHomePortals(hero, () => entranceStartMs, HOME_MOTION_INTENSITY))
      .catch((error) => reportSceneError("home-portals", error)),
  );
  loadSecondaryScenes();
}
