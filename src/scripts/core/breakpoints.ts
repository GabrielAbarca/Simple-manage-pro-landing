import { BREAKPOINTS } from "../../config";

export type Layout = "mobile" | "tablet" | "desktop";

const desktopQuery = matchMedia(`(min-width: ${BREAKPOINTS.desktop}px)`);
const tabletQuery = matchMedia(`(min-width: ${BREAKPOINTS.tablet}px)`);

export function currentLayout(): Layout {
  if (desktopQuery.matches) return "desktop";
  return tabletQuery.matches ? "tablet" : "mobile";
}

export function onLayoutChange(callback: (layout: Layout) => void): () => void {
  const listener = () => callback(currentLayout());
  desktopQuery.addEventListener("change", listener);
  tabletQuery.addEventListener("change", listener);
  return () => {
    desktopQuery.removeEventListener("change", listener);
    tabletQuery.removeEventListener("change", listener);
  };
}

export const pixelRatioCap = (): number =>
  Math.min(devicePixelRatio, currentLayout() === "desktop" ? 2 : 1.5);
