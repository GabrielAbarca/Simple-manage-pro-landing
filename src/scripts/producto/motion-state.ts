export interface PanelMotion {
  element: HTMLElement;
  text: HTMLElement | null;
  ui: HTMLElement | null;
  rises: HTMLElement[];
  riseOffsets: number[];
  masks: HTMLElement[];
  distance: number;
}

export interface ProductoMotion {
  targetProgress: number;
  progress: number;
  rawPointer: { x: number; y: number };
  pointer: { x: number; y: number };
  exit: number;
  openingOffscreen: boolean;
  portalsOffscreen: boolean;
  entranceStartMs: number;
  panels: PanelMotion[];
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
