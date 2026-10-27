import { context2d, createCanvas, drawText } from "../../core/canvas2d";

type ReportGrade = readonly [subject: string, grade: string];
type SignatureLine = readonly [x: number, label: string];

const W = 900;
const H = 1200;
const AVERAGE_Y = 910;

const GRADES: readonly ReportGrade[] = [
  ["Matemáticas", "64"],
  ["Español", "81"],
  ["Ciencias", "72"],
  ["Estudios Sociales", "77"],
  ["Inglés", "85"],
  ["Educación Cívica", "79"],
  ["Artes Plásticas", "90"],
];

const SIGNATURES: readonly SignatureLine[] = [
  [80, "Docente guía"],
  [500, "Dirección"],
];

function drawReportHeader(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  drawText(ctx, "INFORME DE CALIFICACIONES", 80, 120, 30, 700, "#1f2430", "left", 2);
  drawText(ctx, "I Periodo 2026 · Sección 10-2", 80, 164, 24, 400, "#4b5563");
  ctx.fillStyle = "#1f2430";
  ctx.fillRect(80, 196, W - 160, 3);
  drawText(ctx, "Estudiante: Fallas Ureña, Diego", 80, 252, 24, 500, "#1f2430");
  drawText(ctx, "Asignatura", 80, 330, 20, 700, "#4b5563");
  drawText(ctx, "Nota", W - 80, 330, 20, 700, "#4b5563", "right");
}

function drawGradeRows(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "#c4c9d2";
  ctx.lineWidth = 1.5;
  GRADES.forEach(([subject, grade], i) => {
    const y = 400 + i * 70;
    ctx.beginPath();
    ctx.moveTo(80, y - 46);
    ctx.lineTo(W - 80, y - 46);
    ctx.stroke();
    drawText(ctx, subject, 80, y, 24, 400, "#1f2430");
    drawText(ctx, grade, W - 80, y, 24, 500, "#1f2430", "right");
  });
}

function drawCorrectedGrade(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "#d30011";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(W - 128, 534);
  ctx.lineTo(W - 74, 526);
  ctx.stroke();
  drawText(ctx, "74", W - 146, 544, 32, 700, "#d30011", "right", 0, "italic");
}

function drawCircledAverage(ctx: CanvasRenderingContext2D): void {
  const yP = AVERAGE_Y;
  ctx.fillStyle = "#1f2430";
  ctx.fillRect(80, yP - 50, W - 160, 2);
  drawText(ctx, "Promedio", 80, yP, 26, 700, "#1f2430");
  drawText(ctx, "78,3", W - 80, yP, 26, 700, "#1f2430", "right");
  ctx.strokeStyle = "#d30011";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(W - 118, yP - 10, 76, 42, -0.08, 0.2, Math.PI * 2.1);
  ctx.stroke();
  drawText(ctx, "¿revisar?", W - 210, yP + 74, 28, 600, "#d30011", "right", 0, "italic");
}

function drawSignatureLines(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 2;
  SIGNATURES.forEach(([x, label]) => {
    ctx.beginPath();
    ctx.moveTo(x, 1100);
    ctx.lineTo(x + 320, 1100);
    ctx.stroke();
    drawText(ctx, label, x, 1136, 20, 500, "#4b5563");
  });
}

export function drawReport(): HTMLCanvasElement {
  const canvas = createCanvas(W, H);
  const ctx = context2d(canvas);
  drawReportHeader(ctx);
  drawGradeRows(ctx);
  drawCorrectedGrade(ctx);
  drawCircledAverage(ctx);
  drawSignatureLines(ctx);
  return canvas;
}
