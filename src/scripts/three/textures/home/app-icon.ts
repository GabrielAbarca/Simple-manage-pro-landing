// Port of the app-icon tile texture built inline in Home's `initContact`
// (design_handoff_smp_landing/design/desktop/Home.dc.html): a white 640px square
// with the icon drawn at 96,96 / 448px. The canvas is usable immediately (plain
// white) and `ready` settles once the icon is painted, so the caller can flag
// its texture for re-upload. `ready` rejects if the image fails to load.

import { context2d, createCanvas } from "../../core/canvas2d";

export interface AppIconCanvas {
  readonly canvas: HTMLCanvasElement;
  readonly ready: Promise<void>;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load the app icon image at ${url}.`));
    image.src = url;
  });
}

export function createAppIconCanvas(imageUrl: string): AppIconCanvas {
  const canvas = createCanvas(640, 640);
  const ctx = context2d(canvas);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 640, 640);
  const ready = loadImage(imageUrl).then((image) => {
    ctx.drawImage(image, 96, 96, 448, 448);
  });
  return { canvas, ready };
}
