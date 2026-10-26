# QA checklist (all must pass before merging)

## Visual parity
- [ ] For every route, at **360, 390, 430, 768, 1024 and 1440** px wide, a side-by-side against the matching `design/<bp>/<Page>.dc.html` (open it in Chrome at the same viewport) shows no visible difference in layout, type, color, spacing, radius or copy.
  - Check the hero, then each `data-screen-label` section, then the footer.
- [ ] 1024×768 landscape: tablet layout, nothing clipped, 3D fits.
- [ ] Section eyebrows: only the ones present in the files.
- [ ] All copy matches the files exactly, including accents, en dashes ("Feb – Jun") and the middle dot "·".
- [ ] Attendance pills read **Presente / Ausente / Tardía**.
- [ ] Menu panel slides from the **right**: 85% on mobile, max 480px on tablet, light lilac scrim.

## Motion and 3D
- [ ] Home intro: counter and months (1.7s) → lines rise → wipe up (1.1s). Scrolling during the intro exits it in 0.7s. The header is white during the intro.
- [ ] Home hero: the slabs fan horizontally on desktop and stack vertically with one-line captions on mobile/tablet. The headline lifts away.
- [ ] Security database: disks drop in, the lock orbits. On desktop, hover spreads the stack and click spins it.
- [ ] Contact objects enter and float. On desktop, hover lifts each one, and hovering the WhatsApp CTA lifts the bubble.
- [ ] Producto opening: the camera tour and the chapter captions follow the windows in MOTION §6. Objects gather into the record. 8 objects on desktop, 4 on mobile/tablet.
- [ ] Producto portals: the objects track their anchors, and the DOM parallax and reveals work.
- [ ] Piloto clipboard sways. The calendar plays once (horizontal on desktop, vertical on mobile/tablet). The Nosotros timeline plays once.
- [ ] `prefers-reduced-motion`: no intro, no idle motion, everything in its final state.
- [ ] Off-screen scenes don't render (check the Performance panel). Hidden tabs don't render.

## Function
- [ ] All nav, footer, CTA, WhatsApp (`wa.me/50671848300` + prefilled text), mailto and demo links are correct. `/portales` redirects to `/producto`.
- [ ] Producto live UI: period toggle + toast "Guardado.", attendance pills + live summary, "Guardar asistencia" toast, I/II Periodo switch updates the ring, average and grades.
- [ ] Nosotros tabs: click, Anterior/Siguiente, and arrow keys all switch. The indicator and track animate.
- [ ] Contacto copy buttons → toast "Copiado.".
- [ ] Piloto form: every validation rule and message, error scroll and focus, sending state, confirmation, send-failure message, honeypot, server validation, email received with `reply-to` set to the applicant.
- [ ] Menu: open, close by scrim, by X and by Esc. Scroll is locked while open and focus is contained.

## Repo scripts
- [ ] `npm run check` passes.
- [ ] `npm run audit:contrast` passes (text ≥ 4.5:1, large display ≥ 3:1).
- [ ] `npm run check:nojs` passes: all text and CTAs visible without JS, no intro overlay, no empty stage gaps.
- [ ] `npm run capture` screenshots updated.

## Performance and accessibility
- [ ] Lighthouse mobile ≥ 90 performance, ≥ 95 accessibility.
- [ ] three.js isn't in the critical path, and is lazy-imported per scene.
- [ ] Every control is ≥ 44px on touch and has a visible focus ring (DS focus ring).
- [ ] Headings in order: one h1 per page. WebGL stages are `aria-hidden="true"`.
