// Every page must render complete and readable with JavaScript disabled:
// no intro overlay, no empty 3D stage holding open a gap, no reveal start
// state left behind, and the demo CTA reachable. Exits 1 on any failure.
import { chromium } from "playwright";
import { ROUTES, BASE_URL } from "./routes.mjs";

const VIEWS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

function inspectPage() {
  const isShown = (element) => {
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
  };
  const stuckReveals = [...document.querySelectorAll("[data-rise],[data-fade],[data-irise]")].filter((element) => {
    const style = getComputedStyle(element);
    return isShown(element) && (parseFloat(style.opacity) < 0.9 || style.transform !== "none");
  });
  return {
    h1Count: document.querySelectorAll("h1").length,
    introShown: [...document.querySelectorAll("[data-intro]")].some(isShown),
    stagesShown: [...document.querySelectorAll("[data-stage]")].filter(isShown).length,
    stuckReveals: stuckReveals.length,
    demoLinks: document.querySelectorAll('a[href^="https://demo.simplemanagepro.com"]').length,
    textLength: document.body.innerText.replace(/\s+/g, " ").trim().length,
  };
}

function problemsIn(result) {
  const problems = [];
  if (result.h1Count !== 1) problems.push(`${result.h1Count} h1 elements`);
  if (result.introShown) problems.push("intro overlay visible");
  if (result.stagesShown) problems.push(`${result.stagesShown} empty 3D stage(s) visible`);
  if (result.stuckReveals) problems.push(`${result.stuckReveals} reveal(s) stuck in start state`);
  if (!result.demoLinks) problems.push("no demo link");
  return problems;
}

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
let failures = 0;
for (const view of VIEWS) {
  const context = await browser.newContext({ viewport: view, javaScriptEnabled: false });
  for (const route of ROUTES) {
    const page = await context.newPage();
    await page.goto(BASE_URL + route.path, { waitUntil: "load" });
    const problems = problemsIn(await page.evaluate(inspectPage));
    failures += problems.length;
    console.log(`${route.slug.padEnd(9)} ${view.name.padEnd(8)} ${problems.length ? "FAIL " + problems.join("; ") : "ok"}`);
    await page.close();
  }
  await context.close();
}
await browser.close();
process.exit(failures ? 1 : 0);
