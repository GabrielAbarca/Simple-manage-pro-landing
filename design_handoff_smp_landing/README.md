# Handoff: Simple Manage Pro landing site (redesign)

> **Start here:** read this README, then `docs/PAGES.md`, `docs/RESPONSIVE.md`, `docs/MOTION_AND_3D.md`, `docs/FORM_RESEND.md`, `docs/QA_CHECKLIST.md`. Paste `KICKOFF_PROMPT.md` into Claude Code.

## Overview
This is the redesign of the public marketing site for Simple Manage Pro (SMP), a school-management platform for Costa Rican secondary schools (*colegios*). The site has five routes:

| Route | Design file (per breakpoint) | Purpose |
| --- | --- | --- |
| `/` | `design/{desktop,tablet,mobile}/Home.dc.html` | Intro animation, 3D hero with the three portals, security section, contact block |
| `/producto` | `…/Producto.dc.html` | Problem → solution scroll story (3D objects gather into one SMP record), then the three portals with live UI |
| `/piloto` | `…/Piloto.dc.html` | Piloto 2027: eligibility, what the school gets and gives, calendar, application form |
| `/nosotros` | `…/Nosotros.dc.html` | Mission/vision tabs, history timeline, founder |
| `/contacto` | `…/Contacto.dc.html` | WhatsApp, email and pilot form cards |

Target codebase: **`GabrielAbarca/Simple-manage-pro-landing`** (Astro 5, static, deployed on Vercel). The owner has approved these decisions, and they are binding:

1. **One responsive page per route.** The desktop/tablet/mobile files are three states of the same page. Do not ship separate mobile URLs.
2. **Plain HTML + TypeScript** for every interactive piece. No React islands. The design-system React bundle is only a visual reference.
3. **Resend** sends the Piloto application form (see `docs/FORM_RESEND.md`).
4. **The goal is an exact reproduction** of the approved designs at every breakpoint.

## About the design files
The files in `design/` are **design references built in HTML**. They are working prototypes that show the intended look, motion and behavior. They are not production code to copy wholesale. Your job is to **recreate them in the existing Astro codebase**, using its patterns (`src/config.ts`, `src/data/site.ts`, `src/styles/tokens.css`, Astro components, `<script>` modules).

How to read a design file:
- Open any `design/**/X.dc.html` directly in a browser (Chrome). `design/support.js` is the tiny runtime that renders them. `design/_ds/` holds the design-system fonts, tokens and bundle they load.
- **Markup + inline styles** sit between `<x-dc>` and `</x-dc>`. Every visual value (size, color, spacing, radius, shadow, clamp) is literal in the `style="…"` attributes, so treat those as the spec. `style-hover="…"` / `style-focus="…"` are the hover and focus states. `{{ name }}` holes are values computed in the logic class.
- **Behavior** lives in `<script type="text/x-dc" data-dc-script>`, a plain-JS class (`class Component extends DCLogic`). All scroll mapping, 3D scenes (three.js), canvas texture drawing, form validation and toasts are there. **Port this logic nearly verbatim into TypeScript modules.** The numbers in it are tuned and approved.
- `<x-import component-from-global-scope="SimpleManageProDesignSystem_b97d6b.X">` mounts a design-system React component (Card, Button, StatCard, DataTable, Badge, Icon, Toast, Input, Checkbox, ProgressRing, GradeBar, StatusBadge, TodayCard). Recreate each one in plain HTML/CSS to match the DS. The source is readable in `design/_ds/…/_ds_bundle.js`, and the product repo is `GabrielAbarca/Simple-Manage-Pro-Software`, `src/css/style/*`.
- `<sc-for>` is a loop and `<sc-if>` is a conditional.

## Fidelity
**High-fidelity.** Final colors, type, spacing, copy, motion and 3D. Reproduce pixel-for-pixel at 390, 768, 1024 and 1440 px wide.
- **Copy is final for this build.** Move it verbatim from the design files into `src/data/site.ts`. The owner edits it later, so keep every string in data, never hard-coded in components.
- Section eyebrows (small uppercase labels) were **intentionally removed** in most places. Only the ones still in the files remain. Don't add any back.

## Breakpoints (binding)
| Name | Width | Reference file |
| --- | --- | --- |
| Mobile | `< 768px` | `design/mobile/*` (reviewed at 360, 390, 430) |
| Tablet | `768px – 1199px` | `design/tablet/*` (reviewed at 768, 1024) |
| Desktop | `≥ 1200px` | `design/desktop/*` (reviewed at 1440) |

Write CSS mobile-first, with `@media (min-width: 768px)` and `@media (min-width: 1200px)`. For each element, the value in the matching file is the value at that breakpoint. 3D scene layout constants also switch at these widths (see `docs/MOTION_AND_3D.md`). The full per-element delta list is in **`docs/RESPONSIVE.md`**.

## Documents in this package
- `docs/PAGES.md`: section-by-section spec for every route (layout, components, states, copy source).
- `docs/RESPONSIVE.md`: everything that changes between mobile, tablet and desktop.
- `docs/MOTION_AND_3D.md`: reveal system, Home intro, scroll mappings, every three.js scene (what to port, constants, performance rules).
- `docs/FORM_RESEND.md`: Piloto form fields, validation, states, and the Resend endpoint.
- `docs/QA_CHECKLIST.md`: acceptance checklist before merging.
- `KICKOFF_PROMPT.md`: a ready-to-paste first prompt for Claude Code.

## Global components

### Header (all routes)
- `position:fixed; top:0; inset-x:0; z-index:30; display:flex; justify-content:space-between; align-items:center; color:#363949`.
  - Desktop: `gap:24px; padding:24px 4vw`.
  - Mobile: `gap:16px; padding:16px 20px`.
  - Tablet: `padding:16px 40px`.
- **Scrolled state** (`scrollY > 40`; on Home, once the hero bottom passes 90px): `background: rgba(246,246,249,0.94)`. Vertical padding goes to 14px on desktop and 12px on mobile/tablet. Transition: background, padding and color at `400ms cubic-bezier(.65,0,.35,1)`.
- **Logo lockup:** 32×32 app icon (`public/apple-touch-icon.png`, `border-radius:9px`), `gap:10px`, then `SIMPLE` + `MANAGE PRO`. Weight 800, `letter-spacing:.04em`, `white-space:nowrap`, 14px (13px on mobile/tablet). `MANAGE PRO` is `#ff7782` with `margin-left:-4px`. The lockup links to `/`.
- **Desktop nav:** `gap:32px`, 14px/500. Items come from `NAV` in `src/config.ts`: **Inicio · Producto · Piloto 2027 · Nosotros · Contacto**. The active item is `#4455e6`, weight 600. Hover is `opacity:.7`.
- **Desktop CTA "Ver la demo"** → `DEMO_URL`, `target=_blank rel=noopener`. `min-height:44px; padding:0 22px; border-radius:999px; background:#363949; color:#fff; 14px/600`. Hover `opacity:.9`.
- **Home intro state** (desktop and mobile): while the blue intro overlay is up, the header text is `#fff`, and the desktop CTA is `background:#fff; color:#111e88`.
- **Mobile/tablet:** the nav and CTA are replaced by a 44×44 **menu button**. It holds three 22×2px bars with radius 2, `gap:6px`, color `currentColor`, `aria-label="Abrir menú"` and `aria-expanded`.

### Menu panel (mobile + tablet)
- A fixed full-screen layer at `z-index:60`.
- **Scrim:** `rgba(196,200,242,0.62)`, opacity 0→1 over `400ms cubic-bezier(.65,0,.35,1)`. Tapping it closes the menu.
- **Panel:** `<nav aria-label="Menú">`, **slides in from the RIGHT**. `position:absolute; top:0; right:0; bottom:0; width:85%`, with `max-width:480px` on tablet. `background:#fff; box-shadow:0 2rem 3rem rgba(132,139,200,0.28); padding:12px 24px 32px; gap:32px`. Moves `translateX(101%)` → `translateX(0)` over `400ms cubic-bezier(.65,0,.35,1)`.
- **Panel content, top to bottom:**
  1. Logo lockup + close button: 44×44, circular, `background:#f6f6f9`, an X made of two rotated 18×2 bars, `aria-label="Cerrar menú"`.
  2. The 5 links, centered vertically. `min-height:64px; font-size:clamp(30px,9vw,40px); weight 800; letter-spacing:-.045em; border-bottom:1px solid rgba(132,139,200,.22)`. The current page is `#4455e6`, the others `#363949`.
  3. Two contact rows, each `min-height:56px`, made of a micro-label (12px/600/.08em uppercase `#627388`) and a 17px/600 value: **WhatsApp** "+506 7184 8300" (→ `waHref`) and **Correo** "contact@gzelaya.com" (→ `mailto:`).
- **While open:** `document.documentElement.style.overflow='hidden'`. Escape closes it. Use `aria-hidden` and `pointer-events:none` when closed. Prefer `inert` on the panel when closed.

### Footer (all routes)
- `border-top:1px solid rgba(132,139,200,.3)`, `max-width:1440px`, centered.
  - Desktop: `padding:56px 4vw 40px`, column gap 56px.
  - Mobile: `padding:40px 20px 32px`, gap 40px.
  - Tablet: side padding 40px.
- **Brand column** (`flex:1 1 320px`): the lockup plus "Sistema de gestión para colegios. Notas, asistencia, horarios y expedientes en un solo lugar." at 14px/1.6 `#667281`, `max-width:26rem`.
- **"Sitio" column:** the 5 nav links. **"Legal" column:** Privacidad → `PRIVACY_URL`, Términos → `TERMS_URL`, and "Expedientes alojados en Estados Unidos, cifrados en tránsito y en reposo." Column heads are 12px/600/.08em uppercase `#627388`. Links are 14px `#363949`, hover `#4455e6`.
- **Bottom row** (13px `#627388`, space-between, wraps): "© 2026 Simple Manage Pro" · "SMP no reemplaza nada del MEP."

### Buttons (pill family)
| Variant | Spec |
| --- | --- |
| Primary | `min-height:52px` (56px for section CTAs), `padding:0 28px` (32px), `radius:999px`, `background:#5a69e9`, `#fff`, 15px (16px)/600, `box-shadow:0 1rem 2rem rgba(90,105,233,.28)`, hover `opacity:.9`. Transition opacity 100ms. |
| Outline | Same box, `border:1px solid #627388`, `color:#363949`, transparent background, hover `background:rgba(0,0,0,.04)`. |
| Dark | `background:#363949; color:#fff`, hover `opacity:.9`. |
| Text + rule | `#4455e6` 600, `gap:10px`, followed by a 28×1px `currentColor` line. Hover `#111e88`. `min-height:44px`. |

- Mobile: CTA groups stack `flex-direction:column; align-items:stretch; gap:10px`, and labels are centered (`justify-content:center`).
- Tablet: CTA groups are inline again (`flex-wrap:wrap; gap:12px`).

### Toast
- Fixed, centered. `top:96px` on desktop, `80px` on mobile/tablet. `z-index:40`.
- Shows for 2200ms: opacity and `translateY(-12px→0)` over `250ms cubic-bezier(.16,1,.3,1)`.
- Body is the DS Toast, with copy ending in a period: "Guardado.", "Copiado.".
- Use `role="status" aria-live="polite"`.

## Design tokens
These all map to the existing `src/styles/tokens.css`. Use the token wherever one exists.

**Ink and surfaces**
- `#363949`: heading/body ink. `#4d5566`: lead paragraph. `#667281`: muted body. `#627388`: micro-labels and control borders (`--border-control`).
- `#f6f6f9`: page background. `#fff`: cards.

**Brand**
- `#4455e6`: primary text, links and active states (brand `-text`). `#5a69e9`: primary fills.
- `#7380ec`: brand periwinkle, used for dots and 3D. `#a78bfa`: violet accent. `#111e88`: deep, for link hover and the intro overlay. `#b9b0ff`: second intro line. `#dfe2fa` / `#c9cdf5`: large ghost numerals and inactive dots.

**Status**
- Success `#41f1b6` (text `#097c56`). Danger `#ff7782` (text `#d30011`). Warning `#ffbb55` (text `#9d5e00`).
- Status fills come from DS tokens `--color-success-fill`, `--color-danger-fill`, `--color-warning-fill`.

**Lines and shadows**
- Hairlines: `rgba(132,139,200,0.3)` for section rules, `0.22` in the menu, `0.18` inside cards.
- Card shadow: `0 2rem 3rem rgba(132,139,200,0.18)`. Small card shadow: `0 1rem 2rem rgba(132,139,200,0.14)`.

**Radii**
- Big section cards: 48px desktop, 32px mobile/tablet.
- Inner panels: 36px desktop, 24px mobile/tablet.
- Contact cards: 36px desktop, 28px mobile/tablet.
- Milestone cards: 24px. Pills: 999px.

**Type and spacing**
- Type: Poppins 400–800 only (already in `public/fonts`). Display letter-spacing runs from −0.045em to −0.06em, line-height 0.84–0.98.
- Spacing: desktop sides `4vw` (cards `2vw`). Mobile sides `20px` (cards `12px`). Tablet sides `40px` (cards `28px`).

**Motion**
- Ease-out-expo `k => k>=1 ? 1 : 1 - 2^(-10k)` for reveals. `cubic-bezier(.65,0,.35,1)` for movement. `cubic-bezier(.16,1,.3,1)` for UI in.
- Durations: 100ms hover, 250ms toast, 400ms drawer and header, 900–1200ms reveals.

## Assets
- `public/apple-touch-icon.png`: header and footer lockup (already in the repo).
- `public/android-chrome-512x512.png`: drawn onto the 3D app-icon tile in Home's contact scene (already in the repo).
- **No photography or illustration.** Every "object" is a three.js mesh with a canvas-drawn texture. The drawing functions are in the design files (`drawAdmin`, `drawTeacher`, `drawStudent`, `drawSheet`, `drawAttendance`, `drawPhone`, `drawReport`, `drawSticky`, `drawRecord`, `drawGradebook`, `drawStudentPhone`, `drawForm`, `drawBubble`, `drawShadow`, `drawRadial`). Port them verbatim.
- Icons: SMP Material Symbols sprite (the DS `Icon` component). Inline the needed SVG paths from the DS bundle and don't load an icon font. Names used: `calendar_month`, `groups`, `person_add`, `today`, `fact_check`, `grading`, `grade`, `schedule`, `history_edu`, `badge`, `support_agent`, `person`, `call`, `mail`, `edit_note`, `content_copy`, `check_circle`, `event_available`, `save`, `chevron_left`, `chevron_right`, `school`, `category`, `co_present`.

## Files
```
design/desktop/{Home,Producto,Piloto,Nosotros,Contacto}.dc.html   ≥1200px reference
design/tablet/{…}.dc.html                                         768–1199px reference
design/mobile/{…}.dc.html                                         <768px reference
design/support.js        runtime that renders the .dc.html files in a browser (reference only)
design/_ds/…             SMP design-system fonts, tokens, React bundle (reference only)
design/assets/           app icons used by the prototypes
docs/*.md                specs
KICKOFF_PROMPT.md        first prompt for Claude Code
```
