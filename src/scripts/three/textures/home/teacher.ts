// Port of Home's `drawTeacher` from design_handoff_smp_landing/design/desktop/Home.dc.html:
// the Docente console face for the hero slab. Split into helpers that issue the
// same draw calls in the same order; every number and string is approved as is.

import { drawBadge, drawHomeCard, drawText, roundRect } from "../../core/canvas2d";
import { drawPortalBase } from "./portal-base";

type Lesson = readonly [
  time: string,
  subject: string,
  place: string,
  accent: string,
  status: string,
  statusTint: string,
  statusColor: string,
];
type StudentGrade = readonly [name: string, grade: number];

const TEACHER_NAV = ["Hoy", "Mis clases", "Materias", "Ajustes"];

const LESSONS: readonly Lesson[] = [
  ["07:00 – 07:40", "Matemáticas", "Sección 12-1 · Aula 14", "#7380ec", "En curso", "rgba(65,241,182,0.15)", "#097c56"],
  ["08:20 – 09:00", "Matemáticas", "Sección 11-1 · Aula 14", "#a78bfa", "Siguiente", "rgba(115,128,236,0.15)", "#4455e6"],
  ["10:00 – 10:40", "Estadística", "Sección 10-2 · Aula 9", "#41f1b6", "Pendiente", "rgba(132,139,200,0.18)", "#627388"],
  ["13:00 – 13:40", "Matemáticas", "Sección 10-1 · Aula 14", "#ffbb55", "Pendiente", "rgba(132,139,200,0.18)", "#627388"],
];

const GRADEBOOK_STUDENTS: readonly StudentGrade[] = [
  ["Alvarado Méndez, Sofía", 92],
  ["Brenes Quesada, Mateo", 78],
  ["Castro Solano, Valeria", 85],
  ["Fallas Ureña, Diego", 64],
  ["Rojas Vargas, Yendry", 88],
  ["Vega Arias, Camila", 74],
  ["Zúñiga Mora, Tomás", 81],
];

function drawLessonCard(ctx: CanvasRenderingContext2D, lesson: Lesson, index: number): void {
  const [time, subject, place, accent, status, statusTint, statusColor] = lesson;
  const Y = 215 + index * 186;
  drawHomeCard(ctx, 340, Y, 580, 160, 36);
  ctx.save();
  roundRect(ctx, null, 340, Y, 580, 160, 36);
  ctx.clip();
  ctx.fillStyle = accent;
  ctx.fillRect(340, Y, 6, 160);
  ctx.restore();
  drawText(ctx, time, 380, Y + 50, 19, 600, "#627388");
  drawText(ctx, subject, 380, Y + 96, 30, 700, "#363949");
  drawText(ctx, place, 380, Y + 132, 20, 400, "#667281");
  drawBadge(ctx, status, 886, Y + 58, statusTint, statusColor, "right");
}

function drawGradebookRow(ctx: CanvasRenderingContext2D, [name, grade]: StudentGrade, index: number): void {
  const y = 395 + index * 80;
  drawText(ctx, name, 990, y, 20, 500, "#363949");
  roundRect(ctx, "rgba(132,139,200,0.18)", 990, y + 18, 440, 10, 5);
  roundRect(ctx, grade < 70 ? "#ff7782" : "#7380ec", 990, y + 18, (440 * grade) / 100, 10, 5);
  drawText(ctx, String(grade), 1520, y + 28, 24, 700, grade < 70 ? "#d30011" : "#363949", "right");
}

function drawGradebookPanel(ctx: CanvasRenderingContext2D): void {
  drawHomeCard(ctx, 950, 215, 610, 745);
  drawText(ctx, "Libro de notas", 990, 280, 28, 700, "#363949");
  drawText(ctx, "Matemáticas · 12-1 · I Periodo", 990, 318, 19, 400, "#667281");
  GRADEBOOK_STUDENTS.forEach((student, i) => drawGradebookRow(ctx, student, i));
}

export function drawTeacher(): HTMLCanvasElement {
  const { canvas, ctx } = drawPortalBase(TEACHER_NAV, 0);
  drawText(ctx, "Hoy", 340, 125, 58, 800, "#363949", "left", -1);
  drawText(ctx, "Martes 3 de febrero · 4 lecciones", 342, 172, 23, 400, "#667281");
  LESSONS.forEach((lesson, i) => drawLessonCard(ctx, lesson, i));
  drawGradebookPanel(ctx);
  return canvas;
}
