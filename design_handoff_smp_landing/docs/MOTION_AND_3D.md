# Motion and 3D

All motion logic is in the logic class of each design file (`<script data-dc-script>`). **Port it into TypeScript with the same constants.** This document is the map: what each piece does, which method to port, and the rules that apply everywhere.

## 0. Architecture in the codebase
```
src/scripts/motion/reveal.ts        data-rise / data-fade reveal system + tween helper
src/scripts/motion/header.ts        scrolled state, menu panel (open/close, Esc, scroll lock)
src/scripts/home/intro.ts           Home intro overlay timeline
src/scripts/three/shared.ts         makeEnv, rrShape, slab, drawShadow, drawRadial, canvas helpers (rr, t, card2d, grad, wrap, rnd)
src/scripts/three/home-portals.ts   initThree() from Home
src/scripts/three/home-security.ts  initPilot() from Home
src/scripts/three/home-contact.ts   initContact() from Home
src/scripts/three/producto-gather.ts initThree() from Producto (opening)
src/scripts/three/producto-portals.ts initPortal() + portalDom() from Producto
src/scripts/three/piloto-clipboard.ts initThree() from Piloto
src/scripts/three/textures/*.ts     every draw*() canvas function, verbatim
```

**Global rules**
- **Dependency:** `three@0.160.0`, pinned. The design imports `https://unpkg.com/three@0.160.0/build/three.module.js`. Use the npm package and the same version.
- **Lazy loading:** each scene module is imported dynamically when its stage comes within one viewport of the screen (`IntersectionObserver`, `rootMargin:'100% 0px'`). The Home hero scene starts on page load, after the first paint.
- **Fonts before textures:** canvas textures need Poppins loaded. Call `document.fonts.load('<weight> 40px Poppins')` for 400–800, plus italic 500/600/700 on Producto, before the first draw. Redraw on `document.fonts.ready` and on `loadingdone`, as the files do.
- **Frame loop:** use plain `requestAnimationFrame`. The design's `tick()` adds a `setTimeout` fallback only because prototypes run in hidden iframes, so drop that. Skip rendering when the stage is off screen (each loop already checks `getBoundingClientRect`) and when `document.hidden`.
- **Breakpoint constants:** read `matchMedia('(min-width:1200px)')` and `matchMedia('(min-width:768px)')`, and pick the desktop, tablet or mobile constants from the matching file. Re-read on change.
- **Pixel ratio:** `min(devicePixelRatio, 2)` on desktop, `1.5` below 1200px.
- **Reduced motion:** `prefers-reduced-motion: reduce` means no intro overlay. Every reveal jumps to its end state and every idle motion (`k`) is 0. Scroll-driven positions resolve without smoothing.
- **No JS:** all text and CTAs must be visible without JS. Render the reveal start states (`translateY(110%)`, `opacity:0`) only when a `js` class is present on `<html>`, set inline in `<head>`. The intro overlay and the WebGL stages should not exist in the no-JS render. `npm run check:nojs` must pass.
- **`motionIntensity` (`k`)** multiplies idle floats, parallax and wobble. Production values: **Home 1.6, everywhere else 1**.
- **Disposal:** call `renderer.dispose()` on page unload (view transitions).

## 1. Reveal system (all pages)
- **Tween helper** `tw(dur, delay, fn)`: eased with **ease-out-expo** `e(k)= k>=1?1:1-2^(-10k)`. Home also uses `eMove` (cubic in-out).
- **Trigger:** any element with `data-rv` is revealed once when `rect.top < innerHeight * 0.82`. Home uses 0.85, Contacto 0.90.
- **Inside a revealed group:**
  - `[data-rise]` (also `data-rise2` on Home): `translateY(110%) → 0`, **1100ms**, delay `120 + i*90` ms. Home `data-rise2`: delay `i*100`.
  - `[data-fade]` (also `data-fade2`): opacity 0→1 and `translateY(14px→0)`, **900ms**, delay `450 + i*100`. Home `data-fade2`: `24px`, delay `150 + i*90`.
- **Page hero entrance** (on load): rise **1200ms**, delay `80–200 + i*100`. Fade 900ms, delay `450–600 + i*90`.

### 1.3 Piloto calendar (plays once, when the section top < 60% of the viewport)
- **Desktop:** over 1000ms (quad in-out), 11 month bars fill in sequence. Each active month goes to opacity 1. The ghost label shows the current month. The milestone cards reveal (opacity .25→1, `translateY 16→0`) when the month index passes `[0, 0.5, 5, 10]`.
- **Mobile/Tablet:** over 1600ms (quad in-out), the vertical track fills `scaleY(v)`. Each card j reveals at `a=clamp((v*3.4 - j)*1.8 + 0.4)` and its dot turns `#4455e6` once a > .5.

### 1.4 Nosotros history (plays once, when the list top < 80%)
- Item i starts at `i*250`ms. Its dot turns `#4455e6` and its fill scales X over 250ms.
- Its three text beats fade and rise 12px over 600ms, staggered 60ms.

### 1.5 Header
- Covered in the README.

## 2. Home intro (port `runIntro`, `introPhase2`, `introExit`, `heroIn`)
- **Phase 1:** after a 150ms delay, over 1700ms (cubic in-out), the counter goes 000→100, the progress bar scales X 0→1, and month i fills `clamp(e*11 - i)` with opacity `.35 + .65*fill`.
- **Phase 2:** counter and months fade out and drop 20px over 500ms. The two intro lines rise over 1000ms, delay `150 + i*110`.
- **Exit:** 1700ms after phase 2 starts, the overlay wipes up (`clip-path: inset(0 0 e*100% 0)`) over **1100ms** (cubic in-out). The lines drift `translateY(-18vh*e)`. Past e>.86 the header flips back to dark ink.
  - `heroIn()` runs at 35% of the exit duration: hero headline rise and fade, and the slabs' entrance (`ent` over 2000ms, expo-out).
- **Early exit:** if the user scrolls more than 1.5% into the hero during the intro, exit immediately over 700ms.
- **Replay policy:** the design ships with `alwaysPlayIntro = true`, so the intro plays on every visit. Keep it as a constant. A `sessionStorage['smp-intro-seen']` path already exists for a play-once-per-session mode.

## 3. Home hero portals (`initThree` in Home)
- **Scene:**
  - Camera fov 28 at z 18. Hemisphere light `0xffffff/0xc4c8f2` at 1.4, directional light 1.4 at (4,6,9).
  - Three slabs: rounded rectangles, extruded W 6.4 × H 4 × D 0.12, R 0.3. The face texture is a 1600×1000 canvas (`drawAdmin`, `drawTeacher`, `drawStudent`). Each slab casts a blurred drop shadow plane (`drawShadow`).
- **Scroll progress:** `p` over the 300vh hero, smoothed per frame with `1-0.88^(dt*60)`. Mouse is smoothed with `1-0.95^(dt*60)`.
  - `lift = smooth(p/0.28)`: the headline goes `translateY(-lift*140px)`, `opacity 1-lift`.
  - `fan = smooth((p-0.12)/0.5)`.
  - Fan title opacity `clamp((fan-0.45)/0.3)`, `translateY((1-o)*30px)`.
  - Caption i opacity `clamp((fan-0.6-i*0.1)/0.25)`. Its position is the projection of the slab's local point `(-W/2+0.2, -H/2-0.35, 0)`.
- **Desktop layout** (aspect > 1.15):
  - Base pose: x `visW*(aspect<1.9?0.27:0.2)`, y −0.1, scale `min(1, visW/16.5)`, rotation (−0.95, 0, 0.55), z-separation `0.6 + sin(t*1.1)*0.05`.
  - Fanned pose: scale `min(0.74, visW/20, visH/11)`, x `visW*0.04`, y `-visH*0.04`, rotation (−0.16, −0.5, 0.05), slab i at x `(i-1)*4.6`, z-separation 2.2.
  - Mouse parallax: rot x `±0.08k`, rot y `±0.12k`. Idle float `sin(t*.8)*.08k`.
- **Mobile/Tablet layout:** see `RESPONSIVE.md §2 Home`. Port the replaced block from `mobile/Home.dc.html` and `tablet/Home.dc.html` (it computes slots from the live `offsetTop/offsetHeight` of the headline and fan title).

## 4. Home security database (`initPilot` in Home)
- **Camera:** fov 28. Position `(m.x*1.0k, 3.2 - m.y*0.6k, 9.6/fit)` looking at (0,1.2,0), with `fit = max(0.5 desktop | 0.36 mobile/tablet, min(1, aspect/1.5))`.
- **Environment:** PMREM room environment from `makeEnv` (plus hemisphere 0.7 and directional 1.3 at (4,9,7)).
- **Database:** a pedestal (lathe r 2.3, h 0.2) and three lathe disks (r 1.55, h 0.58, corner 0.18). Clearcoat physical materials `#5a69e9 / #7380ec / #a78bfa`. Two small LEDs per disk (`#41f1b6` and white). The disk stack spins `t*0.22k`.
- **Entrance:** driven by the section entering the viewport, `q = clamp((innerHeight - rect.top)/(innerHeight*0.85))`. Disks drop in from +7 with ease-out-cubic, staggered 0.14. The lock appears at q·1.5 > 0.55.
- **Lock:**
  - Body: white slab 1.15×0.95×0.42, with a keyhole and a metal shackle.
  - Orbit: ellipse RX 3.0, RZ 2.35 at y 1.05, angle `t*0.55*max(.25,k)+0.9`, bobbing `sin(2a)*0.18`.
  - The ring is a torus at opacity .45, and the lock throws a radial ground shadow.
- **Desktop only:** hover (raycast on disks and lock) raises the spacing `+0.3*hv`, lifts the lock 0.35 and scales it ×1.12. A click spins the stack one turn and "clanks" the shackle.

## 5. Home contact objects (`initContact` in Home)
- **Camera:** fov 30 at z 15. Root scale `min(1.05, visW/9.4, visH/7.6)` (mobile and tablet use `visW/8.6`). Mouse rotation `(m.y*.12k, m.x*.2k)`.
- **Objects** (rest pose / entrance offset / phase):
  - **App-icon tile:** 2.6×2.6×0.36, R 0.62, at (−2.6, 2.0, 0.4), rotation (0.12, 0.4, −0.1), from (−3, 3, −5). Its texture is `android-chrome-512x512.png` drawn at 448px on a white 640 canvas.
  - **Message bubble:** 5.6×2.3×0.2, `#5a69e9` clearcoat, face from `drawBubble`. At (0.7, 0.1, 0), rotation (−0.04, −0.3, 0.03), from (5, −1, −4).
  - **Typing bubble:** 2.1×1.0×0.16, white, three `#7380ec` dots that pulse `0.8 + 0.3*max(0, sin(t*(3.2+hb*2) - i*0.9))`. At (−2.0, −2.2, 0.9), rotation (0.05, 0.28, 0.02), from (−2, −5, −3).
- **Entrance:** `q=clamp((innerHeight-top)/(innerHeight*0.8))`, `e=easeOutCubic((q*1.4 - i*0.12)/0.6)`. Idle float `sin(t*.9+ph)*.12k`.
- **Desktop only:** hover on an object (`hv` 0→1, lerp .12) moves it +1.3 in z, flattens its rotation and scales it ×1.12. Hovering the "Conversar por WhatsApp" CTA does the same to the bubble. Clicking any object opens waHref.

## 6. Producto opening gather (`initThree` in Producto)
- **Camera:** fov 34. Environment from `makeEnv`.
- **Objects:**
  - Cards come from `slab` with canvas faces. Paper comes from a curled `PlaneGeometry(…,32,8)` with emissive map .35.
  - Desktop has **8**: three sheets (`drawSheet(0..2)`), attendance list, phone, report card, two sticky notes. Positions and rotations are in `defs`.
  - Mobile and tablet have **4**. See RESPONSIVE.
- **Progress** `p` (0–1 over the section, smoothed `1-0.86^(dt*60)`):
  - Camera keyframes `K = [t, cameraPos, lookAt]`, linearly segmented with smoothstep inside each segment. `cameraPos = lookAt + (cam-lookAt)/fit`, plus mouse offset and an entrance push-in of `(1-ent)*6`.
  - **Desktop K:**
    ```
    [0,[0,0,22],[0,0,0]] [0.1,[0,0,19],[0,0,0]] [0.24,[-4.2,0.6,9.5],[-7,0,-1]] [0.34,[-4,0.5,9.2],[-7,0,-1]]
    [0.42,[1.3,0.4,10],[-0.4,0,0.2]] [0.5,[1.5,0.3,9.6],[-0.4,0,0.2]] [0.58,[5.6,-0.4,7],[4.2,-0.9,-2]] [0.65,[5.8,-0.5,6.6],[4.2,-0.9,-2]]
    [0.75,[0,0,17],[0,0,0]] [0.9,[0,0,12.5],[0,0,0]] [1,[0,0,12],[0,0,0]]
    ```
    `fit = max(0.55, min(1, aspect/1.7))`. The record target `RT=[2.6,0.1,0]` and rotation `[-0.06, -0.2, 0]` apply when aspect > 1.1.
  - **Mobile K:**
    ```
    [0,[0,2.6,27],[0,2.6,0]] [0.1,[0,2.1,24],[0,2.1,0]] [0.24,[-1.1,1.1,14],[-1.1,1.1,0]] [0.34,[-1,1,13.5],[-1.1,1.1,0]]
    [0.42,[0.15,-1,16.5],[0.15,-1,0]] [0.5,[0.25,-1.1,16],[0.15,-1,0]] [0.58,[1.2,-4,10.5],[1.2,-4,-1]] [0.65,[1.3,-4.1,10],[1.2,-4,-1]]
    [0.75,[0,-1,22],[0,-1,0]] [0.9,[0,-1.3,19],[0,-1.3,0]] [1,[0,-1.3,18.5],[0,-1.3,0]]
    ```
    `fit = min(1, aspect/0.46)`, `RT=[0,0.9,0]`.
  - **Tablet K:** the same as mobile, except `[0.75,[0,-1,19]] [0.9,[0,-1.3,12]] [1,[0,-1.3,11.5]]`. `fit=0.84`, and both camera and look-at are offset −0.9 in y.
- **Gather:** object i flies to RT over `a = smooth((p - 0.72 - i*0.012)/0.13)`, scaled to fit 4.8×3.2. All objects fade out over `p` 0.84→0.89 while the record card (`drawRecord`, 4.8×3.2) fades in over 0.83→0.89.
  - On exit (scrolling past), the sticky layer translates down `ex*50vh`, scales ×(1 − .06·e²) and fades.
- **Spread at the start:** positions ×1.3 and z −3 at p=0, easing to rest by p=0.14.
- **Chapter windows** (opacity = ramp-in·ramp-out over 0.03): c0 `[0.20,0.36]`, c1 `[0.38,0.52]`, c2 `[0.54,0.66]`, c3 `[0.89,1.5]`.
  - Headline lift is `smooth((p-0.025)/0.07)`: opacity 1−lift, `translateY(-lift*120px)`.
  - Desktop step rail: number switches at 0.37/0.53/0.76, fill `(p-0.15)/0.8`, opacity `(p-0.15)/0.04`.
- **Desktop only:** hover raycast on objects and record (lift `h*0.9` z, ×1.1, flattens rotation).

## 7. Producto portals (`initPortal` + `portalDom`)
- **Scene:** a sticky full-viewport WebGL layer behind the panels. Camera fov 30 at z 14.
- **Objects:**
  - **Database:** three white cylinders with `#7380ec` emissive bands and LEDs.
  - **Gradebook:** `#5a69e9` covers, cream page block, front texture `drawGradebook`.
  - **Student phone:** dark slab, `drawStudentPhone`.
- **Placement:** each object follows its DOM anchor (`an0`, `an1`, `an2`; the intro uses `an3`). Positions are converted from screen to world with `toW()`.
  - In the intro, all three cluster around `an3` with offsets `CL`. As panel 01 approaches (`f = smooth(-dIntro/0.95)`), object 0 travels to its anchor. Objects 1 and 2 jump to theirs once the intro has passed.
  - Visibility and scale gate `g`: desktop uses the panel distance `pn.d`. Mobile and tablet use the anchor distance. Both are in RESPONSIVE.
  - Rotation reacts to the panel's distance from center (`d*0.45k`, `d*0.6k`) plus an idle sway.
- **DOM parallax:** text block `translateY(d*H*0.08k)`. UI block rises 90px and fades in as it enters, with parallax `-d*H*0.05k`. Each `[data-rv]` line rises 36px over 28% of the viewport. The intro headline lines are masked rises.
- **Right rail (desktop):** current panel 01–03, fill from panel 1 to panel 3.

## 8. Piloto clipboard (`initThree` in Piloto)
- **Camera:** fov 30. z = `max(12.5, 2.9/(tan(15°)*aspect))` so the board always fits.
- **Group:**
  - Board: `#5a69e9` slab 3.4×4.5×0.1, R 0.24.
  - Paper: 3.0×3.95, `drawForm`, a "Solicitud Piloto 2027" sheet with checkboxes and a signature.
  - Metal clip and hinge, and a pen (ink body, metal tip, brand cap).
  - Shadow plane.
- **Motion:** rotation `(-0.08 + sin(t*.32)*.07k, -0.38 + sin(t*.42)*.5k - (1-ent)*0.9, 0.04 + sin(t*.27)*.03k)`. The entrance runs 1800ms (cubic out) after a 350ms delay. The stage opacity fades 0→1 over 1400ms.
