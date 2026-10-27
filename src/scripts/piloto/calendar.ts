// The Piloto calendar animation, ported from Piloto.dc.html `loop`. It plays
// once, when the section's top passes 60% of the viewport. Both variants are
// in the DOM (CSS shows one per breakpoint), so both are painted from the
// same start time: the desktop month grid over 1000ms, the mobile/tablet
// timeline over 1600ms, both quad in-out. Reduced motion paints the end
// state at the trigger instead of animating to it, as the prototype does.

import { calendarCopy } from "../../data/piloto";
import { clamp01, easeInOutQuad, prefersReducedMotion } from "../core/anim";

const TRIGGER_VIEWPORT_FRACTION = 0.6;
const GRID_DURATION_MS = 1000;
const TIMELINE_DURATION_MS = 1600;
const MONTH_COUNT = calendarCopy.months.length;
/** Month index (0 = FEB) at which each milestone card starts to reveal. */
const MILESTONE_MONTH_STARTS = [0, 0.5, 5, 10];
const DOT_ACTIVE = "#4455e6";
const DOT_IDLE = "#c9cdf5";

interface MonthElements {
  root: HTMLElement;
  bar: HTMLElement;
}

interface CalendarElements {
  monthLabel: HTMLElement | null;
  months: MonthElements[];
  gridMilestones: HTMLElement[];
  timelineFill: HTMLElement | null;
  timelineMilestones: HTMLElement[];
}

function collectElements(section: HTMLElement): CalendarElements {
  const months = [...section.querySelectorAll<HTMLElement>("[data-month]")].flatMap((root) => {
    const bar = root.querySelector<HTMLElement>("[data-month-bar]");
    return bar ? [{ root, bar }] : [];
  });
  return {
    monthLabel: section.querySelector<HTMLElement>("[data-calendar-month-label]"),
    months,
    gridMilestones: [...section.querySelectorAll<HTMLElement>('[data-milestone="grid"]')],
    timelineFill: section.querySelector<HTMLElement>("[data-timeline-fill]"),
    timelineMilestones: [...section.querySelectorAll<HTMLElement>('[data-milestone="timeline"]')],
  };
}

function revealCard(card: HTMLElement, amount: number): void {
  card.style.opacity = String(0.25 + 0.75 * amount);
  card.style.transform = `translateY(${(1 - amount) * 16}px)`;
}

function paintMonthGrid(elements: CalendarElements, progress: number): void {
  const monthPosition = easeInOutQuad(progress) * MONTH_COUNT;
  elements.months.forEach(({ root, bar }, i) => {
    const fill = clamp01(monthPosition - i);
    bar.style.transform = `scaleX(${fill})`;
    const opacity = fill > 0 ? "1" : "0.35";
    if (root.style.opacity !== opacity) root.style.opacity = opacity;
  });
  const label = calendarCopy.months[Math.min(MONTH_COUNT - 1, Math.floor(monthPosition))];
  if (elements.monthLabel && elements.monthLabel.textContent !== label) elements.monthLabel.textContent = label;
  elements.gridMilestones.forEach((card, j) => {
    revealCard(card, clamp01((monthPosition - MILESTONE_MONTH_STARTS[j]) * 2.5));
  });
}

function paintTimeline(elements: CalendarElements, progress: number): void {
  const fill = easeInOutQuad(progress);
  if (elements.timelineFill) elements.timelineFill.style.transform = `scaleY(${fill})`;
  elements.timelineMilestones.forEach((card, j) => {
    const amount = clamp01((fill * 3.4 - j) * 1.8 + 0.4);
    revealCard(card, amount);
    const dot = card.querySelector<HTMLElement>("[data-timeline-dot]");
    if (dot) dot.style.background = amount > 0.5 ? DOT_ACTIVE : DOT_IDLE;
  });
}

function play(elements: CalendarElements): void {
  const startTime = performance.now();
  const still = prefersReducedMotion();
  const frame = (now: number) => {
    const elapsed = now - startTime;
    const gridProgress = still ? 1 : clamp01(elapsed / GRID_DURATION_MS);
    const timelineProgress = still ? 1 : clamp01(elapsed / TIMELINE_DURATION_MS);
    paintMonthGrid(elements, gridProgress);
    paintTimeline(elements, timelineProgress);
    if (timelineProgress < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** Arms the calendar: rewinds the ghost label, then plays once on trigger. */
export function initCalendar(section: HTMLElement | null): void {
  if (!section) return;
  const elements = collectElements(section);
  if (elements.monthLabel) elements.monthLabel.textContent = calendarCopy.months[0];
  let scheduled = false;
  const check = () => {
    scheduled = false;
    if (section.getBoundingClientRect().top >= innerHeight * TRIGGER_VIEWPORT_FRACTION) return;
    removeEventListener("scroll", schedule);
    removeEventListener("resize", schedule);
    play(elements);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(check);
  };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  check();
}
