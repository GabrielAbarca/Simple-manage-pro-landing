# CLAUDE.md

Working guide for AI agents (and humans) contributing to the **Simple Manage
Pro landing page**. Read this before making changes.

This repo is the marketing page only. The product it advertises lives in
`SMP-Web-Page` (the app repo) and has its own `CLAUDE.md`; where the two
disagree about this repo, this file wins.

## Project overview

Five Spanish pages at `simplemanagepro.com`, built with **Astro 5**. Every page
prerenders; the `@astrojs/vercel` adapter exists for two small on-demand
routes: `/api/postular/` (the Piloto form, sent with Resend) and `/portales/`
(a 301 to `/producto/`). Deploys as its own Vercel project.

**V.2 (October 2026) is a build of an approved Claude Design redesign.** The
prototypes (`design_handoff_smp_landing/`: three per route, desktop, tablet and
mobile, plus specs) are no longer in the tree; they live in PR #12's history at
commit `f2584a0`. The built pages are the reference now: do not change a visual
value, string or motion constant without Gabriel's say-so.

| Route | Job |
| --- | --- |
| `/` | Intro, 3D hero with the three portals, data security, contact block |
| `/producto` | Problem → one expediente (3D scroll story), then the three portals with live UI |
| `/piloto` | Eligibility, what the colegio gets and gives, calendar, application form |
| `/nosotros` | Misión/visión tabs, dated history, founder |
| `/contacto` | WhatsApp, email and pilot form cards |

`/portales` (V1) redirects permanently to `/producto/` through
`src/pages/portales.ts`. Not `vercel.json` and not Astro's `redirects`: the
adapter routes a prebuilt deploy by `.vercel/output/config.json`, where a
redirect for `/portales` lands after the trailing-slash rule has already sent
the request to `/portales/`, so it never matched.

Adding a route means adding it to `src/config.ts` (`NAV`).

| Path | What it is |
| --- | --- |
| `BRIEF.md` | **The decision record.** Positioning, audience, offer. Its §7 carries three amendments; the third records every V.2 deviation. |
| `src/config.ts` | URLs, contact details, `waHref(message)`, `mailtoHref`, `NAV`, `BREAKPOINTS`. |
| `src/data/<page>.ts` | **All user-visible copy**, verbatim from the approved design. `site.ts` holds header, menu and footer copy. The owner edits strings here, never in markup. |
| `src/layouts/Layout.astro` | `<head>`, the js/motion gate, JSON-LD slot, header, footer, optional toast, reveal sweep. |
| `src/components/layout/` | `Header` (desktop nav + menu button), `MenuPanel` (right-hand panel, <1200), `Footer`, `Logo`. |
| `src/components/ui/` | The SMP design system rebuilt as plain Astro: `Icon` (+ `icons.ts`), `Button`, `Card`, `Badge`, `StatusBadge`, `StatCard`, `DataTable`, `TodayCard`, `ProgressRing`, `GradeBar`, `Toast`, `Input`, `Checkbox`. |
| `src/components/<page>/` | One component per design section. |
| `src/scripts/core/` | `anim` (tween, easings), `reveal`, `header`, `menu`, `breakpoints`, `lazy-scene`. |
| `src/scripts/ui/` | `ds-runtime` (update DS components in place), `toast`. |
| `src/scripts/<page>/` | Page orchestration and behaviour (`page.ts` is the entry). |
| `src/scripts/three/core/` | `stage` (renderer, camera, frame loop), `studio` (env + lights + hover), `textures` (font loading, redraws), `env`, `geometry`, `canvas2d`. |
| `src/scripts/three/textures/` | Every canvas texture, ported from the approved design and byte-identical to it. |
| `src/scripts/three/scenes/` | One module per 3D scene, with a same-named folder for its builders. |
| `src/pages/api/postular.ts` + `src/lib/postular/` | The Piloto form endpoint. `handle.ts` is the request → response logic with its collaborators injected (so it runs without Resend); `parse-body`, `validate` (shared with the client), `rate-limit`, `render-email`, `send-email` (the Resend adapter). |
| `src/styles/` | `tokens.css` (DS tokens verbatim + landing tokens), `globals.css`, `buttons.css`. Everything else is scoped per component. |
| `public/` | Icon set, self-hosted Poppins, `og.png`, `robots.txt`, manifest. |

## Commands

```bash
npm run dev     # dev server on :4321, including the API route and the /portales/ redirect
npm run build   # production build (static pages plus two functions)
npm run check   # astro check, must stay 0 errors / 0 warnings
```

There are no test or audit scripts in the repo. Run `check` and `build` before
considering work done, then look at every route in a browser at 390, 768 and
1440 wide, once with JavaScript off and once with reduced motion. The Vercel
preview is the place to check the `/portales` redirect and a real form send.
The Vercel adapter does not support `astro preview`.

## Hard rules

These are non-negotiable. They override default agent behavior.

1. **Branch per task, off `main`.** Naming is `<type>/<short-kebab-summary>`:
   `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`. Two or three words after
   the slash. (The V.2 build branch, `Simple-Manage-Pro-V.2`, was named by
   Gabriel and is the one exception.)

   **Never use an agent- or tool-generated branch name.** Forbidden: any
   `claude/…` prefix, any random suffix or hash, any timestamp or session id.
   This applies even when a session starts on a pre-assigned branch.

2. **Claude is never an author, co-author, or contributor.** Two places leak it:

   - **The commit message**: no `Co-Authored-By: Claude …` trailer, no
     `Generated with Claude Code` line, no AI meta-commentary. This holds even
     when a session's tooling asks for one.
   - **The git identity itself**: hosted environments ship with
     `user.name=Claude` / `user.email=noreply@anthropic.com`.

   **Before your first commit in any session, run:**

   ```bash
   git config user.name    # must be GabrielAbarca
   git config user.email   # must be gzelaya0404@gmail.com
   ```

3. **Commit messages** are professional and imperative. Explain *why* in the
   body when the reason is not obvious from the diff.

4. **Finished branches merge into `main` via PR.** No AI attribution in PR
   titles or bodies either.

5. **`BRIEF.md` is settled, and so is the V.2 design.** Do not relitigate
   positioning, structure, the offer, or the design's visuals. A deviation
   needs Gabriel's agreement and a line in BRIEF §7, never a quiet change.

6. **Clarify vague prompts.** A wrong assumption is more expensive than a
   question, especially about visual direction.

7. **No comments.** Names and structure carry the explanation. A comment
   survives only when it records something fundamental the code cannot say (a
   regression a well-meaning cleanup would cause), in at most three lines.
   Directives such as `// @ts-check` stay. New code follows the same rule.

8. **No secrets in the repo.** `RESEND_API_KEY` lives in Vercel (Production +
   Preview) and in an untracked `.env`. The endpoint never returns provider
   errors or stack traces to the client.

## Content rules

Load-bearing. Breaking one is a factual error about the product.

- **Costa Rican Spanish, institutional register, `usted`.** *curso lectivo*
  (not "año escolar"), *colegio*, *periodos*, *secciones*, *matrícula*,
  *notas*, *expediente*, *director/a*, *coordinador/a*, *cédula*.
- **Copy is verbatim from the approved design** and lives in `src/data/`. Accents,
  the middle dot "·" and en dashes ("Feb – Jun") are part of the copy.
- **There is no parent portal.** Nothing on the page may imply an encargado
  logs in. The mock chat "Padres de familia 10-2" inside a Producto texture is
  the *problem* being shown, which BRIEF §7 allows.
- **"privado" is allowed** since V.2 (eligibility line and the form's Tipo de
  colegio), by Gabriel's call. The V1 rule against it is withdrawn.
- **Link `demo.simplemanagepro.com`. Never `pilot.`**, a writable school
  instance.
- **No tech stack, no GitHub link, no Codingraph** on the page.
- **The founder is named and described only on `/nosotros`.**
- **Data residency stays on every page**: the footer's "Expedientes alojados en
  Estados Unidos, cifrados en tránsito y en reposo."
- **Never use an em dash (—) in anything a visitor reads**, `<title>` and email
  subjects included. Commas, colons and full stops do the work. The texture
  fixture "—" (an empty grade cell inside a drawn gradebook) is product UI, not
  copy.
- **The brand is `SIMPLE MANAGE PRO` as a logotype, `Simple Manage Pro` in
  prose.** The logotype's "MANAGE PRO" is `#ff7782`, as in the design; WCAG
  1.4.3 exempts logotypes.

## Design conventions

- **Exact reproduction.** Keep the design's values; don't round, tidy or
  "improve" them. Breakpoints are the design's three layouts: mobile
  `<768`, tablet `768–1199`, desktop `≥1200`, written mobile-first with
  `min-width` queries. 3D scenes switch constants at runtime through
  `currentLayout()`, never once at load.
- **No global `box-sizing` reset.** The design runs on the browser default (an
  outline pill is 2px taller than a filled one); mirror what each component
  sets.
- **Root font size is the DS clamp** `clamp(12.5px, 12px + .25vw, 14px)`, so
  rem values inside DS components match the product.
- **Light theme only.** V.2 dropped dark mode.
- **Accessibility floor is WCAG 1.4.3** (4.5:1 normal text, 3:1 large). The
  design's muted tiers (`#667281`, `#627388`) clear 4.5:1 only on flat
  surfaces. Gabriel's rule: keep the design hex, and switch **only the elements
  that fail a contrast check** to `--ink-muted-strong` (`#515c6b`) /
  `--ink-micro-strong` (`#4e5c70`). Text over a live WebGL stage depends on the
  frame: review it by eye.
- **Fills are not text colours.** `--brand-fill` (`#5a69e9`) carries white;
  `--brand-text` (`#4455e6`) is the readable blue for type.
- **Never let a scroll effect leave content invisible.** The reveal is a
  rAF-throttled scroll sweep over `[data-rv]` groups, not an
  IntersectionObserver: IO reports only at a threshold crossing, and a fling
  scroll that misses it leaves a section hidden. (`lazy-scene.ts` does use IO,
  but only to decide when to download a scene, never whether content shows.)
- **The js/motion gate.** An inline head script adds `js` (scripting runs) and
  `motion` (scripting runs and no reduced-motion preference). Start states
  (`[data-rise]` at 110%, `[data-fade]` at opacity 0) exist only under
  `.motion`; never write them inline. `[data-stage]` and `[data-js-only]` are
  hidden without `.js`; `[data-intro]` without `.motion`. So with JS off every
  page renders complete, and under reduced motion every page renders in its
  final state with idle 3D motion at zero.

## 3D

- **three.js 0.160.0, pinned**, from npm, `import * as THREE from "three"`.
- **Never in the critical path.** Hero scenes load after first paint; every
  other scene loads through `whenNear()` when its stage comes within one
  viewport. Each `import()` failure is caught and logged, and the page works
  without it.
- **Draw only when visible.** `startFrameLoop(frame, isActive)` skips frames
  off screen and in hidden tabs. Pixel ratio is capped at 2 on desktop and 1.5
  below it (`pixelRatioCap`). Renderers dispose on `pagehide`.
- **Build in short tasks.** A scene that draws its textures, uploads them and
  links its shaders in one task blocks input for seconds on a throttled phone
  (Producto's opening once took 2.3s in one task). Yield between textures
  (`yieldToMain`), upload each as it is drawn (`renderer.initTexture`), and
  link with `compileInSteps` before the first frame. The remaining long tasks
  on Producto and Piloto are the PMREM environment and the clearcoat shaders,
  which Lighthouse runs on software GL; on a real GPU they cost milliseconds.
- **Textures need Poppins first.** `loadPoppins()` before the first draw, then
  `redrawWhenFontsSettle()`: text measured against a fallback face stays on
  the slab otherwise.
- **Hover, raycast, click-to-open and cursor changes are desktop only**, as in
  the design. Phones and tablets get no 3D interaction.
- **Textures and constants are approved.** The texture modules were checked
  byte for byte against the approved design; a "cleanup" that changes a number
  changes the picture.
- `motionIntensity` multiplies idle motion: 1.6 on Home, 1 elsewhere.

## The Piloto form

`/piloto#postular` posts to `/api/postular/` (the slash matters: the site is
`trailingSlash: "always"`, and the slashless path 404s). One validator
(`src/lib/postular/validate.ts`) runs in the browser and again on the server,
with the copy in `src/data/postulacion.ts`. The endpoint accepts JSON (the
scripted form) and urlencoded (no-JS, answered with a 303 to
`/piloto/#postulacion-recibida` or `#postulacion-error`), drops honeypot posts
with a fake success, rate-limits per IP in memory (best effort across
serverless instances), and sends through Resend with `replyTo` set to the
applicant. The sending domain must be verified in Resend.
