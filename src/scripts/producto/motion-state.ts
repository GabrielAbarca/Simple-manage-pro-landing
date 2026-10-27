// The values Producto's DOM loop measures once per frame and both 3D scenes
// read: the prototype kept them on its component (this.p, this.m, this.ex,
// this.seqOff, this.pOff, this.entr, this.pPanels). One object, passed in, so
// the scenes never query the page for state the loop already has.

/** One [data-portal-panel] block: intro, the three portals, the end panel. */
export interface PanelMotion {
  element: HTMLElement;
  text: HTMLElement | null;
  ui: HTMLElement | null;
  rises: HTMLElement[];
  /** The translate last written to each rise line, so its measured top can discount it. */
  riseOffsets: number[];
  masks: HTMLElement[];
  /** Panel centre's distance from the viewport centre, in viewport heights. */
  distance: number;
}

export interface ProductoMotion {
  /** Opening progress 0..1 as scrolled, then smoothed per frame. */
  targetProgress: number;
  progress: number;
  /** Window pointer in [-1, 1], raw and smoothed. */
  rawPointer: { x: number; y: number };
  pointer: { x: number; y: number };
  /** 0..1 as the opening's bottom edge rises through the viewport. */
  exit: number;
  openingOffscreen: boolean;
  portalsOffscreen: boolean;
  /** performance.now() when the opening objects start their push-in. */
  entranceStartMs: number;
  panels: PanelMotion[];
  /** Idle motion multiplier: 0 under reduced motion, else the design's 1. */
  intensity: number;
  reduce: boolean;
}

export const PRODUCTO_MOTION_INTENSITY = 1;

export function createProductoMotion(reduce: boolean, panels: PanelMotion[]): ProductoMotion {
  return {
    targetProgress: 0,
    progress: 0,
    rawPointer: { x: 0, y: 0 },
    pointer: { x: 0, y: 0 },
    exit: 0,
    openingOffscreen: false,
    portalsOffscreen: true,
    entranceStartMs: Number.POSITIVE_INFINITY,
    panels,
    intensity: reduce ? 0 : PRODUCTO_MOTION_INTENSITY,
    reduce,
  };
}
