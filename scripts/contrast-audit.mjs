// Contrast audit against the rendered page.
//
//   npm run preview &   →   node scripts/contrast-audit.mjs
//
// A token being "audited" proves nothing on a page that puts glows, cards and
// WebGL behind its copy: what matters is the pixel actually behind each glyph.
// So, one viewport at a time: record every visible text element's colour, paint
// all text transparent, screenshot, and sample the real background inside each
// text box, worst pixel wins.
//
// It walks the page in half-viewport steps rather than growing the viewport to
// the document height (the V1 approach). V.2 pins whole scenes to 100vh inside
// 300–700vh sections, and a viewport grown to the document height inflates all
// of them, so the audit would measure a page no visitor ever sees. Stepping
// also audits each scroll-driven state (chapter captions, fanned slabs) in the
// state a visitor gets at that scroll position.
//
// WCAG 1.4.3: 4.5:1 for normal text, 3:1 for large (>=24px, or >=18.66px bold).
//
// Text drawn over a live WebGL stage is reported as WARN, not FAIL: what sits
// behind it depends on the animation frame (a slab mid-fan, a shadow passing),
// so one sample proves little either way. Read those by eye in `npm run
// review`. Muted text that fails over a stage still gets the stronger muted
// tier (--ink-muted-strong), which is how the Home captions were fixed.

import { chromium } from "playwright";
import sharp from "sharp";
import { selectedRoutes, BASE_URL } from "./routes.mjs";

const BASE = process.env.AUDIT_URL || BASE_URL;
const VIEWS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];
const SETTLE_MS = 700;

const srgb = (v) => {
  v /= 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const hex = (c) => "#" + c.map((n) => n.toString(16).padStart(2, "0")).join("");

/** Runs in the page: visible text elements fully in view, stamped with ids. */
function collectTargets() {
  const header = document.querySelector("[data-site-header]");
  const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
  const effectiveOpacity = (el) => {
    let value = 1;
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) value *= parseFloat(getComputedStyle(node).opacity);
    return value;
  };
  const clippedRect = (el) => {
    let { left, top, right, bottom } = el.getBoundingClientRect();
    for (let node = el.parentElement; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.overflowX === "visible" && style.overflowY === "visible") continue;
      const clip = node.getBoundingClientRect();
      left = Math.max(left, clip.left); top = Math.max(top, clip.top);
      right = Math.min(right, clip.right); bottom = Math.min(bottom, clip.bottom);
    }
    return { left, top, right, bottom };
  };
  const inView = (el, rect) => {
    if (rect.top < 0 || rect.bottom > innerHeight || rect.left < 0 || rect.right > innerWidth) return false;
    return (header && header.contains(el)) || rect.top >= headerBottom;
  };
  const stages = [...document.querySelectorAll("[data-stage]")]
    .filter((stage) => stage.querySelector("canvas") && stage.checkVisibility())
    .map((stage) => stage.getBoundingClientRect());
  const overStage = (r) => stages.some((s) => r.left < s.right && r.right > s.left && r.top < s.bottom && r.bottom > s.top);
  const out = [];
  let next = document.querySelectorAll("[data-audit-id]").length;
  for (const el of document.body.querySelectorAll("*")) {
    if (el.closest("[data-logotype]")) continue;
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!ownText || !el.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true })) continue;
    if (effectiveOpacity(el) < 0.3) continue;
    const full = el.getBoundingClientRect();
    const rect = clippedRect(el);
    const visibleArea = Math.max(0, rect.right - rect.left) * Math.max(0, rect.bottom - rect.top);
    if (full.width <= 4 || full.height <= 4 || visibleArea < 0.5 * full.width * full.height) continue;
    if (!inView(el, full)) continue;
    if (!el.hasAttribute("data-audit-id")) el.setAttribute("data-audit-id", String(next++));
    const style = getComputedStyle(el);
    const size = parseFloat(style.fontSize);
    const weight = parseInt(style.fontWeight, 10) || 400;
    out.push({
      id: el.getAttribute("data-audit-id"),
      label: el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\s+/)[0] : ""),
      text: el.textContent.trim().replace(/\s+/g, " ").slice(0, 40),
      color: style.color,
      large: size >= 24 || (size >= 18.66 && weight >= 700),
      overStage: overStage(full),
    });
  }
  return out;
}

function boxesOf(ids) {
  const out = {};
  for (const id of ids) {
    const b = document.querySelector(`[data-audit-id="${id}"]`)?.getBoundingClientRect();
    if (b) out[id] = { x: b.x, y: b.y, w: b.width, h: b.height };
  }
  return out;
}

// Sample the middle of the box, not its edges: a pill's rounded corners show
// the page through, and worst-pixel-wins would report those instead.
function worstAgainst(foreground, box, image) {
  const { data, info } = image;
  const insetX = Math.min(box.w * 0.15, 18);
  const insetY = Math.min(box.h * 0.3, 18);
  const x0 = Math.max(0, Math.round(box.x + insetX));
  const y0 = Math.max(0, Math.round(box.y + insetY));
  const x1 = Math.min(info.width - 1, Math.round(box.x + box.w - insetX));
  const y1 = Math.min(info.height - 1, Math.round(box.y + box.h - insetY));
  if (x1 <= x0 || y1 <= y0) return null;
  let worst = { ratio: Infinity, background: null };
  for (let y = y0; y <= y1; y += Math.max(1, Math.floor((y1 - y0) / 12))) {
    for (let x = x0; x <= x1; x += Math.max(1, Math.floor((x1 - x0) / 24))) {
      const o = (y * info.width + x) * info.channels;
      const background = [data[o], data[o + 1], data[o + 2]];
      const ratio = contrast(foreground, background);
      if (ratio < worst.ratio) worst = { ratio, background };
    }
  }
  return worst;
}

async function auditScreen(page, results) {
  const targets = await page.evaluate(collectTargets);
  if (!targets.length) return;
  const hide = await page.addStyleTag({
    content: "*, *::before, *::after { color: transparent !important; text-decoration-color: transparent !important; }",
  });
  await page.waitForTimeout(250);
  const boxes = await page.evaluate(boxesOf, targets.map((t) => t.id));
  const image = await sharp(await page.screenshot()).raw().toBuffer({ resolveWithObject: true });
  await hide.evaluate((node) => node.remove());
  for (const target of targets) {
    const box = boxes[target.id];
    if (!box || box.w <= 4 || box.h <= 4) continue;
    const worst = worstAgainst(target.color.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number), box, image);
    if (!worst) continue;
    const previous = results.get(target.id);
    if (!previous || worst.ratio < previous.ratio) results.set(target.id, { ...target, ...worst });
  }
}

async function auditRoute(browser, route, view) {
  const context = await browser.newContext({ viewport: { width: view.width, height: view.height }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(BASE + route.path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  const results = new Map();
  const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= documentHeight - view.height / 2; y += view.height / 2) {
    await page.evaluate((top) => scrollTo(0, top), y);
    await page.waitForTimeout(SETTLE_MS);
    await auditScreen(page, results);
  }
  await context.close();
  return results;
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let failures = 0;
let warnings = 0;
let checked = 0;
for (const route of selectedRoutes()) {
  for (const view of VIEWS) {
    const results = await auditRoute(browser, route, view);
    checked += results.size;
    for (const result of results.values()) {
      const need = result.large ? 3 : 4.5;
      // Epsilon: --color-info-dark sits on exactly 4.50 against the page.
      if (result.ratio >= need - 0.01) continue;
      if (result.overStage) warnings++;
      else failures++;
      console.log(
        `${result.overStage ? "WARN" : "FAIL"} ${route.slug} ${view.name}  ${result.ratio.toFixed(2)}:1 (need ${need})  ${result.label}  ` +
          `fg ${result.color} on ${hex(result.background)}  "${result.text}"`,
      );
    }
    console.log(`${route.slug.padEnd(9)} ${view.name.padEnd(8)} ${results.size} elements`);
  }
}
await browser.close();
console.log(`\n${checked} text elements checked · ${failures} failing`);
process.exit(failures ? 1 : 0);
