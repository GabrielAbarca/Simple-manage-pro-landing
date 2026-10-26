// Port of Home's `drawBubble` from design_handoff_smp_landing/design/desktop/Home.dc.html:
// the WhatsApp message face on the contact scene's bubble slab. Sizes, wrap width
// and line pitch are approved; do not tidy them.

import { context2d, createCanvas } from "../../core/canvas2d";

export const DEFAULT_BUBBLE_MESSAGE =
  "Buenas, soy director/a de [colegio] y quisiera conocer más sobre el piloto 2027.";

// Deliberately not canvas2d's wrapText: this loop has no `&& line` guard, so an
// overlong first word pushes an empty line. The bubble was approved with this one.
function splitBubbleLines(ctx: CanvasRenderingContext2D, message: string): string[] {
  const lines: string[] = [];
  let line = "";
  message.split(" ").forEach((word) => {
    const candidate = line ? line + " " + word : word;
    if (ctx.measureText(candidate).width > 1200) {
      lines.push(line);
      line = word;
      return;
    }
    line = candidate;
  });
  lines.push(line);
  return lines;
}

export function drawBubble(message: string = DEFAULT_BUBBLE_MESSAGE): HTMLCanvasElement {
  const canvas = createCanvas(1400, 575);
  const ctx = context2d(canvas);
  ctx.fillStyle = "#5a69e9";
  ctx.fillRect(0, 0, 1400, 575);
  ctx.fillStyle = "#fff";
  ctx.font = "500 60px Poppins";
  splitBubbleLines(ctx, message).forEach((line, i) => ctx.fillText(line, 100, 170 + i * 88));
  ctx.font = "500 34px Poppins";
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.textAlign = "right";
  ctx.fillText("08:14", 1300, 500);
  return canvas;
}
