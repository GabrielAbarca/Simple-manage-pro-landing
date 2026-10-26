// Port of Producto's `drawGradebook` from design_handoff_smp_landing/design/desktop/
// Producto.dc.html: the cover of the gradebook object in the portals scene. Every
// number and string is approved as is, including the "—" placeholder grade.

import { context2d, createCanvas, drawText, roundRect } from "../../core/canvas2d";

type GradebookRow = readonly [student: string, firstPeriod: string, secondPeriod: string];

const W = 1000;
const H = 1300;

const ROWS: readonly GradebookRow[] = [
  ["Alvarado, Sofía", "88", "91"],
  ["Brenes, Mateo", "76", "82"],
  ["Castro, Valeria", "93", "95"],
  ["Fallas, Diego", "64", "72"],
  ["Jiménez, Ana", "85", "88"],
  ["Mora, Isaac", "79", "—"],
];

function drawCover(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#5a69e9";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 4;
  roundRect(ctx, null, 60, 60, W - 120, H - 120, 28);
  ctx.stroke();
  drawText(ctx, "LIBRO DE NOTAS", 120, 200, 38, 600, "rgba(255,255,255,0.85)", "left", 6);
  drawText(ctx, "Matemáticas", 120, 330, 104, 800, "#fff", "left", -3);
  drawText(ctx, "Sección 10-2 · 2026", 124, 400, 40, 500, "rgba(255,255,255,0.85)");
}

// The prototype compares the grade as a string (`r[1] < '70'`); kept, since it
// is what was approved and it orders these two-digit grades correctly.
function drawGradeRow(ctx: CanvasRenderingContext2D, [student, firstPeriod, secondPeriod]: GradebookRow, index: number): void {
  const y = 660 + index * 70;
  ctx.fillStyle = "rgba(132,139,200,0.25)";
  ctx.fillRect(160, y - 46, W - 320, 2);
  drawText(ctx, student, 160, y, 30, 500, "#363949");
  drawText(ctx, firstPeriod, 700, y, 30, 700, firstPeriod < "70" ? "#d4414f" : "#363949", "right");
  drawText(ctx, secondPeriod, W - 160, y, 30, 700, "#363949", "right");
}

function drawGradeTable(ctx: CanvasRenderingContext2D): void {
  roundRect(ctx, "#fff", 120, 520, W - 240, 560, 24);
  drawText(ctx, "Estudiante", 160, 590, 26, 600, "#627388");
  drawText(ctx, "I P.", 700, 590, 26, 600, "#627388", "right");
  drawText(ctx, "II P.", W - 160, 590, 26, 600, "#627388", "right");
  ROWS.forEach((row, i) => drawGradeRow(ctx, row, i));
}

export function drawGradebook(): HTMLCanvasElement {
  const canvas = createCanvas(W, H);
  const ctx = context2d(canvas);
  drawCover(ctx);
  drawGradeTable(ctx);
  return canvas;
}
