// Port of Producto's `drawRecord` from design_handoff_smp_landing/design/desktop/
// Producto.dc.html: the student expediente the "before" pile resolves into. Split
// into helpers that issue the same draw calls in the same order; every number and
// string is approved as is.

import {
  context2d,
  createBrandGradient,
  createCanvas,
  drawProductoCard,
  drawText,
  gradientCircle,
  roundRect,
  strokeProgressRing,
} from "../../core/canvas2d";

type SubjectGrade = readonly [subject: string, grade: number];

const W = 1600;
const H = 1067;
const STAT_TOP = 230;
const BAR_X = 440;
const BAR_WIDTH = W - 124 - 100 - BAR_X;

const SUBJECT_GRADES: readonly SubjectGrade[] = [
  ["Matemáticas", 88],
  ["Español", 91],
  ["Química", 79],
  ["Física", 84],
  ["Inglés", 95],
  ["Estudios Sociales", 86],
];

// The prototype's inline `gr` gradient plus arc is the same disc gradientCircle draws.
function drawRecordIdentity(ctx: CanvasRenderingContext2D): void {
  gradientCircle(ctx, 80, 70, 120);
  drawText(ctx, "YR", 140, 145, 38, 700, "#fff", "center");
  drawText(ctx, "Rojas Vargas, Yendry", 232, 122, 52, 800, "#363949", "left", -1);
  drawText(ctx, "Duodécimo · Sección 12-1 · Expediente 2026-0412", 234, 170, 24, 400, "#667281");
}

function drawPeriodClosedBadge(ctx: CanvasRenderingContext2D): void {
  ctx.font = "600 21px Poppins";
  const bw = ctx.measureText("I Periodo cerrado").width + 40;
  roundRect(ctx, "rgba(65,241,182,0.18)", W - 80 - bw, 96, bw, 48, 24);
  drawText(ctx, "I Periodo cerrado", W - 80 - bw + 20, 128, 21, 600, "#097c56");
}

function drawAverageStat(ctx: CanvasRenderingContext2D, X: number, Y: number): void {
  gradientCircle(ctx, X + 44, Y + 32, 60);
  drawText(ctx, "87,4", X + 44, Y + 166, 54, 800, "#363949", "left", -1);
  drawText(ctx, "Promedio general", X + 44, Y + 198, 21, 500, "#667281");
}

function drawAttendanceStat(ctx: CanvasRenderingContext2D, X: number, Y: number): void {
  strokeProgressRing(ctx, X + 110, Y + 110, 60, 15, "rgba(132,139,200,0.18)", "#41f1b6", 0.96);
  drawText(ctx, "96 %", X + 110, Y + 119, 25, 700, "#363949", "center");
  drawText(ctx, "Asistencia", X + 204, Y + 100, 21, 500, "#667281");
  drawText(ctx, "2 ausencias", X + 204, Y + 136, 23, 600, "#363949");
}

function drawReportStat(ctx: CanvasRenderingContext2D, X: number, Y: number): void {
  drawText(ctx, "INFORME DEL PERIODO", X + 44, Y + 66, 17, 600, "#627388", "left", 1);
  drawText(ctx, "Generado", X + 44, Y + 144, 42, 800, "#363949", "left", -0.5);
  drawText(ctx, "14 de mayo · PDF", X + 44, Y + 186, 21, 500, "#667281");
}

function drawStatCards(ctx: CanvasRenderingContext2D): void {
  const cw = (W - 160 - 60) / 3;
  [0, 1, 2].forEach((i) => drawProductoCard(ctx, 80 + i * (cw + 30), STAT_TOP, cw, 220));
  drawAverageStat(ctx, 80, STAT_TOP);
  drawAttendanceStat(ctx, 80 + cw + 30, STAT_TOP);
  drawReportStat(ctx, 80 + 2 * (cw + 30), STAT_TOP);
}

function drawSubjectGradeBar(ctx: CanvasRenderingContext2D, [subject, grade]: SubjectGrade, index: number): void {
  const y = 630 + index * 60;
  drawText(ctx, subject, 124, y, 22, 600, "#363949");
  roundRect(ctx, "rgba(132,139,200,0.18)", BAR_X, y - 13, BAR_WIDTH, 13, 6.5);
  const barFill = createBrandGradient(ctx, BAR_X, 0, BAR_X + BAR_WIDTH, 0);
  roundRect(ctx, barFill, BAR_X, y - 13, (BAR_WIDTH * grade) / 100, 13, 6.5);
  drawText(ctx, String(grade), W - 124, y, 23, 700, "#363949", "right");
}

function drawGradesBySubject(ctx: CanvasRenderingContext2D): void {
  drawProductoCard(ctx, 80, 490, W - 160, 500);
  drawText(ctx, "Notas por materia", 124, 556, 29, 700, "#363949");
  drawText(ctx, "Nota mínima 70", W - 124, 556, 20, 500, "#627388", "right");
  SUBJECT_GRADES.forEach((grade, i) => drawSubjectGradeBar(ctx, grade, i));
  ctx.fillStyle = "rgba(98,115,136,0.5)";
  ctx.fillRect(BAR_X + BAR_WIDTH * 0.7, 588, 2, 370);
}

export function drawRecord(): HTMLCanvasElement {
  const canvas = createCanvas(W, H);
  const ctx = context2d(canvas);
  ctx.fillStyle = "#f6f6f9";
  ctx.fillRect(0, 0, W, H);
  drawRecordIdentity(ctx);
  drawPeriodClosedBadge(ctx);
  drawStatCards(ctx);
  drawGradesBySubject(ctx);
  return canvas;
}
