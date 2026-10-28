import { context2d, createCanvas, drawText, roundRect } from "../../core/canvas2d";

type FormField = readonly [label: string, value: string];

const W = 1000;
const H = 1316;

const FIELDS: readonly FormField[] = [
  ["COLEGIO", "Colegio Los Robles"],
  ["DIRECCIÓN A CARGO", "Mariela Castro Solís"],
  ["CORREO", "direccion@losrobles.ed.cr"],
];

const LEVELS = ["7°", "8°", "9°", "10°", "11°", "12°"];
const CHECKED_LEVEL_COUNT = 5;

function drawFormHeader(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  drawText(ctx, "SOLICITUD", 80, 150, 26, 600, "#4455e6", "left", 4);
  drawText(ctx, "Piloto 2027", 80, 250, 86, 800, "#363949", "left", -3);
  drawText(ctx, "Simple Manage Pro · Programa piloto", 82, 306, 28, 500, "#667281");
  ctx.fillStyle = "rgba(132,139,200,0.3)";
  ctx.fillRect(80, 346, W - 160, 3);
}

function drawFormField(ctx: CanvasRenderingContext2D, [label, value]: FormField, index: number): void {
  const y = 420 + index * 140;
  drawText(ctx, label, 80, y, 22, 600, "#627388", "left", 2);
  ctx.strokeStyle = "#627388";
  ctx.lineWidth = 2.5;
  roundRect(ctx, null, 80, y + 18, W - 160, 76, 16);
  ctx.stroke();
  drawText(ctx, value, 108, y + 68, 30, 500, "#363949");
}

function drawCheckedBox(ctx: CanvasRenderingContext2D, X: number): void {
  roundRect(ctx, "#5a69e9", X, 890, 40, 40, 10);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(X + 10, 911);
  ctx.lineTo(X + 18, 919);
  ctx.lineTo(X + 31, 902);
  ctx.stroke();
}

function drawEmptyBox(ctx: CanvasRenderingContext2D, X: number): void {
  ctx.strokeStyle = "#627388";
  ctx.lineWidth = 2.5;
  roundRect(ctx, null, X, 890, 40, 40, 10);
  ctx.stroke();
}

function drawLevels(ctx: CanvasRenderingContext2D): void {
  drawText(ctx, "NIVELES", 80, 860, 22, 600, "#627388", "left", 2);
  LEVELS.forEach((level, i) => {
    const X = 80 + i * 140;
    if (i < CHECKED_LEVEL_COUNT) drawCheckedBox(ctx, X);
    else drawEmptyBox(ctx, X);
    drawText(ctx, level, X + 54, 922, 28, 600, "#363949");
  });
}

function drawSignatureBlock(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "#2b3a8f";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(110, 1160);
  ctx.bezierCurveTo(140, 1080, 170, 1090, 175, 1150);
  ctx.bezierCurveTo(185, 1100, 220, 1095, 230, 1150);
  ctx.bezierCurveTo(250, 1120, 290, 1110, 340, 1145);
  ctx.stroke();
  ctx.fillStyle = "#9ca3af";
  ctx.fillRect(80, 1180, 520, 2.5);
  drawText(ctx, "Firma de la dirección", 80, 1222, 22, 500, "#627388");
  drawText(ctx, "Febrero 2027", W - 80, 1176, 26, 500, "#363949", "right");
  drawText(ctx, "Fecha", W - 80, 1222, 22, 500, "#627388", "right");
}

export function drawForm(): HTMLCanvasElement {
  const canvas = createCanvas(W, H);
  const ctx = context2d(canvas);
  drawFormHeader(ctx);
  FIELDS.forEach((field, i) => drawFormField(ctx, field, i));
  drawLevels(ctx);
  drawSignatureBlock(ctx);
  return canvas;
}
