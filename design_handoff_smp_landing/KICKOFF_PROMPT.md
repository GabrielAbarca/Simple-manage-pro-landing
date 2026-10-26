# Kickoff prompt for Claude Code

Paste this into Claude Code from the root of `Simple-manage-pro-landing`, with this handoff folder copied in as `design_handoff_smp_landing/`.

---

You are implementing the approved redesign of the Simple Manage Pro landing site. Read `design_handoff_smp_landing/README.md` first, then every file in `design_handoff_smp_landing/docs/`. The HTML files in `design_handoff_smp_landing/design/` are the source of truth for every visual value, every string and every motion constant. Open them in Chrome to see them run.

**Binding decisions**
- One responsive Astro page per route: `/`, `/producto`, `/piloto`, `/nosotros`, `/contacto`.
  - Mobile is <768, tablet 768–1199, desktop ≥1200, written mobile-first with `min-width` queries.
  - The desktop, tablet and mobile design files are three states of the same page.
- Plain HTML/CSS + TypeScript only. No React. Recreate the design-system components (Card, Button, StatCard, DataTable, Badge, Toast, Input, Checkbox, ProgressRing, GradeBar, StatusBadge, TodayCard, Icon) as Astro components that match the DS exactly.
- three.js 0.160.0 from npm. Port each scene and each canvas `draw*()` function from the design files' logic classes nearly verbatim into `src/scripts/three/…`, keeping every constant.
- Piloto form → `src/pages/api/postular.ts` (`prerender = false`, `@astrojs/vercel` adapter) sending with Resend. Spec: `docs/FORM_RESEND.md`.
- Update `src/config.ts` `NAV` to Inicio `/`, Producto `/producto`, Piloto 2027 `/piloto`, Nosotros `/nosotros`, Contacto `/contacto`. Redirect `/portales` → `/producto` in `vercel.json`.
- All copy goes into `src/data/site.ts`, verbatim from the design files.
- Use `src/styles/tokens.css` variables where a token exists for a value.

**Order of work** (one PR-sized step at a time; show me screenshots after each):
1. Tokens and globals: Header (desktop nav + mobile/tablet menu panel from the right), Footer, Button variants, Toast, the reveal system, the `js` class gate for no-JS.
2. Home: static layout at all breakpoints → intro → hero portals scene → security scene → contact scene.
3. Producto: opening layout + captions → gather scene → portals layout + live UI interactions → portals scene.
4. Piloto: sections → calendar (both variants) → clipboard scene → form + endpoint.
5. Nosotros, then Contacto.
6. Run every item in `docs/QA_CHECKLIST.md`. Compare against the design files at 360/390/430/768/1024/1440 and fix every difference.

When a value is ambiguous, read the design file, which is authoritative. Don't invent new UI, copy, eyebrows or sections. Ask me only if the design files truly don't answer it.
