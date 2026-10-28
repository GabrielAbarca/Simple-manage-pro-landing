import { drawBadge, drawHomeCard, drawText, gradientCircle } from "../../core/canvas2d";
import { drawPortalBase } from "./portal-base";

type AdminStat = readonly [label: string, value: string, note: string];
type SectionRow = readonly [section: string, level: string, guide: string, students: string, average: string];

const ADMIN_NAV = ["Resumen", "Curso lectivo", "Niveles y secciones", "Materias", "Horarios", "Docentes", "Estudiantes", "Cuentas"];

const ADMIN_STATS: readonly AdminStat[] = [
  ["Estudiantes", "107", "+3 este mes"],
  ["Docentes", "14", "2 guías nuevos"],
  ["Asistencia", "94,2 %", "I Periodo"],
];

const SECTION_COLUMNS = [380, 560, 780, 1150, 1380];
const SECTION_HEADINGS = ["SECCIÓN", "NIVEL", "DOCENTE GUÍA", "ESTUDIANTES", "PROMEDIO"];

const SECTION_ROWS: readonly SectionRow[] = [
  ["12-1", "Duodécimo", "Andrés Mora Solís", "27", "84,2"],
  ["11-1", "Undécimo", "Daniela Jiménez Castro", "28", "81,7"],
  ["10-2", "Décimo", "Luis Chaves Arias", "26", "68,9"],
  ["10-1", "Décimo", "María Fernanda Ulate", "26", "79,4"],
];

function drawAdminStatCard(ctx: CanvasRenderingContext2D, [label, value, note]: AdminStat, index: number): void {
  const cw = (1220 - 60) / 3;
  const X = 340 + index * (cw + 30);
  const Y = 215;
  drawHomeCard(ctx, X, Y, cw, 210);
  gradientCircle(ctx, X + 34, Y + 32, 60);
  drawText(ctx, note, X + cw - 34, Y + 70, 18, 600, index === 2 ? "#4455e6" : "#097c56", "right");
  drawText(ctx, value, X + 34, Y + 158, 52, 800, "#363949", "left", -1);
  drawText(ctx, label, X + 34, Y + 190, 20, 500, "#667281");
}

function drawSectionRow(ctx: CanvasRenderingContext2D, row: SectionRow, index: number): void {
  const y = 660 + index * 76;
  ctx.fillStyle = "rgba(132,139,200,0.18)";
  ctx.fillRect(380, y - 50, 1140, 2);
  drawText(ctx, row[0], SECTION_COLUMNS[0], y, 22, 600, "#363949");
  drawText(ctx, row[1], SECTION_COLUMNS[1], y, 22, 400, "#667281");
  drawText(ctx, row[2], SECTION_COLUMNS[2], y, 22, 400, "#667281");
  drawText(ctx, row[3], SECTION_COLUMNS[3], y, 22, 500, "#363949");
  const isBelowPassing = parseFloat(row[4].replace(",", ".")) < 70;
  const tint = isBelowPassing ? "rgba(255,187,85,0.15)" : "rgba(65,241,182,0.15)";
  drawBadge(ctx, row[4], SECTION_COLUMNS[4], y, tint, isBelowPassing ? "#9d5e00" : "#097c56");
}

function drawSectionsTable(ctx: CanvasRenderingContext2D): void {
  drawHomeCard(ctx, 340, 460, 1220, 500);
  drawText(ctx, "Secciones", 380, 525, 28, 700, "#363949");
  drawText(ctx, "Ver todas", 1520, 525, 20, 600, "#4455e6", "right");
  SECTION_HEADINGS.forEach((heading, i) => drawText(ctx, heading, SECTION_COLUMNS[i], 585, 16, 600, "#627388", "left", 1));
  SECTION_ROWS.forEach((row, i) => drawSectionRow(ctx, row, i));
}

export function drawAdmin(): HTMLCanvasElement {
  const { canvas, ctx } = drawPortalBase(ADMIN_NAV, 0);
  drawText(ctx, "Resumen", 340, 125, 58, 800, "#363949", "left", -1);
  drawText(ctx, "Curso lectivo 2026 · 4 secciones · 107 estudiantes", 342, 172, 23, 400, "#667281");
  ADMIN_STATS.forEach((stat, i) => drawAdminStatCard(ctx, stat, i));
  drawSectionsTable(ctx);
  return canvas;
}
