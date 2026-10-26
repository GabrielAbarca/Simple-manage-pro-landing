// Runtime hooks for the DS components in src/components/ui. Those components
// render static HTML; a page script that needs to change one afterwards goes
// through these helpers, which only touch the attributes and elements the
// components already expose. The pure helpers are also imported by the
// components at build time, so the first paint and every later update use
// the same arithmetic.

export type BadgeTone = "primary" | "success" | "danger" | "warning" | "info" | "neutral";
export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type GradeBand = "success" | "warning" | "danger";

/** The DS ring's dash length: 2πr for r = 37, rounded the way the bundle rounds it. */
export const PROGRESS_RING_CIRCUMFERENCE = 232;

const GRADE_BAND_SUCCESS_THRESHOLD = 85;
const GRADE_BAND_WARNING_THRESHOLD = 70;

export function clampToPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function computeProgressRingDashOffset(value: number): number {
  const filledLength = (clampToPercentage(value) / 100) * PROGRESS_RING_CIRCUMFERENCE;
  return PROGRESS_RING_CIRCUMFERENCE - filledLength;
}

export function computeGradePercentage(value: number, max: number): number {
  if (!Number.isFinite(max) || max <= 0) return 0;
  return clampToPercentage((value / max) * 100);
}

export function resolveGradeBand(percentage: number): GradeBand {
  if (percentage >= GRADE_BAND_SUCCESS_THRESHOLD) return "success";
  if (percentage >= GRADE_BAND_WARNING_THRESHOLD) return "warning";
  return "danger";
}

export function setBadge(badgeElement: HTMLElement, tone: BadgeTone, label: string): void {
  badgeElement.dataset.tone = tone;
  badgeElement.textContent = label;
}

export function setButtonVariant(buttonElement: HTMLElement, variant: ButtonVariant): void {
  buttonElement.dataset.variant = variant;
}

export function setButtonLabel(buttonElement: HTMLElement, label: string): void {
  const labelElement = buttonElement.querySelector<HTMLElement>("[data-label]");
  if (!labelElement) return;
  labelElement.textContent = label;
}

/** Pass `label` only when the ring shows something other than "N%". */
export function setProgressRing(ringElement: HTMLElement, value: number, label?: string): void {
  const arcElement = ringElement.querySelector<SVGCircleElement>("[data-ring-value]");
  const labelElement = ringElement.querySelector<HTMLElement>("[data-ring-label]");
  if (!arcElement || !labelElement) return;
  const clampedValue = clampToPercentage(value);
  // Written as a style, not the attribute, so the CSS transition on
  // stroke-dashoffset animates the change.
  arcElement.style.strokeDashoffset = String(computeProgressRingDashOffset(clampedValue));
  ringElement.dataset.value = String(clampedValue);
  labelElement.textContent = label ?? `${value}%`;
}

export function setGradeBar(gradeBarElement: HTMLElement, value: number): void {
  const fillElement = gradeBarElement.querySelector<HTMLElement>("[data-grade-bar-fill]");
  if (!fillElement) return;
  const max = Number(gradeBarElement.dataset.max ?? 100);
  const percentage = computeGradePercentage(value, max);
  fillElement.style.width = `${percentage}%`;
  gradeBarElement.dataset.band = resolveGradeBand(percentage);
  gradeBarElement.dataset.value = String(value);
}
