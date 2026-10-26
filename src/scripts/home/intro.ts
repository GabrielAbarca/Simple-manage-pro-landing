// Home intro timeline, ported from Home.dc.html (runIntro, introPhase2,
// introExit, heroIn). Constants are the approved ones; don't tune them here.
//
// Phase 1 (1.7s): counter 000→100, progress bar, months fill in sequence.
// Phase 2: counter and months drop away, the two lines rise.
// Exit (1.1s, or 0.7s if the visitor scrolls first): the overlay wipes up and
// the hero headline and slabs enter.

import { easeInOutCubic, fadeIn, riseIn, tween } from "../core/anim";
import { setHeaderOnDark } from "../core/header";

const PHASE_ONE_MS = 1700;
const PHASE_ONE_DELAY_MS = 150;
const EXIT_AFTER_PHASE_TWO_MS = 1700;
const EXIT_MS = 1100;
const EARLY_EXIT_MS = 700;
const HEADER_FLIP_AT = 0.86;

interface IntroElements {
  overlay: HTMLElement;
  lines: HTMLElement;
  months: HTMLElement[];
  monthsRow: HTMLElement;
  counter: HTMLElement;
  progress: HTMLElement;
}

function findIntroElements(): IntroElements | null {
  const overlay = document.querySelector<HTMLElement>("[data-intro]");
  if (!overlay) return null;
  const pick = (selector: string) => overlay.querySelector<HTMLElement>(selector)!;
  return {
    overlay,
    lines: pick("[data-intro-lines]"),
    months: [...overlay.querySelectorAll<HTMLElement>("[data-month]")],
    monthsRow: pick("[data-intro-months]"),
    counter: pick("[data-intro-counter]"),
    progress: pick("[data-intro-progress]"),
  };
}

/** Hero headline rise and fades. Returns when the slabs' entrance starts. */
export function revealHeroHeadline(instant: boolean): number {
  const hero = document.querySelector<HTMLElement>("[data-home-hero]");
  if (hero && !instant) {
    hero.querySelectorAll<HTMLElement>("[data-hero-headline] [data-rise]").forEach((el, i) => riseIn(el, 1200, 80 + i * 100));
    hero.querySelectorAll<HTMLElement>("[data-fade]").forEach((el, i) => fadeIn(el, 900, 450 + i * 90, 14));
  }
  return performance.now() + (instant ? -5000 : 100);
}

export class HomeIntro {
  private generation = 1;
  private running = true;
  private exited = false;
  private exitTimer = 0;

  constructor(
    private readonly elements: IntroElements,
    private readonly onHeroIn: (entranceStartMs: number) => void,
  ) {}

  static create(onHeroIn: (entranceStartMs: number) => void): HomeIntro | null {
    const elements = findIntroElements();
    return elements ? new HomeIntro(elements, onHeroIn) : null;
  }

  get isRunning(): boolean {
    return this.running && !this.exited;
  }

  start(): void {
    setHeaderOnDark(true);
    tween({
      durationMs: PHASE_ONE_MS,
      delayMs: PHASE_ONE_DELAY_MS,
      easing: easeInOutCubic,
      isCurrent: this.isPhaseCurrent,
      onFrame: (e) => this.paintPhaseOne(e),
      onDone: () => this.phaseTwo(),
    });
  }

  /** The visitor scrolled into the hero before the intro finished. */
  exitEarly(): void {
    this.generation = 2;
    clearTimeout(this.exitTimer);
    this.exit(EARLY_EXIT_MS);
  }

  private isPhaseCurrent = (): boolean => this.generation === 1;

  private paintPhaseOne(e: number): void {
    const { counter, progress, months } = this.elements;
    counter.textContent = String(Math.round(e * 100)).padStart(3, "0");
    progress.style.transform = `scaleX(${e})`;
    months.forEach((month, i) => {
      const fill = Math.min(1, Math.max(0, e * 11 - i));
      month.querySelector<HTMLElement>("[data-month-bar]")!.style.transform = `scaleX(${fill})`;
      month.style.opacity = String(0.35 + 0.65 * fill);
    });
  }

  private phaseTwo(): void {
    const { counter, monthsRow, overlay } = this.elements;
    [counter, monthsRow].forEach((el) =>
      tween({
        durationMs: 500,
        isCurrent: this.isPhaseCurrent,
        onFrame: (e) => {
          el.style.opacity = String(1 - e);
          el.style.transform = `translateY(${e * 20}px)`;
        },
      }),
    );
    overlay.querySelectorAll<HTMLElement>("[data-irise]").forEach((el, i) =>
      tween({
        durationMs: 1000,
        delayMs: 150 + i * 110,
        isCurrent: this.isPhaseCurrent,
        onFrame: (e) => { el.style.transform = `translateY(${(1 - e) * 110}%)`; },
      }),
    );
    this.exitTimer = window.setTimeout(() => this.exit(EXIT_MS), EXIT_AFTER_PHASE_TWO_MS);
  }

  private exit(durationMs: number): void {
    if (this.exited) return;
    this.exited = true;
    try { sessionStorage.setItem("smp-intro-seen", "1"); } catch { /* storage blocked: nothing to remember */ }
    tween({
      durationMs,
      easing: easeInOutCubic,
      onFrame: (e) => this.paintWipe(e),
      onDone: () => this.finish(),
    });
    setTimeout(() => this.onHeroIn(revealHeroHeadline(false)), durationMs * 0.35);
  }

  private paintWipe(e: number): void {
    this.elements.overlay.style.clipPath = `inset(0 0 ${e * 100}% 0)`;
    this.elements.lines.style.transform = `translateY(${-e * 18}vh)`;
    if (e > HEADER_FLIP_AT) setHeaderOnDark(false);
  }

  private finish(): void {
    this.elements.overlay.style.display = "none";
    this.running = false;
    setHeaderOnDark(false);
  }
}
