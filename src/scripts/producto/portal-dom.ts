import { clamp01, smoothstep } from "../core/anim";
import type { PanelMotion } from "./motion-state";

const RAIL_PANEL_RANGE = 0.55;

export interface PortalRail {
  rail: HTMLElement | null;
  number: HTMLElement | null;
  fill: HTMLElement | null;
}

export function collectPanels(section: HTMLElement): PanelMotion[] {
  return [...section.querySelectorAll<HTMLElement>("[data-portal-panel]")].map((element) => {
    const rises = [...element.querySelectorAll<HTMLElement>("[data-scroll-rise]")];
    return {
      element,
      text: element.querySelector<HTMLElement>("[data-panel-text]"),
      ui: element.querySelector<HTMLElement>("[data-panel-ui]"),
      rises,
      riseOffsets: rises.map(() => 0),
      masks: [...element.querySelectorAll<HTMLElement>("[data-scroll-mask]")],
      distance: 1,
    };
  });
}

export function findPortalRail(section: HTMLElement): PortalRail {
  return {
    rail: section.querySelector<HTMLElement>("[data-portals-rail]"),
    number: section.querySelector<HTMLElement>("[data-portals-rail-number]"),
    fill: section.querySelector<HTMLElement>("[data-portals-rail-fill]"),
  };
}

interface FrameContext {
  viewportHeight: number;
  intensity: number;
  reduce: boolean;
}

function paintText(panel: PanelMotion, frame: FrameContext, exitFade: number): void {
  if (!panel.text) return;
  panel.text.style.transform = `translate3d(0,${panel.distance * frame.viewportHeight * 0.08 * frame.intensity}px,0)`;
  panel.text.style.opacity = String(1 - exitFade);
}

function paintUi(panel: PanelMotion, rect: DOMRect, frame: FrameContext, exitFade: number): void {
  if (!panel.ui) return;
  const h = frame.viewportHeight;
  const entered = frame.reduce ? 1 : smoothstep((h * 1.02 - rect.top - Math.min(rect.height, h) * 0.3) / (h * 0.45));
  const offset = -panel.distance * h * 0.05 * frame.intensity + (1 - entered) * 90;
  panel.ui.style.transform = `translate3d(0,${offset}px,0)`;
  panel.ui.style.opacity = String(entered * (1 - exitFade));
}

function paintRises(panel: PanelMotion, frame: FrameContext): void {
  const h = frame.viewportHeight;
  panel.rises.forEach((line, i) => {
    const top = line.getBoundingClientRect().top - panel.riseOffsets[i];
    const entered = frame.reduce ? 1 : smoothstep((h * 0.94 - top) / (h * 0.28));
    const offset = (1 - entered) * 36;
    panel.riseOffsets[i] = offset;
    line.style.transform = offset ? `translate3d(0,${offset}px,0)` : "";
    line.style.opacity = String(entered);
  });
}

function paintMasks(panel: PanelMotion, frame: FrameContext): void {
  const h = frame.viewportHeight;
  panel.masks.forEach((line) => {
    const top = (line.parentNode as HTMLElement).getBoundingClientRect().top;
    const entered = frame.reduce ? 1 : smoothstep((h * 0.96 - top) / (h * 0.32));
    line.style.transform = entered >= 1 ? "none" : `translateY(${(1 - entered) * 110}%)`;
  });
}

function paintPanel(panel: PanelMotion, frame: FrameContext): void {
  const h = frame.viewportHeight;
  const rect = panel.element.getBoundingClientRect();
  panel.distance = (rect.top + rect.height / 2 - h / 2) / h;
  if (rect.bottom < -h * 0.5 || rect.top > h * 1.5) return;
  const exitFade = frame.reduce ? 0 : clamp01(-panel.distance * 1.5 - 0.4);
  paintText(panel, frame, exitFade);
  paintUi(panel, rect, frame, exitFade);
  paintRises(panel, frame);
  paintMasks(panel, frame);
}

function centredPortal(panels: PanelMotion[]): number {
  let best = -1;
  let bestDistance = RAIL_PANEL_RANGE;
  panels.slice(1, 4).forEach((panel, i) => {
    if (Math.abs(panel.distance) >= bestDistance) return;
    bestDistance = Math.abs(panel.distance);
    best = i;
  });
  return best;
}

function paintRail(rail: PortalRail, panels: PanelMotion[]): void {
  const best = centredPortal(panels);
  const opacity = best >= 0 ? "1" : "0";
  if (rail.rail && rail.rail.style.opacity !== opacity) rail.rail.style.opacity = opacity;
  const label = `0${best + 1}`;
  if (rail.number && best >= 0 && rail.number.textContent !== label) rail.number.textContent = label;
  const [first, last] = [panels[1], panels[3]];
  if (rail.fill && first && last) {
    rail.fill.style.transform = `scaleY(${clamp01(-first.distance / Math.max(0.01, last.distance - first.distance))})`;
  }
}

export function paintPortals(panels: PanelMotion[], rail: PortalRail, intensity: number, reduce: boolean): void {
  const frame: FrameContext = { viewportHeight: innerHeight, intensity, reduce };
  panels.forEach((panel) => paintPanel(panel, frame));
  paintRail(rail, panels);
}
