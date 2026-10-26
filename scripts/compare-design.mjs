// Side-by-side parity check: each design prototype next to the live page at
// the same width, one viewport at a time, with reduced motion so both sides
// sit in their final state. Run against `npm run preview` (or PREVIEW_URL).
//
//   WIDTHS=390,1440 ROUTE=home node scripts/compare-design.mjs
//
// Writes <route>-<width>-<step>.png (design left, live right) to
// os.tmpdir()/compare, and prints how far apart each pair is.

import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { selectedRoutes, BASE_URL } from "./routes.mjs";
import { startStaticServer } from "./lib/static-server.mjs";

const OUTPUT_DIRECTORY = process.env.COMPARE_OUT || path.join(os.tmpdir(), "compare");
const DESIGN_ROOT = path.resolve("design_handoff_smp_landing/design");
const DESIGN_PORT = Number(process.env.DESIGN_PORT || 4399);
const WIDTHS = (process.env.WIDTHS || "360,390,430,768,1024,1440").split(",").map(Number);
const HEIGHT_FOR_WIDTH = (width) => (width < 768 ? 844 : width < 1200 ? 1024 : 900);
const SETTLE_MS = Number(process.env.SETTLE_MS || 900);

function breakpointFolder(width) {
  if (width < 768) return "mobile";
  return width < 1200 ? "tablet" : "desktop";
}

async function openSettled(browser, url, width) {
  const context = await browser.newContext({
    viewport: { width, height: HEIGHT_FOR_WIDTH(width) },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(SETTLE_MS * 2);
  return { context, page };
}

const documentHeight = (page) => page.evaluate(() => document.documentElement.scrollHeight);

async function shootAt(page, scrollY) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(SETTLE_MS);
  return page.screenshot();
}

async function differenceRatio(leftPng, rightPng) {
  const [left, right] = await Promise.all(
    [leftPng, rightPng].map((png) => sharp(png).raw().toBuffer({ resolveWithObject: true })),
  );
  const pixelCount = Math.min(left.data.length, right.data.length) / left.info.channels;
  let differing = 0;
  for (let index = 0; index < pixelCount * left.info.channels; index += left.info.channels) {
    const delta = Math.abs(left.data[index] - right.data[index])
      + Math.abs(left.data[index + 1] - right.data[index + 1])
      + Math.abs(left.data[index + 2] - right.data[index + 2]);
    if (delta > 48) differing += 1;
  }
  return differing / pixelCount;
}

async function writeSideBySide(leftPng, rightPng, width, height, outputPath) {
  const gutter = 16;
  await sharp({
    create: { width: width * 2 + gutter, height, channels: 3, background: "#ff3b6b" },
  })
    .composite([
      { input: leftPng, left: 0, top: 0 },
      { input: rightPng, left: width + gutter, top: 0 },
    ])
    .png()
    .toFile(outputPath);
}

async function compareRoute(browser, route, width) {
  const designUrl = `http://localhost:${DESIGN_PORT}/${breakpointFolder(width)}/${route.design}.dc.html`;
  const design = await openSettled(browser, designUrl, width);
  const live = await openSettled(browser, BASE_URL + route.path, width);
  const viewportHeight = HEIGHT_FOR_WIDTH(width);
  const [designHeight, liveHeight] = await Promise.all([documentHeight(design.page), documentHeight(live.page)]);
  const lastScroll = Math.max(designHeight, liveHeight) - viewportHeight;
  const rows = [];
  for (let step = 0, y = 0; y <= lastScroll + viewportHeight - 1; step += 1, y += viewportHeight) {
    const [designPng, livePng] = [await shootAt(design.page, y), await shootAt(live.page, y)];
    const outputPath = path.join(OUTPUT_DIRECTORY, `${route.slug}-${width}-${String(step).padStart(2, "0")}.png`);
    await writeSideBySide(designPng, livePng, width, viewportHeight, outputPath);
    rows.push(`${(100 * (await differenceRatio(designPng, livePng))).toFixed(1)}%`);
  }
  console.log(`${route.slug.padEnd(9)} ${String(width).padStart(4)}  height design ${designHeight} / live ${liveHeight}  diff per screen: ${rows.join(" ")}`);
  await Promise.all([design.context.close(), live.context.close()]);
}

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
const stopDesignServer = await startStaticServer(DESIGN_ROOT, DESIGN_PORT);
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
try {
  for (const route of selectedRoutes()) {
    for (const width of WIDTHS) await compareRoute(browser, route, width);
  }
} finally {
  await browser.close();
  stopDesignServer();
}
console.log(`Pairs written to ${OUTPUT_DIRECTORY}`);
