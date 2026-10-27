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
