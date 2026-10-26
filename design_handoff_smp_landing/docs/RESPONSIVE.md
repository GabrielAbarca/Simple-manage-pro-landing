# Responsive deltas

There are three reference files per route. **Desktop (≥1200)** is the original design. **Mobile (<768)** was derived from desktop with the changes listed below. **Tablet (768–1199)** was derived from mobile with the scaling rules in §3. To check any element, open the three files side by side and compare the same element. Sections carry the same `data-screen-label` in all three.

Implementation: write the CSS mobile-first. Put the tablet values under `@media (min-width:768px)` and the desktop values under `@media (min-width:1200px)`. For JS layout constants (3D), read `matchMedia` once and again on change.

## 1. Global (all routes)
| Element | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Header padding | `16px 20px` (scrolled `12px 20px`) | `16px 40px` (scrolled 12px) | `24px 4vw` (scrolled 14px) |
| Header gap | 16 | 16 | 24 |
| Lockup size | 13px, nowrap | 13px | 14px |
| Nav | menu button + right panel 85% | menu button + panel `min(85%,480px)` | inline 5 links + "Ver la demo" |
| Footer | `40px 20px 32px`, gap 40 | sides 40px | `56px 4vw 40px`, gap 56 |
| Section side padding | 20px (cards 12px) | 40px (cards 28px) | 4vw (cards 2vw) |
| Big card radius / inner panel radius | 32 / 24 | 32 / 24 | 48 / 36 |
| Inner card padding | `28–32px 16px` | `~40–45px 36px` | `clamp(28px,4.5–5vw,72–80px)` |
| CTA groups | stacked, full width, centered labels, gap 10 | inline wrap, gap 12 | inline wrap, gap 12–20 |
| Lead paragraphs | 16px / 1.55 | 18px / 1.6 | `clamp(16px,1.25vw,19px)` / 1.6 |
| Sticky stage height | `100vh` then `100svh` | same | `100vh` |
| WebGL pixel ratio cap | `min(dpr,1.5)` | `min(dpr,1.5)` | `min(dpr,2)` |
| Hover-driven 3D (raycast hover, click-to-open, cursor) | **removed** | **removed** | on |
| Mouse parallax | inert (no mouse) | inert | on |
| Toast top | 80px | 80px | 96px |
| Section eyebrows/step rails | step rails hidden | hidden | visible |

## 2. Per route (mobile vs desktop)

### Home
- **Intro.**
  - Padding `88px 20px 28px`.
  - Headline `clamp(44px,13.5vw,72px)`.
  - Month bars 22px wide, gap 6.
  - Counter `clamp(80px,26vw,120px)`.
- **Headline block.**
  - Top-aligned: `left/right:20px; padding-top:100px; gap:20px`. No vertical centering and no max-width.
  - H1 `clamp(44px,14vw,64px)`.
- **Hero 3D, before the fan-out.** The slab stack sits in the space below the headline block:
  - Center Y = midpoint of (headline bottom, viewport bottom).
  - Scale = `min(0.62, visW/8.4, (h - headlineBottom)/ppu/6)`.
  - Mobile code: `initThree()` in `mobile/Home.dc.html`.
- **Fan-out.** Desktop fans the slabs **horizontally**. Mobile and tablet **stack them vertically** under the fan title.
  - The area runs from fan title bottom + 24px to viewport bottom − 16px, split into 3 equal slots, with 30px reserved per slot for the caption.
  - Rotation goes to `x:-0.06, y:-0.28, z:0`. Z-separation goes to 0.15.
  - Fan slab width: mobile `(w-48)`. Tablet `min(w*0.72, 760)`.
- **Fan title:** `top:88px; left/right:20px`, `clamp(30px,9vw,40px)`.
- **Captions:** single line (number + title), width `calc(100vw - 40px)` (tablet `- 80px`).
- **Bottom cue:** removed.
- **Security.**
  - Padding `96px 20px 24px`.
  - H2 `clamp(44px,13vw,60px)`.
  - Stage height `clamp(340px,50vh,440px)`.
  - Camera fit floor `0.36` (desktop `0.5`) so the orbit ring isn't cropped.
- **Contact.**
  - Outer padding `24px 12px 56px`.
  - Card one column, gap 8, padding 8, radius 32.
  - Left panel padding `32px 16px 24px`, gap 28.
  - H2 `clamp(38px,11vw,52px)`.
  - CTAs stacked.
  - Stage min-height 360, radius 24.
  - 3D root scale `min(1.05, visW/8.6, visH/7.6)` (desktop `visW/9.4`).

### Producto
- **Opening.**
  - Section `520vh` (desktop `700vh`).
  - Headline top-aligned at `padding-top:100px`, H1 `clamp(36px,11vw,52px)`, gap 18.
- **Chapter captions:** `left/right:20px; bottom:calc(40px + env(safe-area-inset-bottom))`, text `clamp(24px,7vw,30px)`/1.12. Chapter 04 CTAs stacked.
- **Bottom legibility gradient:** added (44% height).
- **Step rail:** hidden.
- **Opening 3D: 4 objects instead of 8.**
  - Kept: sheet 0, attendance list, phone, report card. Removed: sheets 1–2 and both sticky notes.
  - New positions `[-1.1,2.7,0]`, `[1.3,0.9,-0.8]`, `[-1.0,-1.0,1.0]`, `[1.2,-2.9,-1.0]`.
  - Record target `RT=[0,0.9,0]`, record rotation without yaw.
  - Camera keyframes replaced (MOTION §6). `fit = min(1, aspect/0.46)`.
- **Portals.**
  - All panels stack: intro padding `96px 20px 24px`, panels `64px 20px`, gap 20, text gap 20, capability rows padding 14.
  - Each panel has a dedicated 3D slot between text and UI (230px), with its anchor at the slot center.
  - CL anchor offsets `[[0.1,0.9,0.3],[-0.95,-0.4,-0.8],[0.95,-1.4,-0.4]]`.
  - Object scale ×0.85.
  - Panel visibility gate uses the anchor's viewport position: `ad=(anchorTop - vh/2)/vh`, `g = smooth((ad+0.85)/0.35) * smooth((0.85-ad)/0.35)`.
  - H3 `clamp(28px,8.4vw,36px)`.
  - StatCards `auto-fit minmax(140px,1fr)`.
  - DataTable drops "Docente guía", and "Estudiantes" becomes "Estud.".
  - Student grade rows drop StatusBadge.
  - Attendance pills `min-height:44px`.
- **End panel:** padding `72px 20px 96px`, H2 `clamp(34px,10vw,48px)`, CTAs stacked.

### Piloto
- **Hero.**
  - `min-height:100svh`, padding `100px 20px 32px`, gap 32.
  - H1 `clamp(72px,24vw,110px)`.
  - 3D stage spans the full width, between headline and bottom row: `top:clamp(250px,34vh,300px); bottom:clamp(230px,30vh,270px)`.
  - CTA full width, cue below it.
- **Para quién es:** padding `72px 20px`, one column, gap 24, H2 `clamp(34px,10vw,46px)`, row grid `2.2rem 1fr`, row padding 20.
- **Recibe/Pedimos:** stacked panels, padding `28px 16px`, gap 28, H2 `clamp(30px,9vw,40px)`, rows 16px font, padding 16.
- **Calendario:** **vertical timeline** (see PAGES §3.4). No ghost month label and no 11-column grid.
- **Postular.**
  - Card padding 8, gap 8, radius 32. Text panel `32px 16px 24px`.
  - H2 `clamp(36px,10.5vw,50px)`.
  - Form padding `24px 16px`, radius 24. All field grids one column, gap 18.
  - Error scroll offset 100px (desktop 140px).

### Nosotros
- **Hero:** `min-height:88svh`, padding `104px 20px 32px`, H1 `clamp(38px,11.5vw,54px)`.
- **MV card:** padding `28px 20px`, radius 32. Tabs 22px. Numerals 48px. Text 18px/1.55. Panel right padding 20.
- **History:** padding `0 20px 72px`, gap 40, H2 `clamp(34px,10vw,46px)`, paragraph 17px, timeline one column with gap 36, year 40px.
- **Founder:** one column, padding `32px 20px`, gap 28, avatar 72px, name `clamp(28px,8.4vw,38px)`, bio 17px.

### Contacto
- **Hero:** padding `112px 20px 40px`, one column, gap 20, H1 `clamp(40px,12.5vw,58px)`.
- **Cards:** one column, gap 12, radius 28, padding `24px 20px`, gap 20. Big values 22px. H2 24px.

## 3. Tablet rules (applied to the mobile file)
Each tablet file is its mobile file with these transforms. Read the tablet file for the resolved values.
1. Every fluid `clamp(A, Bvw, C)` becomes `clamp(A, 0.75·Bvw, 1.5·C)`. Type grows with width but never reaches desktop scale.
2. Side padding goes from 20px to 40px, card outer padding from 12px to 28px, and inner card padding `N 16px` becomes `1.4N 36px`. Absolute `left/right:20px` becomes 40px.
3. CTA groups go back to inline (`flex-wrap:wrap; gap:12px`). The Piloto hero CTA row is space-between.
4. Lead paragraphs are 18px / 1.6.
5. The menu panel is `width:min(85%,480px)`.
6. **Home:** fan slab width `min(w*0.72,760)`.
7. **Producto:**
   - Portal 3D slot 340px, intro 3D column `min(44vh,460px)`, object scale ×1.0.
   - Opening camera `fit=0.84` with a vertical offset of −0.9 on both camera and look-at, so objects clear the chapter captions.
   - Final record keyframes end at z 12 → 11.5.
   - GradeBar width `clamp(160, w*0.42, 420)`.
8. **Contacto:** 2-column grid, third card `grid-column:1/-1`.

Landscape tablets (1024×768) fall in the tablet range. They weren't separately reviewed, so check them in QA.
