// Verbatim ports of the 2D canvas helpers in design_handoff_smp_landing/design/
// desktop/{Home,Producto}.dc.html. Every number, colour and draw order here was
// tuned and approved in those prototypes, so constants must not be "tidied".
// Where Home and Producto disagree (card radius, shadow alpha) both variants are
// exported instead of merged, so each texture keeps the behaviour it was approved with.

export type CanvasPaint = string | CanvasGradient;

export const HOME_SHADOW_ALPHA = 0.42;
export const PRODUCTO_SHADOW_ALPHA = 0.38;

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error(`Could not get a 2D context for a ${canvas.width}x${canvas.height} canvas.`);
  }
  return ctx;
}

/** Port of `rr`. A null fill leaves the path open for the caller to clip or stroke. */
export function roundRect(
  ctx: CanvasRenderingContext2D,
  fill: CanvasPaint | null,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  if (!fill) return;
  ctx.fillStyle = fill;
  ctx.fill();
}

/**
 * Port of `t`. Home's version has no font style; Producto's adds a trailing
 * one (e.g. "italic"). Omitting it yields Home's exact font string, so both
 * prototypes' call sites map 1:1 onto this signature.
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  weight: number,
  color: string,
  align: CanvasTextAlign = "left",
  letterSpacing = 0,
  fontStyle?: string,
): void {
  ctx.font = (fontStyle ? fontStyle + " " : "") + weight + " " + size + "px Poppins";
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.letterSpacing = letterSpacing + "px";
  ctx.fillText(text, x, y);
  ctx.letterSpacing = "0px";
}

function paintShadowCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.save();
  ctx.shadowColor = "rgba(132,139,200,0.30)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 22;
  roundRect(ctx, "#fff", x, y, width, height, radius);
  ctx.restore();
}

/** Port of Home's `card`. */
export function drawHomeCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 44,
): void {
  paintShadowCard(ctx, x, y, width, height, radius);
}

/** Port of Producto's `card2d`, which reads `r || 40`, so a zero radius also means 40. */
export function drawProductoCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius?: number,
): void {
  paintShadowCard(ctx, x, y, width, height, radius || 40);
}

export function createBrandGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  gradient.addColorStop(0, "#7380ec");
  gradient.addColorStop(1, "#a78bfa");
  return gradient;
}

/** Port of Home's `grad`. */
export function gradientCircle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const gradient = createBrandGradient(ctx, x, y, x + size, y + size);
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

/** Port of Home's `badge`. */
export function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tint: string,
  color: string,
  align: "left" | "right" = "left",
): void {
  ctx.font = "600 19px Poppins";
  const badgeWidth = ctx.measureText(text).width + 32;
  const badgeX = align === "right" ? x - badgeWidth : x;
  roundRect(ctx, tint, badgeX, y - 28, badgeWidth, 40, 20);
  drawText(ctx, text, badgeX + 16, y - 1, 19, 600, color);
}

/**
 * Shared by the rings drawStudent, drawRecord and drawStudentPhone draw inline.
 * Line width and cap stay set afterwards because the inline originals left them set.
 */
export function strokeProgressRing(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  lineWidth: number,
  trackColor: string,
  progressColor: string,
  fraction: number,
): void {
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.strokeStyle = trackColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = progressColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
  ctx.stroke();
}

/** Port of Producto's `wrap`. Home's bubble wraps differently and keeps its own copy. */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  text.split(" ").forEach((word) => {
    const candidate = line ? line + " " + word : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
      return;
    }
    line = candidate;
  });
  lines.push(line);
  return lines;
}

/** Port of Producto's `rnd`. A factory so every texture replays its own deterministic sequence. */
export function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

/** Home was approved at 0.42 and Producto at 0.38 (Piloto inlines 0.38 too), hence the parameter. */
export function drawShadow(alpha: number): HTMLCanvasElement {
  const canvas = createCanvas(512, 512);
  const ctx = context2d(canvas);
  ctx.filter = "blur(34px)";
  roundRect(ctx, `rgba(70,80,180,${alpha})`, 92, 110, 328, 300, 40);
  return canvas;
}

export function drawRadial(): HTMLCanvasElement {
  const canvas = createCanvas(256, 256);
  const ctx = context2d(canvas);
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(70,80,170,0.34)");
  gradient.addColorStop(0.55, "rgba(70,80,170,0.12)");
  gradient.addColorStop(1, "rgba(70,80,170,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return canvas;
}
