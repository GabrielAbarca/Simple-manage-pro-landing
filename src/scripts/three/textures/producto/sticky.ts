// Port of Producto's `drawSticky(lines, col)` from design_handoff_smp_landing/design/
// desktop/Producto.dc.html. The two approved notes are exported as presets so the
// scene does not have to retype their Spanish copy.

import { context2d, createCanvas, drawText } from "../../core/canvas2d";

export interface StickyNote {
  readonly lines: readonly string[];
  readonly color: string;
}

export const STICKY_NOTE_PRESETS: readonly StickyNote[] = [
  { lines: ["Recalcular", "promedio 10-2", "antes del viernes"], color: "#ffe49a" },
  { lines: ["¿Quién tiene", "la lista", "de 11-1?"], color: "#ffd0d4" },
];

export function drawSticky(lines: readonly string[], color: string): HTMLCanvasElement {
  const canvas = createCanvas(500, 500);
  const ctx = context2d(canvas);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 500, 500);
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(0, 0, 500, 56);
  lines.forEach((line, i) => drawText(ctx, line, 44, 170 + i * 74, 46, 600, "#4a3c12", "left", 0, "italic"));
  return canvas;
}
