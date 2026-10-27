import { context2d, createCanvas, drawText, roundRect, wrapText } from "../../core/canvas2d";

interface ChatMessage {
  readonly isOwn: boolean;
  readonly author: string | null;
  readonly text: string;
  readonly time: string;
}

const W = 600;
const H = 1262;

const MESSAGES: readonly ChatMessage[] = [
  { isOwn: false, author: "Patricia", text: "Buenas, ¿ya salieron las notas del I Periodo?", time: "07:12" },
  { isOwn: false, author: "Carlos", text: "¿Alguien sabe cuánto sacaron en el examen de Mate?", time: "07:20" },
  { isOwn: true, author: null, text: "Estamos terminando los informes, les aviso.", time: "07:31" },
  { isOwn: false, author: "Ana", text: "Mi hija dice que el martes no le pasaron asistencia", time: "07:44" },
  { isOwn: false, author: "Luis", text: "¿Cuándo es la entrega de informes?", time: "08:02" },
];

function drawChatHeader(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#eef0f7";
  ctx.fillRect(0, 0, W, H);
  drawText(ctx, "9:41", 56, 60, 24, 600, "#363949");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 88, W, 120);
  ctx.beginPath();
  ctx.arc(72, 148, 34, 0, Math.PI * 2);
  ctx.fillStyle = "#a78bfa";
  ctx.fill();
  drawText(ctx, "P", 72, 160, 30, 700, "#fff", "center");
  drawText(ctx, "Padres de familia 10-2", 124, 140, 26, 700, "#363949");
  drawText(ctx, "48 participantes", 124, 176, 20, 500, "#627388");
}

function drawChatBubble(ctx: CanvasRenderingContext2D, message: ChatMessage, y: number): number {
  ctx.font = "500 24px Poppins";
  const lines = wrapText(ctx, message.text, 390);
  const textWidth = Math.max(...lines.map((line) => ctx.measureText(line).width), message.author ? 120 : 0, 80);
  const bw = textWidth + 48;
  const bh = lines.length * 34 + (message.author ? 36 : 0) + 64;
  const bx = message.isOwn ? W - 28 - bw : 28;
  roundRect(ctx, message.isOwn ? "#dcdffb" : "#fff", bx, y, bw, bh, 22);
  let ty = y + 42;
  if (message.author) {
    drawText(ctx, message.author, bx + 24, ty, 20, 700, "#4455e6");
    ty += 36;
  }
  lines.forEach((line) => {
    drawText(ctx, line, bx + 24, ty, 24, 500, "#363949");
    ty += 34;
  });
  drawText(ctx, message.time, bx + bw - 22, y + bh - 16, 18, 500, "#627388", "right");
  return bh;
}

function drawComposer(ctx: CanvasRenderingContext2D): void {
  roundRect(ctx, "#fff", 24, H - 96, W - 48, 72, 36);
  drawText(ctx, "Mensaje", 60, H - 50, 22, 500, "#8a93a3");
}

export function drawPhone(): HTMLCanvasElement {
  const canvas = createCanvas(W, H);
  const ctx = context2d(canvas);
  drawChatHeader(ctx);
  let y = 236;
  MESSAGES.forEach((message) => {
    y += drawChatBubble(ctx, message, y) + 16;
  });
  drawComposer(ctx);
  return canvas;
}
