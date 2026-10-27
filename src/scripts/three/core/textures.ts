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
    // A missing weight falls back to a system face; the redraw hooks repaint later.
  }
}

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

// Always redraw when a face finishes loading. Skip the ready and timer redraws if
// everything was already loaded: they repaint identical pixels and burden phones.
export function redrawWhenFontsSettle(textures: RedrawableTexture[]): void {
  const redrawAll = () => textures.forEach((entry) => entry.redraw());
  document.fonts.addEventListener("loadingdone", redrawAll);
  if (document.fonts.status === "loaded") return;
  document.fonts.ready.then(redrawAll);
  REDRAW_FALLBACK_MS.forEach((delay) => setTimeout(redrawAll, delay));
}
