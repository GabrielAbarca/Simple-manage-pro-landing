# Page specs

Every value below comes from the design files. When this document and a file disagree, **the file wins**. Copy is in the files and goes verbatim into `src/data/site.ts`. "D / T / M" means desktop / tablet / mobile. See `RESPONSIVE.md` for the full set of breakpoint deltas.

The shared reveal system (`data-rise`, `data-fade`, `data-rv`) is specified in `MOTION_AND_3D.md §1`. Headlines are always built as one masked line per visual line: `<span style="display:block;overflow:hidden;padding-bottom:.06em"><span data-rise style="display:block;transform:translateY(110%)">Line</span></span>`. Keep the explicit line breaks exactly as in the files.

---

## 1. Home `/`  (`Home.dc.html`)

### 1.1 Hero (pinned scroll scene)
- **Structure:** `section` `height:300vh`, containing a sticky child `top:0; height:100vh` (use `100svh` on M/T) with `overflow:hidden`.
- **Background glow:** an absolutely positioned circle, `80vw`, max 1100px, `radial-gradient(closest-side, rgba(115,128,236,.16), transparent)`, placed `right:-10vw; top:10vh`.
- **WebGL stage:** `position:absolute; inset:0; pointer-events:none`. Shows three "portal" slabs (admin, teacher, student screens) that fan out on scroll. See MOTION §3.
- **Intro overlay** (z 6): `background:#111e88`, white text, `padding:96px 4vw 32px` (M `88px 20px 28px`).
  - Headline "Hecho para / Costa Rica." with line 2 in `#b9b0ff`. Weight 800, `clamp(64px,11vw,210px)` (M `clamp(44px,13.5vw,72px)`), line-height .92, letter-spacing −.045em.
  - A bottom row holds 11 month ticks and a counter.
  - Each month tick: FEB MAR ABR MAY JUN JUL AGO SET OCT NOV DIC as 12px/600/.08em labels over a bar 40px wide (M 22px) × 2px, `rgba(255,255,255,.22)`, with a white fill scaled in X. Gap between ticks 14px (M 6px).
  - Counter "000"→"100": 800 weight, `clamp(96px,16vw,280px)` (M `clamp(80px,26vw,120px)`), line-height .78, tabular numbers.
  - A 3px progress bar at the very bottom: `#a78bfa` on `rgba(255,255,255,.12)`.
  - The timeline is in MOTION §2.
- **Headline block** (z 4).
  - D: `left:4vw`, vertically centered, `max-width:min(52rem,60vw)`, gap 28.
  - M/T: `left/right:20px` (T 40px), top-aligned with `padding-top:100px`, gap 20.
  - **H1** "Hecho para / Costa Rica." with line 2 in `#4455e6`. Weight 800, `clamp(56px,8.6vw,156px)` (M `clamp(44px,14vw,64px)`), line-height .92, letter-spacing −.05em.
  - **Lead** "Notas, asistencia, horarios y expedientes en un solo lugar. Un programa piloto a partir de febrero de 2027." D `clamp(16px,1.25vw,19px)`/1.6, M 16/1.55, T 18/1.6. Color `#667281`, `max-width:30rem`.
  - **CTAs:** Primary "Ver la demo" (DEMO_URL) and Outline "Conversar por WhatsApp" (waHref). Both 52px tall, 15px.
- **Fan title** (fades in during the fan-out): "Tres portales. / Un mismo registro." with line 2 in `#4455e6`. 800 weight, `clamp(40px,4.8vw,84px)`, line-height .95.
  - Position D `left:4vw; top:15vh`. M `left/right:20px; top:88px`, `clamp(30px,9vw,40px)`, line-height .98.
- **Three captions** that follow the slabs, projected from 3D (MOTION §3):
  - D: number 13px/700 `#4455e6`, then title 19px/700, then description 14px/1.5 `#667281`, inside a box `width:min(200px,18vw)`.
    - 01 "Consola de administración" / "Curso lectivo, secciones, horarios y matrícula."
    - 02 "Consola docente" / "Lecciones del día, libro de notas y asistencia."
    - 03 "Portal estudiantil" / "Notas por periodo, horario y asistencia."
  - **M/T: one line only:** the 13px number + 15px/700 title, `white-space:nowrap`, and no description.
- **Bottom cue** (D only): "Programa piloto · Febrero 2027" on the left and "Desplácese" + a 48×1px line on the right. 13px/500 `#627388`, `bottom:28px`. It is removed on M/T.

### 1.2 Security ("La seguridad nos importa")
- **Padding:** D `clamp(96px,16vh,180px) 4vw clamp(32px,6vh,72px)`; M `96px 20px 24px`.
- **Top row:** wraps, space-between, aligned to the end.
  - H2 "La seguridad / nos importa." with line 2 in `#4455e6`. D `clamp(56px,8.4vw,152px)`, M `clamp(44px,13vw,60px)`, line-height .92.
  - Right column, `max-width:20rem`: the paragraph "Cada colegio tiene su propia base de datos, cifrada en tránsito y en reposo.", then a Dark pill "Política de privacidad" + a 28px rule → PRIVACY_URL.
- **3D stage:** `height:clamp(380px,60vh,640px)` (M/T `clamp(340px,50vh,440px)`), `touch-action:pan-y`. It shows a stacked database of three clearcoat disks (`#5a69e9`, `#7380ec`, `#a78bfa`) on a white pedestal, with a padlock orbiting on an ellipse ring (MOTION §4).

### 1.3 Contact block (`#contacto`)
- **Outer padding:** D `clamp(32px,6vh,72px) 2vw clamp(64px,10vh,120px)`; M `24px 12px 56px`.
- **White card:** radius 48 (M/T 32), card shadow. Grid `repeat(auto-fit,minmax(min(100%,440px),1fr))` with gap 16 and padding 16 on D; one column with gap 8 and padding 8 on M/T.
- **Left half:**
  - H2 "¿Su colegio / podría ser parte / del piloto?" with line 3 in `#4455e6`. D `clamp(44px,5.2vw,96px)`, M `clamp(38px,11vw,52px)`, line-height .95.
  - CTAs: Primary 56px "Conversar por WhatsApp", Outline 56px "Escribir un correo" (mailto), and Text+rule "Ver la demo".
- **Right half: 3D stage.** `min-height:clamp(420px,64vh,680px)` (M/T 360px), radius 36 (M/T 24), `background:#f6f6f9`.
  - It holds an app-icon tile, a blue WhatsApp-style message bubble with the prefilled text, and a white "typing" bubble with three pulsing dots (MOTION §5).
  - **Desktop only:** hovering an object scales it and brings it forward, and clicking an object opens waHref. Hovering the WhatsApp CTA also lifts the bubble.

### 1.4 Footer
See README.

---

## 2. Producto `/producto`  (`Producto.dc.html`)

### 2.1 Opening scroll story (pinned)
- **Structure:** `section` `height:700vh` (M/T `520vh`), sticky `100vh` (`100svh` on M/T). Same radial glow, centered here, 110vw.
- **WebGL stage:** full-bleed. Eight scattered "problem" objects (three spreadsheets, a handwritten attendance list, a phone with a parents' WhatsApp group, a marked-up report card, two sticky notes) are visited by the camera, then gather into one SMP student record card. M/T use **4 objects** (MOTION §6).
- **Headline** (fades and lifts away at the start).
  - D: centered vertically, `left/right:4vw`, gap 28. M: top-aligned at `padding-top:100px`, `left/right:20px` (T 40px), gap 18.
  - H1 "Del cierre de periodo / a un solo expediente." with line 2 in `#4455e6`. D `clamp(48px,7.4vw,132px)`, M `clamp(36px,11vw,52px)`.
  - Lead "Notas, asistencia e informes reunidos en el expediente de cada estudiante."
- **Four chapter captions**, crossfaded by scroll progress (MOTION §6).
  - D: `left:4vw; bottom:12vh; width:min(30rem,84vw)`. M/T: `left/right:20px` (T 40px), `bottom:calc(40px + env(safe-area-inset-bottom))`.
  - Each caption: an eyebrow (13px/600/.1em uppercase `#4455e6` + 8px `#7380ec` dot), then a statement at D `clamp(28px,2.8vw,46px)` or M `clamp(24px,7vw,30px)`, 700 weight, line-height 1.1.
    - "01 · Las notas": "Cada docente lleva su propia hoja de cálculo."
    - "02 · La asistencia": "La asistencia se pasa en papel. Las consultas llegan por WhatsApp."
    - "03 · El cierre": "Al cierre de periodo, los informes se arman a mano."
    - "04 · Simple Manage Pro": "Con SMP, todo queda en un solo expediente." + CTAs Primary "Ver la demo" and Outline "Conversar por WhatsApp".
- **M/T only:** a bottom legibility gradient, `height:44%`, `linear-gradient(rgba(246,246,249,0), rgba(246,246,249,.92) 45%, #f6f6f9)`, z 4, `pointer-events:none`.
- **Step rail (D only):** `right:4vw`, vertically centered. Current step "01–04" (14px/700) over a 2×160px track with a `#4455e6` fill `scaleY(progress)`, then "04". It is hidden on M/T.
- **"Desplácese" cue:** bottom right, fades out over the first 4% of progress.

### 2.2 Portales (three portals with live UI)
- **Structure:** a relative section with a 28vh fade-in gradient on top. A sticky full-viewport WebGL layer sits behind the content (`margin-bottom:-100vh; pointer-events:none`), and the content scrolls over it. The section also has a desktop-only right rail (01–03) like the step rail above.
- **Intro panel.**
  - D: `min-height:100vh`, 2-column grid `6fr/5fr`, padding `140px calc(4vw+64px) 120px 4vw`. M/T: stacked, padding `96px 20px 24px`.
  - Eyebrow "Cómo funciona".
  - H2 "Tres portales. / Un mismo registro." D `clamp(44px,6vw,108px)`, M `clamp(40px,12vw,56px)`.
  - Paragraph "Dirección, docentes y estudiantes trabajan sobre la misma base de datos. Cada rol ve solo lo que le corresponde."
  - A 3D anchor column: D `height:56vh`, M/T `min(48vh,380px)` (T `min(44vh,460px)`).
- **Panel 01 Administración / 02 Docente / 03 Estudiante.**
  - D: `min-height:100vh`, grid `4fr/6fr`, padding `120px calc(4vw+64px) 120px 4vw`. M/T: stacked, padding `64px 20px`, gap 20.
  - **Order on M/T:** text block → a 3D object slot (`height:230px` M, `340px` T) → live UI.
  - Text block: eyebrow "0N · Name", H3 at D `clamp(32px,3.4vw,60px)` or M `clamp(28px,8.4vw,36px)` 800, then three capability rows (icon 20px `#4455e6` + 16px/500 text, 1px hairline rules).
  - **Live UI 01 (Administración):**
    - Card "Curso lectivo 2026" with Badge "I Periodo activo" (primary) / "II Periodo activo" (success), and "Nota mínima 70".
    - Button "Activar II Periodo" / "Activar I Periodo" toggles the period and shows the toast "Guardado.".
    - Three StatCards: Estudiantes 412 (school), Secciones 14 (category, success), Docentes 28 (co_present, warning). D 3 columns; M/T `repeat(auto-fit,minmax(140px,1fr))`.
    - DataTable in a Card: D columns Sección / Nivel / Docente guía / Estudiantes; **M/T drop "Docente guía" and label the count "Estud."**. Rows: 7-1 Sétimo Marta Solís 31 · 8-2 Octavo José Arias 29 · 10-2 Décimo Laura Mora 28 · 12-1 Duodécimo Andrés Quesada 26.
  - **Live UI 02 (Docente):**
    - TodayCard: 07:00–08:20, Matemáticas, "10-2 · Aula 12", accent `#7380ec`.
    - Card "Asistencia · 10-2" with a live summary (e.g. "2 presentes · 1 ausente · 1 tardía").
    - Four student rows (SA Sofía Alvarado, MB Mateo Brenes, VC Valeria Castro, DF Diego Fallas). Each has a 36px gradient avatar (`135deg #7380ec → #a78bfa`) and **Spanish attendance pills: Presente / Ausente / Tardía**, initial states present, present, absent, late.
    - Pill spec: `padding:.4rem .8rem; font:600 .78rem Poppins; border-radius:var(--border-radius-1)`.
      - Inactive: `background:var(--color-background); color:var(--color-dark-variant); border:1px solid var(--border-control)`.
      - Active: background and border take `--color-success-fill` / `--color-danger-fill` / `--color-warning-fill`, text `#fff`.
      - `aria-pressed`. M/T `min-height:44px`.
    - Button "Guardar asistencia" (icon `save`) → toast "Guardado.".
  - **Live UI 03 (Estudiante):**
    - Card with header: 44px avatar "YR", "Yendry Rojas Vargas", "Duodécimo · 12-1", and two small buttons "I Periodo" / "II Periodo" (active = primary, inactive = ghost).
    - ProgressRing 92px showing attendance %, "PROMEDIO DEL PERIODO" micro-label, a 2.2rem/800 average, and an attendance line.
    - Five grade rows (Matemáticas, Español, Química, Física, Inglés): GradeBar + value, plus StatusBadge "Aprobado" on **D only**. Row grid: D `minmax(0,9rem) 1fr 2.4rem auto`; M/T `minmax(0,7.5rem) 1fr 2.2rem`.
    - Data:
      - I Periodo: grades 88, 91, 79, 84, 95; average "87,4"; ring 96; "96 % de asistencia · 2 ausencias".
      - II Periodo: grades 82, 93, 85, 88, 96; average "88,8"; ring 98; "98 % de asistencia · 1 ausencia".
    - GradeBar width: D `clamp(60, innerWidth*0.1, 220)`, M `clamp(80, innerWidth*0.3, 180)`, T `clamp(160, innerWidth*0.42, 420)`.
- **End panel.** D `min-height:92vh`, padding `120px 8vw 160px 4vw`; M/T `72px 20px 96px`.
  - H2 "Recorra los tres portales" + `#4455e6` "con datos de ejemplo.". D `clamp(40px,5vw,92px)`, M `clamp(34px,10vw,48px)`.
  - Paragraph "La demo abre con un colegio ficticio. Nada de lo que haga se guarda."
  - CTAs Primary 56px "Probar demo" and Outline 56px "Escribir por WhatsApp". The WhatsApp message here reads "…quisiera conocer más sobre Simple Manage Pro."

---

## 3. Piloto `/piloto`  (`Piloto.dc.html`)

### 3.1 Hero
- `min-height:100vh` (M `100svh`). Padding D `128px 4vw 40px`, M `100px 20px 32px`. Column, space-between, `overflow:hidden`. Glow bottom-right.
- **H1** "Piloto / 2027." with line 2 in `#4455e6`. D `clamp(96px,19vw,360px)`, M `clamp(72px,24vw,110px)`, line-height .84–.86, letter-spacing −.06em.
- **3D stage:** a clipboard holding a "Solicitud Piloto 2027" sheet and a pen (MOTION §7).
  - D: `right:2vw; top:13vh; bottom:18vh; width:min(42vw,680px)`.
  - M/T: `left:0; right:0; top:clamp(250px,34vh,300px); bottom:clamp(230px,30vh,270px)`.
  - Fades in over 1400ms after a 350ms delay.
- **Bottom row:** paragraph "Un curso lectivo completo con Simple Manage Pro, de febrero a diciembre, junto al equipo que lo construye." (D `clamp(17px,1.4vw,21px)`, `#4d5566`), then Primary 56px "Postular mi colegio" + a 28px rule → `#postular`, and the "Desplácese" cue.
  - M: the CTA becomes full width and the cue goes below it. T: they share a row with space-between.

### 3.2 Para quién es
- Padding D `clamp(96px,16vh,180px) 4vw`, M `72px 20px`. D is a 2-column auto-fit grid with `minmax(min(100%,420px),1fr)`; M/T is one column.
- Eyebrow "Para quién es". H2 "Colegios que / quieren dejar / las hojas sueltas." (D `clamp(44px,5.6vw,100px)`, M `clamp(34px,10vw,46px)`).
- Three numbered rows (01–03, grid `3rem 1fr`, M `2.2rem 1fr`, 1px rules), each with a title and a description:
  - "Colegios de Costa Rica" / "De sétimo a undécimo o duodécimo, públicos o privados."
  - "Una dirección que lo impulse" / "La decisión de usar SMP durante el curso lectivo parte de la dirección."
  - "Docentes con acceso a internet" / "Desde computadora o celular, en el colegio o en la casa."

### 3.3 Qué recibe / Qué pedimos
- One white card (radius 48, M/T 32) with two panels. The right panel is inset, radius 36 (M/T 24), `background:#f6f6f9`. D: auto-fit columns `minmax(min(100%,440px),1fr)`; M/T: stacked.
- **"Qué recibe el colegio"**: H2 "Todo listo / desde febrero." Icon rows:
  - calendar_month "Curso lectivo 2027 configurado"
  - person_add "Matrícula importada"
  - badge "Cuentas para dirección, docentes y estudiantes"
  - support_agent "Acompañamiento durante el curso lectivo"
- **"Qué pedimos a cambio"**: H2 "Usarlo y / contarnos." Icon rows:
  - fact_check "Notas y asistencia en SMP"
  - history_edu "Comentarios sobre lo que funciona y lo que no"
  - person "Una persona de contacto en la dirección"

### 3.4 Calendario
- Eyebrow "Calendario del piloto". H2 "Un curso lectivo, / de punta a punta." with line 2 in `#4455e6`.
- **Desktop:**
  - Header row: H2 on the left and a giant ghost month label on the right (`clamp(56px,min(13vw,20vh),240px)`, `#dfe2fa`, line-height .78) that ticks FEB→DIC.
  - An 11-column month grid (label `clamp(10px,0.9vw,13px)` + 3px bar).
  - Four milestone cards in `repeat(auto-fit,minmax(min(100%,150px),1fr))`: white, radius 24, small shadow, padding `clamp(16px,2.4vh,24px)`.
- **Mobile/Tablet: a vertical timeline.**
  - `padding-left:36px`. A 2px track sits at `left:7px` from 28px to 28px inset, with a `#4455e6` fill `scaleY`.
  - The four milestone cards stack with gap 14, padding 20. Each has a 16px dot at `left:-36px; top:24px` (`#c9cdf5` → `#4455e6`).
- **Milestones** (range / title / body):
  - Febrero / Arranque / "Curso lectivo configurado, matrícula cargada y cuentas entregadas."
  - Feb – Jun / I Periodo / "Asistencia y notas en SMP desde la primera lección."
  - Jul – Nov / II Periodo / "Ajustes a partir de lo aprendido en el primer periodo."
  - Diciembre / Cierre / "Informes finales y balance del piloto con la dirección."
- The animation plays once when the section top passes 60% of the viewport (MOTION §1.3).

### 3.5 Postular (`#postular`)
- A white card that holds two parts. D is an auto-fit 2-column grid; M/T is one column.
- **Left part:** H2 "Postule a / su colegio / para 2027.", paragraph "¿Dudas antes de postular? Escríbanos por el medio que prefiera.", then CTAs WhatsApp (Primary), "Escribir un correo" (Outline) and "Ver la demo" (Text+rule).
- **Right part:** the **application form**, or the confirmation panel after sending. The full spec is in `FORM_RESEND.md`.

---

## 4. Nosotros `/nosotros`  (`Nosotros.dc.html`)
- **Hero:**
  - D `min-height:100vh`, padding `128px 4vw 40px`. M `min-height:88svh`, padding `104px 20px 32px`.
  - H1 "Somos un software / escolar pensado / para su colegio." with line 3 in `#4455e6`. D `clamp(52px,8.4vw,164px)`, M `clamp(38px,11.5vw,54px)`.
  - "Desplácese" cue at the bottom right. Glow bottom-left.
- **Misión y visión card** (white, radius 48, M/T 32, padding D `clamp(28px,4.5vw,80px)`, M `28px 20px`):
  - **Tab bar:** `role=tablist` with two `role=tab` buttons, "Misión" and "Visión". D `clamp(22px,2vw,32px)`, M 22px, 700. Selected `#363949`, unselected `#627388`.
    - A 3px track runs underneath, with a `#4455e6` indicator that slides `translateX` over 600ms `cubic-bezier(.65,0,.35,1)`.
  - **Pager:** "01 / 02" (`aria-live`) plus DS Buttons "Anterior" / "Siguiente" (chevron icons). The disabled one renders as ghost. ArrowLeft and ArrowRight keys switch tabs.
  - **Panels:** a 200%-wide track that slides `-50%` over 700ms. The inactive panel sits at opacity .15 (600ms).
    - Each panel: a ghost numeral "01"/"02" (D `clamp(56px,6vw,108px)`, M 48px, `#dfe2fa`), then the text (D `clamp(21px,2vw,32px)`/1.48 500, M 18px/1.55).
    - Mission and vision copy is verbatim in the file.
- **Nuestra historia:**
  - Eyebrow "Nuestra historia". H2 "Empezó como un proyecto / de feria científica." (D `clamp(44px,5.6vw,100px)`, M `clamp(34px,10vw,46px)`).
  - A paragraph that contains a link "las tres consolas del sistema" → `/producto` (underlined, offset 3px).
  - **Timeline** `<ol>`: D is 4 columns (≥880px container), otherwise 2; M is 1 column with gap 36.
    - Each item: a 2px track with a fill and a 12px dot, the year (D `clamp(36px,3.2vw,56px)`, M 40px, `#4455e6`), a title, and a body.
    - Items: 2024 / 2025 / 2026 / 2027 "Piloto 2027". Copy is in the file.
    - The play-once sequence is in MOTION §1.4.
- **Fundador card:** eyebrow "Fundador", 88–128px gradient avatar "GZ" (M 72px), H2 "Gabriel Zelaya", "FOUNDER & CEO" micro-label, and a bio paragraph.

## 5. Contacto `/contacto`  (`Contacto.dc.html`)
- **Hero:**
  - Padding D `clamp(140px,20vh,200px) 4vw clamp(56px,9vh,96px)`, M `112px 20px 40px`.
  - H1 "Hablemos de / su colegio." (D `clamp(52px,7.4vw,132px)`, M `clamp(40px,12.5vw,58px)`) and the paragraph "Escríbanos por el medio que prefiera. Respondemos en las próximas 24 horas hábiles."
- **Three cards:**
  - Layout: D 3 columns, M 1 column with gap 12, **T 2 columns with the third card spanning both** (`grid-column:1/-1`).
  - Card: white, radius 36 (M/T 28), padding D `clamp(28px,2.6vw,44px)` / M `24px 20px`, gap 28 (M 20).
  - Each card: a 56px gradient circle with a white icon + number 01–03, an H2 (D `clamp(24px,1.9vw,30px)`, M 24px), a description, a ruled value block (micro-label + big value), and actions.
  - 01 **WhatsApp**: "Para consultas rápidas o coordinar una llamada." Value `+506 7184-8300` (`tel:+50671848300`). Actions: Primary "Abrir WhatsApp" (message ends "…sobre Simple Manage Pro.") and DS ghost Button "Copiar" (`content_copy`).
  - 02 **Correo electrónico**: "Para consultas con más detalle o documentos adjuntos." Value `contact@gzelaya.com`. Actions: Primary "Escribir un correo" (`mailto:…?subject=Consulta sobre Simple Manage Pro`) and "Copiar".
  - 03 **Piloto 2027**: "Para postular a su colegio al curso lectivo 2027." Value "Postulación". Action: Primary "Llenar el formulario" + rule → `/piloto#postular`.
- **Copy behavior:** use `navigator.clipboard.writeText`, falling back to `execCommand('copy')`. Toast "Copiado." on success, or "No se pudo copiar. Selecciónelo manualmente." on failure, for 2200ms.
