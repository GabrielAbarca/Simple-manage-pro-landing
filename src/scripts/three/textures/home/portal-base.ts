import { context2d, createBrandGradient, createCanvas, drawText, roundRect } from "../../core/canvas2d";

export interface PortalSurface {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
}

export function createPortalCanvas(): HTMLCanvasElement {
  return createCanvas(1600, 1000);
}

function drawPortalLogo(ctx: CanvasRenderingContext2D): void {
  roundRect(ctx, createBrandGradient(ctx, 40, 50, 92, 102), 44, 52, 48, 48, 13);
  drawText(ctx, "SIMPLE", 106, 86, 21, 800, "#363949", "left", 0.8);
  ctx.font = "800 21px Poppins";
  ctx.letterSpacing = "0.8px";
  const simpleWordWidth = ctx.measureText("SIMPLE ").width;
  ctx.letterSpacing = "0px";
  drawText(ctx, "MANAGE PRO", 106 + simpleWordWidth, 86, 21, 800, "#ff7782", "left", 0.8);
}

function drawPortalNavItem(ctx: CanvasRenderingContext2D, label: string, index: number, isActive: boolean): void {
  const y = 190 + index * 66;
  if (isActive) {
    roundRect(ctx, "rgba(115,128,236,0.15)", 28, y - 38, 262, 60, 14);
    ctx.fillStyle = "#7380ec";
    ctx.fillRect(28, y - 38, 6, 60);
  }
  drawText(ctx, label, 62, y, 22, isActive ? 600 : 500, isActive ? "#4455e6" : "#667281");
}

export function drawPortalBase(navItems: readonly string[], activeIndex: number): PortalSurface {
  const canvas = createPortalCanvas();
  const ctx = context2d(canvas);
  ctx.fillStyle = "#f6f6f9";
  ctx.fillRect(0, 0, 1600, 1000);
  drawPortalLogo(ctx);
  navItems.forEach((label, index) => drawPortalNavItem(ctx, label, index, index === activeIndex));
  return { canvas, ctx };
}
