import { context2d, createCanvas, drawProductoCard, drawText, roundRect, strokeProgressRing } from "../../core/canvas2d";

type SubjectGrade = readonly [subject: string, grade: number];

const W = 600;
const H = 1305;

const SUBJECT_GRADES: readonly SubjectGrade[] = [
  ["Matemáticas", 88],
  ["Español", 91],
  ["Química", 79],
  ["Física", 84],
  ["Inglés", 95],
  ["Cívica", 86],
];

function drawScreenHeader(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#f6f6f9";
  ctx.fillRect(0, 0, W, H);
  drawText(ctx, "9:41", 48, 60, 24, 600, "#363949");
  drawText(ctx, "Mis notas", 48, 170, 52, 800, "#363949", "left", -1);
  drawText(ctx, "I Periodo · 2026", 50, 216, 24, 500, "#667281");
}

function drawSummaryCard(ctx: CanvasRenderingContext2D): void {
  drawProductoCard(ctx, 32, 260, W - 64, 230, 36);
  strokeProgressRing(ctx, 150, 375, 64, 16, "rgba(132,139,200,0.2)", "#7380ec", 0.96);
  drawText(ctx, "96 %", 150, 384, 26, 700, "#363949", "center");
  drawText(ctx, "Asistencia", 256, 358, 22, 500, "#667281");
  drawText(ctx, "87,4", 256, 412, 48, 800, "#363949", "left", -1);
}

function drawSubjectRow(ctx: CanvasRenderingContext2D, [subject, grade]: SubjectGrade, index: number): void {
  const y = 670 + index * 88;
  drawText(ctx, subject, 72, y, 24, 600, "#363949");
  drawText(ctx, String(grade), W - 72, y, 24, 700, "#363949", "right");
  roundRect(ctx, "rgba(132,139,200,0.2)", 72, y + 18, W - 144, 10, 5);
  roundRect(ctx, grade >= 85 ? "#41f1b6" : "#ffbb55", 72, y + 18, ((W - 144) * grade) / 100, 10, 5);
}

function drawSubjectsCard(ctx: CanvasRenderingContext2D): void {
  drawProductoCard(ctx, 32, 520, W - 64, 700, 36);
  drawText(ctx, "Por materia", 72, 590, 28, 700, "#363949");
  SUBJECT_GRADES.forEach((grade, i) => drawSubjectRow(ctx, grade, i));
}

export function drawStudentPhone(): HTMLCanvasElement {
  const canvas = createCanvas(W, H);
  const ctx = context2d(canvas);
  drawScreenHeader(ctx);
  drawSummaryCard(ctx);
  drawSubjectsCard(ctx);
  return canvas;
}
