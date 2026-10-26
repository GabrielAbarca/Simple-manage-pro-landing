# Simple Manage Pro — Design System

Simple Manage Pro (SMP) is a school management platform built for Costa Rican
secondary schools (*colegios*). One deployment serves three audiences through
three surfaces that share a single shell:

| Surface | Who uses it | What it does |
| --- | --- | --- |
| **Student portal** (`index.html`) | Students | Dashboard, grades by period, weekly schedule, teachers, attendance history, school events |
| **Teacher console** (`teacher.html`) | Teachers | Today's periods, My Classes, and a per-class workspace: roster, gradebook, conduct, attendance, schedule |
| **Admin console** (`admin.html`) | School directors | Academic structure (years, periods, grade levels, sections, subjects, rooms), teachers and assignments, students and CSV enrollment, schedules, user accounts, school profile |
| **Login** (`login.html`) | Everyone | Shared sign-in, sign-up, password recovery, and the public demo entry point |

The product is plain JavaScript + Vite over a 27-table PostgreSQL schema on
Supabase, with Row Level Security enforcing role boundaries in the database.
The domain model follows the Costa Rican *curso lectivo*: a February-to-December
year split into two *periodos*, with a school-configurable passing grade (MEP
sets 70 for III ciclo and Educación Diversificada, 65 for I–II ciclo).

## Sources this system was built from

- **GitHub — product:** https://github.com/GabrielAbarca/Simple-Manage-Pro-Software (branch `main`) — the source of every token, component and screen here.
- **GitHub — landing page:** https://github.com/GabrielAbarca/Simple-manage-pro-landing (referenced in the brief; not read for this build).
- **Attached codebase:** `src/` — `src/css/style/*` (tokens, shell, shared chrome), `src/css/teacher/*`, `src/css/admin.css`, `src/css/login.css`, `src/js/views/*`, `src/js/i18n/en/*`, `src/icons/icons.svg`.
- **Live demo:** https://demo.simplemanagepro.com · author: Gabriel Zelaya, https://gzelaya.com

Read those repositories directly if you need more than this system captures —
the CSS in `src/css/` carries long comments explaining *why* each value is what
it is, and they are worth reading before changing anything.

---

## CONTENT FUNDAMENTALS

**Voice.** Plain, declarative, administrative. The product explains the system,
never sells it: *"The school's management system. Grades, attendance, schedules
and records in one place."* Nothing is exclamatory and nothing is playful.

**Person.** Mostly impersonal noun phrases for labels ("Grading Period:",
"Total enrollment", "Attendance this month"). Second person only when
addressing the user's own state or action: *"You have no classes assigned this
school year."*, *"You appear to be offline."*, *"Nothing you do is saved."*
First person is never used; the system does not say "we" — except in one
recovery string, *"We couldn't load this section. Check your connection."*

**Casing.** Title Case for nav items, headings and buttons ("My Classes",
"Add Student", "Post grades" — note sentence case creeps into secondary
actions). UPPERCASE with 0.04em tracking for table heads and form labels
("SUBJECT", "EMAIL ADDRESS"). Sentence case for all body copy, hints and
error messages.

**Punctuation.** Full sentences end in a period, including toasts: "Saved.",
"Deleted.", "No discipline records." Fragments and labels don't. Em dashes
appear in empty states as a joining pause: *"No classes today — it's the
weekend."* An ellipsis marks work in progress: "Loading…", "Search this
roster…", "Loading your day…".

**Errors.** Name what happened, then what to do, in one or two short sentences:
*"Incorrect email or password. Please try again."* · *"Too many attempts.
Please wait a moment before trying again."* · *"This reset link has expired or
was already used. Request a new one below."* Never blame the user, never expose
a status code.

**Empty states.** State the absence plainly and, where useful, say who can fix
it: *"No students in this section."* · *"No active school year yet, so there is
nothing to show. An admin can activate one from the admin console."*

**Numbers and pluralisation.** Counts are always spelled with their noun and
pluralised properly through the i18n layer ("{count} section" / "{count}
sections"). Summary lines join facts with a middle dot: *"2026 · 4 sections ·
107 students"*.

**Bilingual by construction.** Every string lives in `src/js/i18n/{en,es}` —
Spanish is the default for school deployments, English for the demo. Domain
nouns stay in Spanish even in English copy (*Cédula*, *periodo*, *curso
lectivo*, subject names like *Matemáticas*). Keep copy short: Spanish runs
~20% longer and the layout is fixed-width in places.

**Emoji.** Not used in the product UI at all. They appear only in the
repository README's section headings. Do not put emoji in an SMP interface.

---

## VISUAL FOUNDATIONS

**The vibe.** A calm administrative dashboard: a very light lilac-grey page,
big white cards with generous 2rem corners floating on wide soft shadows,
one indigo-periwinkle accent, and colour used almost entirely to encode state.
Density is moderate — tables are airy (2.8rem rows), cards are padded 1.8rem.
Nothing is loud except the login panel.

**Colour.** One brand hue, `#7380ec` (periwinkle), with a violet accent
`#a78bfa` and a deep `#111e88` used only in the login gradient. Status is
carried by four hues: success mint `#41f1b6`, danger coral `#ff7782`, warning
amber `#ffbb55`, plus cyan `#0891b2` for informational and orange `#f97316` for
suspensions. The critical rule: **brand hues are for fills, never for text.**
Each hue has a `-text` sibling darkened until it clears 4.5:1 on all four
backgrounds it can meet (card, page, and its own 15% tint over each), and a
`-fill` sibling deep enough to carry white text. Dark mode brightens the `-text`
shades rather than darkening them, and leaves `-fill` alone.

**Backgrounds.** Flat only. Page `#f6f6f9`, cards `#fff`. No photography, no
illustration, no texture, no pattern anywhere in the product. Gradients exist
in exactly three places: the 135° brand gradient on avatars and the login
submit button, the 90° version as a 4px rule across the top of a teacher card,
and the three-stop login panel. Nothing else is gradient-filled — resist adding
any.

**Type.** Poppins, one family, everywhere, weights 400–800. The root size is
clamped `clamp(12.5px, 12px + 0.25vw, 14px)`, so every rem value scales with the
viewport. h1 800/1.8rem, h2 700/1.4rem, h3–h4 600/0.82rem, body 0.92rem.
Small-caps-style micro-labels (0.72–0.78rem, 600, uppercase, 0.04em) mark table
heads and form labels. Line height is default except body blocks at 1.6.

**Layout.** A CSS grid app shell: `14rem | minmax(0,1fr) | 23rem` at 96% width
with a `--space-4` gap. The sidebar is full-height and sticky; `main` starts
3rem down; the right panel starts 2rem down. The admin console drops the third
column. Cards sit in `repeat(auto-fill, minmax(250–260px, 1fr))` grids; stat
cards use `auto-fit, minmax(200px, 1fr)`.

**Corner radii.** 0.4rem buttons and toasts · 0.8rem inputs and selects ·
1.2rem badge pills · **2rem cards** (the signature). Avatars and status dots are
full circles.

**Cards.** White, 2rem radius, 1.8rem padding, no border, and `0 2rem 3rem` of
a lilac tint for shadow. On hover a static card's shadow **flattens to none**
rather than deepening — that is the house move. Only a genuinely clickable card
lifts, by exactly `-2px`, and picks up `--shadow-md`.

**Shadows.** Three tints, all built on `--color-light`, so they follow the
theme automatically: `sm 0 .4rem 1rem`, `md 0 1rem 2rem`, and the default
`0 2rem 3rem`. There are no inner shadows in the system.

**Borders.** Split by role. Decorative hairlines (table rules, card dividers)
use the `--color-light` tint. Anything a user must identify as a control uses
the solid `--border-control` (`#627388`), because no alpha of the tint can reach
3:1. Accent rails are 3px (schedule entries, absence chips, toasts) or 6px
(class cards, today cards, the active sidebar row).

**Hover and press.** Filled buttons drop to 0.9 opacity — never a colour
change. Ghost and icon buttons tint to the page background. Clickable cards
translate `-2px`. Rows tint: `--color-light` when the row is read-only (a
scanning aid) and `--color-background` when clicking it opens something. The
login submit button is the one element that presses back down to 0 with a
shallower shadow. There are no scale transforms in the product.

**Focus.** One ring everywhere: `0 0 0 3px` of the primary tint plus a primary
border on form controls; a 2px `--color-primary-text` outline with 3px offset on
cards and non-form targets. Outline is always *replaced*, never just removed.

**Motion.** Four durations by purpose — 100ms hover/toggle, 200ms press,
300ms modal/dropdown, 400ms drawer. Easing is `cubic-bezier(.16,1,.3,1)` in and
`cubic-bezier(.65,0,.35,1)` for movement. Entrances are short translate-plus-fade
(`fadeIn` 10px/350ms for views, `cardReveal` 24px/500ms for the auth card,
`toast-in` 12px/250ms). Nothing bounces, nothing springs, nothing loops except
the login panel's floating circles and the submit spinner. A saved table row
outlines in success green and fades over 2.5s — and honours
`prefers-reduced-motion`.

**Transparency and blur.** Sparse. 15% hue tints behind badges, an 18% lilac
tint for hairlines and shadows, a 50% black modal overlay, a 28% black scrim
over the login gradient, and one `backdrop-filter: blur(4px)` on the login
feature rows. Nothing else is frosted.

**Imagery.** There is none — no photography, no illustration, no stock. The
only raster assets in the product are the app icon and favicons. Where a
picture would normally go, SMP puts a gradient circle with a glyph in it.

**Accessibility is a design constraint here, not a pass.** Every control has a
44px minimum target, every text shade was computed against the worst of the
four backgrounds it can land on, and `color-scheme` is declared so the browser
draws its own date picker, spinners and option lists in the right theme.

---

## ICONOGRAPHY

- **One sprite, copied in:** `assets/icons.svg` — ~80 `<symbol>` elements,
  Material Symbols outlined exported as paths on a `0 -960 960 960` viewBox,
  filled with `currentColor`. This is the product's own file, copied verbatim;
  no icon font is loaded and no icon CDN is used.
- **How it's used:** `<span class="material-symbols-outlined"><svg aria-hidden="true"><use href="#icon-school"></use></svg></span>`
  in the product, where the sprite is inlined into the page. Here, load
  `assets/icons.js` once per page — it publishes the same 81 symbols as
  `window.SMP_ICONS` — and the `Icon` component paints them inline. (An
  external `<use href="icons.svg#icon-…">` does not resolve when the page is
  served from a different document context, which is why the map exists;
  `window.SMP_ICON_SPRITE` is still honoured as a fallback.) Every symbol
  shares the `0 -960 960 960` viewBox.
- **Sizes:** 1.1rem in dense rows · 1.2rem in buttons · 1.5–1.6rem in stat tiles
  and the sidebar · 1.8–2rem inside avatar circles · 2.2–2.4rem in empty states.
- **Colour:** icons inherit `currentColor` and take the muted or body text
  shade; a glyph on a brand fill is `#fff`. Status glyphs use the `-text` shade.
- **Emoji and unicode:** never used as iconography. One Spanish-language
  string contains a "✔" character ("No discipline records. ✔"); that is the
  only glyph-as-text in the product.
- **Do not draw new icons.** If a needed symbol is missing, take it from
  Material Symbols (outlined, weight 400, 24dp, grade 0) and add it to the
  sprite so it matches.

**Brand mark.** The product has **no logotype file**. The mark is a typographic
lockup — `SIMPLE` in heading ink beside `MANAGE PRO` in the danger shade — set
next to the 32px app icon (`assets/apple-touch-icon.png`). On the login panel
the second word becomes `#ffc2c7` so it stays legible over the gradient. The
repository README embeds a rendered logo image on GitHub's CDN; it is not in
the repo tree, so it was not copied. **Ask Gabriel for the logo source if a
real mark is needed** — do not reconstruct one.

---

## Index

| Path | What's in it |
| --- | --- |
| `styles.css` | The entry point — `@import` lines only |
| `tokens/` | `fonts.css` (Poppins @font-face), `colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `motion.css`, `base.css` |
| `fonts/` | Poppins woff2 binaries, 400–800, latin + latin-ext (copied from the product) |
| `assets/` | `icons.svg` sprite, `icons.js` (the same symbols as a JS map), app icon, favicons |
| `guidelines/` | 17 specimen cards — colour, type, spacing, elevation, motion, brand |
| `components/` | The React primitives (below) |
| `ui_kits/` | Full-screen recreations of the four product surfaces |
| `SKILL.md` | Agent-skill entry point for use outside this workspace |
| `github.md` | Upstream repo association and screen map |

### Components

**core** — `Button`, `IconButton`, `Badge`, `StatusBadge`, `Card`, `Icon`
**forms** — `Input`, `Select`, `Checkbox`
**feedback** — `Modal`, `Toast`, `EmptyState`, `Skeleton`
**data** — `StatCard`, `DataTable`, `ClassCard`, `TodayCard`, `TeacherCard`,
`AttendanceStatusGroup`, `GradeBar`, `ProgressRing`
**navigation** — `SidebarNav`, `ThemeToggler`

Each has a `.d.ts` props contract and a `.prompt.md` with a usage example.
Every family above exists in the product; the inventory was taken from the
CSS component domains in `src/css/style/*`, `src/css/teacher/*` and
`admin.css`, not invented.

**Intentional additions**

- `Icon` — a wrapper over the existing sprite. The product inlines
  `<svg><use href="#icon-…"></svg>` by hand in every template; a component is
  the only sane way to do that from React.
- `StatusBadge` — the product writes `.status-present`, `.status-absent` etc. as
  separate CSS classes. This is the same vocabulary behind one prop.

### UI kits

| Kit | Screens |
| --- | --- |
| `ui_kits/student-portal/` | Dashboard, Grades, Schedule, Teachers, Attendance, Events, Settings |
| `ui_kits/teacher-console/` | Today, My Classes, Subjects, Settings, and the class workspace (Roster · Gradebook · Conduct · Attendance · Schedule) |
| `ui_kits/admin-console/` | Overview, Year & Periods, Grades & Sections, Subjects, Schedules, Teachers, Students & Enrollment, Accounts, Settings |
| `ui_kits/login/` | Sign in / sign up / forgot password |

All four are click-through: nav switches views, dialogs open and save, toasts
appear, attendance pills respond, and the theme toggler flips the whole page.

### Known gaps

- **No logotype.** Only the app icon exists in the repo (see Iconography).
- **Not recreated:** the legal pages (`privacy.html`, `terms.html`), the 404
  page, the student drawer's print progress report, and the mobile layout —
  the product's own roadmap still lists "Mobile-responsive layout" as open, so
  there is no mobile design to copy.
- Fonts and icons are the product's real binaries; nothing was substituted.
