// Port of Producto's `drawSheet(i)` from design_handoff_smp_landing/design/desktop/
// Producto.dc.html: the three messy spreadsheets in the "before" pile. Split into
// helpers that issue the same draw calls, and consume the seeded random sequence,
// in the same order. Every number and string is approved as is.

import { context2d, createCanvas, createSeededRandom, drawText } from "../../core/canvas2d";

export type SheetIndex = 0 | 1 | 2;

interface SheetCell {
  readonly text: string;
  readonly color: string;
  readonly weight: number;
}

const W = 1100;
const H = 760;
const ROW_HEIGHT = 48;
const COLUMN_EDGES = [0, 56, 356, 476, 596, 716, 836, 980, 1100];

const FILE_NAMES = ["notas_12-1_FINAL_v3.xlsx", "Mate 11-1 (copia).xlsx", "10-2 notas I periodo.xlsx"];
const FORMULAS = ["=PROMEDIO(C4:F4)*0,6+G4*0,4", "=SUMA(C5:E5)/3", '=SI(H6<70;"REP";"APR")'];

const STUDENTS = [
  "Alvarado M., Sofía",
  "Brenes Q., Mateo",
  "Castro S., Valeria",
  "Fallas U., Diego",
  "Jiménez R., Ana",
  "Mora C., Isaac",
  "Rojas V., Yendry",
  "Solano B., Luis",
  "Ulate P., María",
  "Vega A., Camila",
  "Zúñiga M., Tomás",
];
const HEADERS = ["Estudiante", "Cotid.", "Tareas", "Pruebas", "Proyecto", "Asist.", "Nota"];

function drawSheetChrome(ctx: CanvasRenderingContext2D, sheetIndex: SheetIndex): void {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#217346";
  ctx.fillRect(0, 0, W, 72);
  drawText(ctx, FILE_NAMES[sheetIndex], 36, 47, 26, 600, "#fff");
  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(0, 72, W, 54);
  drawText(ctx, "fx", 36, 108, 20, 600, "#627388", "left", 0, "italic");
  drawText(ctx, FORMULAS[sheetIndex], 84, 108, 20, 500, "#363949");
}

function drawColumnHeaders(ctx: CanvasRenderingContext2D): void {
  const X = COLUMN_EDGES;
  ctx.fillStyle = "#eef0f3";
  ctx.fillRect(0, 126, W, 44);
  ctx.fillRect(0, 126, 56, H);
  "ABCDEFG".split("").forEach((letter, j) => drawText(ctx, letter, (X[j + 1] + X[j + 2]) / 2, 157, 19, 600, "#627388", "center"));
}

// The random draw happens for every data cell before the overrides, so the
// #¡DIV/0! and blank cells still advance the sequence exactly as the prototype did.
function resolveCell(row: number, column: number, sheetIndex: SheetIndex, random: () => number): SheetCell {
  if (row === 0) return { text: HEADERS[column], color: "#363949", weight: 600 };
  if (column === 0) return { text: STUDENTS[(row - 1 + sheetIndex * 3) % STUDENTS.length], color: "#363949", weight: 400 };
  const score = String(Math.round(55 + random() * 43));
  if (row === 7 && column === 6) return { text: "#¡DIV/0!", color: "#d30011", weight: 600 };
  if (row === 9 - sheetIndex && column === 3) return { text: "", color: "#363949", weight: 400 };
  return { text: score, color: "#363949", weight: 400 };
}

function drawSheetRow(ctx: CanvasRenderingContext2D, row: number, sheetIndex: SheetIndex, random: () => number): void {
  const X = COLUMN_EDGES;
  const y = 170 + row * ROW_HEIGHT;
  if (row === 4 + sheetIndex) {
    ctx.fillStyle = "#fff4b8";
    ctx.fillRect(56, y, W - 56, ROW_HEIGHT);
  }
  drawText(ctx, String(row + 1), 28, y + 32, 18, 500, "#627388", "center");
  for (let column = 0; column < 7; column++) {
    const cell = resolveCell(row, column, sheetIndex, random);
    const cellX = column === 0 ? X[1] + 16 : X[column + 2] - 16;
    drawText(ctx, cell.text, cellX, y + 32, 19, cell.weight, cell.color, column === 0 ? "left" : "right");
  }
}

function drawGridAndSelection(ctx: CanvasRenderingContext2D): void {
  const X = COLUMN_EDGES;
  ctx.strokeStyle = "#d6d9df";
  ctx.lineWidth = 1.5;
  for (let row = 0; row <= 12; row++) {
    ctx.beginPath();
    ctx.moveTo(0, 170 + row * ROW_HEIGHT);
    ctx.lineTo(W, 170 + row * ROW_HEIGHT);
    ctx.stroke();
  }
  X.slice(1, -1).forEach((cx) => {
    ctx.beginPath();
    ctx.moveTo(cx, 126);
    ctx.lineTo(cx, H);
    ctx.stroke();
  });
  ctx.strokeStyle = "#217346";
  ctx.lineWidth = 4;
  ctx.strokeRect(X[7], 170 + 3 * ROW_HEIGHT, X[8] - X[7], ROW_HEIGHT);
}

export function drawSheet(sheetIndex: SheetIndex): HTMLCanvasElement {
  const canvas = createCanvas(W, H);
  const ctx = context2d(canvas);
  const random = createSeededRandom(7 + sheetIndex * 13);
  drawSheetChrome(ctx, sheetIndex);
  drawColumnHeaders(ctx);
  for (let row = 0; row < 12; row++) drawSheetRow(ctx, row, sheetIndex, random);
  drawGridAndSelection(ctx);
  return canvas;
}
