// Canvas textures need Poppins before their first draw, and need a redraw
// whenever another weight finishes loading, or text measured against the
// fallback font stays on the slab. Same triggers as the prototypes, minus the
// ones that would only repeat a draw: when every face is already loaded at
// build time, a redraw on fonts.ready paints the same pixels again, and on a
// throttled phone each 1600px canvas costs a visible chunk of main thread.

import * as THREE from "three";

const REDRAW_FALLBACK_MS = [1500, 4000];

export async function loadPoppins(weights: string[] = ["400", "500", "600", "700", "800"], styles: string[] = []): Promise<void> {
  const loads = [
    ...weights.map((weight) => document.fonts.load(`${weight} 40px Poppins`)),
    ...styles.map((style) => document.fonts.load(`${style} 40px Poppins`)),
  ];
  try {
    await Promise.all(loads);
  } catch {
    // A missing weight falls back to a system face; the redraw hooks below
    // repaint once anything else arrives.
  }
}

/** Gives the browser a turn between heavy steps, so no single task blocks input. */
export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export interface RedrawableTexture {
  texture: THREE.CanvasTexture;
  redraw: () => void;
}

export function canvasTexture(
  draw: () => HTMLCanvasElement,
  renderer: THREE.WebGLRenderer,
): RedrawableTexture {
  const texture = new THREE.CanvasTexture(draw());
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const redraw = () => {
    texture.image = draw();
    texture.needsUpdate = true;
  };
  return { texture, redraw };
}

/** Repaint once fonts settle (only if they hadn't), and whenever a new face loads. */
export function redrawWhenFontsSettle(textures: RedrawableTexture[]): void {
  const redrawAll = () => textures.forEach((entry) => entry.redraw());
  document.fonts.addEventListener("loadingdone", redrawAll);
  if (document.fonts.status === "loaded") return;
  document.fonts.ready.then(redrawAll);
  REDRAW_FALLBACK_MS.forEach((delay) => setTimeout(redrawAll, delay));
}
