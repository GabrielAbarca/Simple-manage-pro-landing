import {
  createBrandGradient,
  drawHomeCard,
  drawText,
  gradientCircle,
  roundRect,
  strokeProgressRing,
} from "../../core/canvas2d";
import { drawPortalBase } from "./portal-base";

type SubjectGrade = readonly [subject: string, grade: number];

const STUDENT_NAV = ["Inicio", "Notas", "Horario", "Docentes", "Asistencia", "Eventos"];

const SUBJECT_GRADES: readonly SubjectGrade[] = [
  ["Matemáticas", 88],
  ["Español", 91],
  ["Química", 79],
  ["Física", 84],
  ["Inglés", 95],
  ["Estudios Sociales", 86],
];

const STAT_TOP = 215;
const BAR_X = 680;
const BAR_WIDTH = 740;

function drawAttendanceStat(ctx: CanvasRenderingContext2D, X: number, Y: number): void {
  strokeProgressRing(ctx, X + 100, Y + 105, 58, 14, "rgba(132,139,200,0.18)", "#41f1b6", 0.96);
  drawText(ctx, "96 %", X + 100, Y + 114, 24, 700, "#363949", "center");
  drawText(ctx, "Asistencia", X + 190, Y + 96, 20, 500, "#667281");
  drawText(ctx, "2 ausencias", X + 190, Y + 130, 22, 600, "#363949");
}

function drawAverageStat(ctx: CanvasRenderingContext2D, X: number, Y: number): void {
  gradientCircle(ctx, X + 34, Y + 32, 60);
  drawText(ctx, "87,4", X + 34, Y + 158, 52, 800, "#363949", "left", -1);
  drawText(ctx, "Promedio general", X + 34, Y + 190, 20, 500, "#667281");
}

function drawNextClassStat(ctx: CanvasRenderingContext2D, X: number, Y: number): void {
  drawText(ctx, "PRÓXIMA CLASE", X + 34, Y + 64, 16, 600, "#627388", "left", 1);
  drawText(ctx, "Química", X + 34, Y + 140, 40, 800, "#363949", "left", -0.5);
  drawText(ctx, "09:20 · Aula 8", X + 34, Y + 180, 20, 500, "#667281");
}

function drawStatCards(ctx: CanvasRenderingContext2D): void {
  const cw = (1220 - 60) / 3;
  [0, 1, 2].forEach((i) => drawHomeCard(ctx, 340 + i * (cw + 30), STAT_TOP, cw, 210));
  drawAttendanceStat(ctx, 340, STAT_TOP);
  drawAverageStat(ctx, 340 + cw + 30, STAT_TOP);
  drawNextClassStat(ctx, 340 + 2 * (cw + 30), STAT_TOP);
}

function drawSubjectGradeBar(ctx: CanvasRenderingContext2D, [subject, grade]: SubjectGrade, index: number): void {
  const y = 590 + index * 62;
  drawText(ctx, subject, 380, y, 21, 600, "#363949");
  roundRect(ctx, "rgba(132,139,200,0.18)", BAR_X, y - 12, BAR_WIDTH, 12, 6);
  const barFill = createBrandGradient(ctx, BAR_X, 0, BAR_X + BAR_WIDTH, 0);
  roundRect(ctx, barFill, BAR_X, y - 12, (BAR_WIDTH * grade) / 100, 12, 6);
  drawText(ctx, String(grade), 1520, y, 22, 700, "#363949", "right");
}

function drawGradesBySubject(ctx: CanvasRenderingContext2D): void {
  drawHomeCard(ctx, 340, 460, 1220, 500);
  drawText(ctx, "Notas por materia", 380, 525, 28, 700, "#363949");
  drawText(ctx, "Nota mínima 70", 1520, 525, 19, 500, "#627388", "right");
  SUBJECT_GRADES.forEach((grade, i) => drawSubjectGradeBar(ctx, grade, i));
  ctx.fillStyle = "rgba(98,115,136,0.55)";
  ctx.fillRect(BAR_X + BAR_WIDTH * 0.7, 548, 2, 380);
}

export function drawStudent(): HTMLCanvasElement {
  const { canvas, ctx } = drawPortalBase(STUDENT_NAV, 0);
  drawText(ctx, "Hola, Yendry", 340, 125, 58, 800, "#363949", "left", -1);
  drawText(ctx, "Duodécimo · Sección 12-1 · I Periodo", 342, 172, 23, 400, "#667281");
  drawStatCards(ctx);
  drawGradesBySubject(ctx);
  return canvas;
}
