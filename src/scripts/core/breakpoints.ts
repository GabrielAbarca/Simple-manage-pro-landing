// The design's three layouts as a value the 3D scenes can switch on. CSS
// switches on the same widths with min-width queries.

import { BREAKPOINTS } from "../../config";

export type Layout = "mobile" | "tablet" | "desktop";

const desktopQuery = matchMedia(`(min-width: ${BREAKPOINTS.desktop}px)`);
const tabletQuery = matchMedia(`(min-width: ${BREAKPOINTS.tablet}px)`);

export function currentLayout(): Layout {
  if (desktopQuery.matches) return "desktop";
  return tabletQuery.matches ? "tablet" : "mobile";
}

/** Calls back with the new layout whenever a breakpoint is crossed. */
export function onLayoutChange(callback: (layout: Layout) => void): () => void {
  const listener = () => callback(currentLayout());
  desktopQuery.addEventListener("change", listener);
  tabletQuery.addEventListener("change", listener);
  return () => {
    desktopQuery.removeEventListener("change", listener);
    tabletQuery.removeEventListener("change", listener);
  };
}

/** WebGL pixel ratio cap: 2 on desktop, 1.5 below it. */
export const pixelRatioCap = (): number =>
  Math.min(devicePixelRatio, currentLayout() === "desktop" ? 2 : 1.5);
