import { context2d, createCanvas, createSeededRandom, drawText } from "../../core/canvas2d";

const W = 900;
const H = 1200;

const STUDENTS = [
  "Alvarado, Sofía",
  "Brenes, Mateo",
  "Castro, Valeria",
  "Fallas, Diego",
  "Jiménez, Ana",
  "Mora, Isaac",
  "Navarro, Pablo",
  "Rojas, Yendry",
  "Solano, Luis",
  "Ulate, María",
  "Vargas, Elena",
  "Vega, Camila",
  "Zúñiga, Tomás",
];

function drawSheetHeading(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#fbf8ef";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#f0a8a8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 0);
  ctx.lineTo(70, H);
  ctx.stroke();
  drawText(ctx, "Lista de asistencia", 92, 110, 46, 700, "#2b3a8f", "left", 0, "italic");
  drawText(ctx, "Sección 10-2 · Semana 6", 94, 160, 26, 500, "#4a5cae", "left", 0, "italic");
  ["L", "K", "M", "J", "V"].forEach((day, j) => drawText(ctx, day, 560 + j * 64, 240, 26, 700, "#2b3a8f", "center", 0, "italic"));
}

function drawCheckMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, random: () => number): void {
  ctx.strokeStyle = "#2b3a8f";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 13 + random() * 3, cy - 2);
  ctx.lineTo(cx - 3, cy + 9);
  ctx.lineTo(cx + 14, cy - 15 + random() * 5);
  ctx.stroke();
}

function drawDayMark(ctx: CanvasRenderingContext2D, row: number, day: number, y: number, random: () => number): void {
  const cx = 560 + day * 64;
  const cy = y - 10;
  // Draw before the Friday skip: skipped cells must still consume
  // the seeded sequence, or every later mark shifts.
  const roll = random();
  if (day === 4 && row > 7) return;
  if (roll < 0.1) {
    drawText(ctx, "A", cx, y, 28, 700, "#c0392b", "center", 0, "italic");
    return;
  }
  if (roll < 0.16) {
    drawText(ctx, "T", cx, y, 28, 700, "#b86e00", "center", 0, "italic");
    return;
  }
  drawCheckMark(ctx, cx, cy, random);
}

function drawStudentRow(ctx: CanvasRenderingContext2D, row: number, random: () => number): void {
  const y = 300 + row * 64;
  ctx.strokeStyle = "rgba(80,110,200,0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y + 18);
  ctx.lineTo(W, y + 18);
  ctx.stroke();
  if (row >= STUDENTS.length) return;
  drawText(ctx, STUDENTS[row], 94, y, 26, 500, "#2b3a8f", "left", 0, "italic");
  for (let day = 0; day < 5; day++) drawDayMark(ctx, row, day, y, random);
}

function drawCoffeeRing(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "rgba(150,100,40,0.16)";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(720, 1080, 90, 0.3, Math.PI * 1.8);
  ctx.stroke();
}

export function drawAttendance(): HTMLCanvasElement {
  const canvas = createCanvas(W, H);
  const ctx = context2d(canvas);
  const random = createSeededRandom(42);
  drawSheetHeading(ctx);
  for (let row = 0; row < 14; row++) drawStudentRow(ctx, row, random);
  drawCoffeeRing(ctx);
  return canvas;
}
