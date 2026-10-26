# Piloto application form + Resend

The form appears in `/piloto#postular` and is the target of Contacto card 03. The reference is the `<form>` in `design/*/Piloto.dc.html` and its `validate()` / `submit()` / `renderVals()`.

## 1. Fields (in order)
**Fieldset 01 "El colegio"**
| Field | id / name | Control | Rule → error copy |
| --- | --- | --- | --- |
| Nombre del colegio | `colegio` | text, `autocomplete=organization`, full row | required → "Ingrese el nombre del colegio." |
| Provincia | `provincia` | select: Seleccione… / San José, Alajuela, Cartago, Heredia, Guanacaste, Puntarenas, Limón | required → "Seleccione una provincia." |
| Cantón | `canton` | text | required → "Ingrese el cantón." |
| Tipo de colegio | `tipo` | radiogroup of 3 pill buttons: Público, Privado, Subvencionado (selected = primary, others ghost; `role=radio aria-checked`) | required → "Seleccione el tipo de colegio." |
| Niveles que imparte | `niveles[]` | 6 checkboxes 7°, 8°, 9°, 10°, 11°, 12° in `repeat(auto-fill,minmax(84px,1fr))`, each 44px tall | ≥1 → "Seleccione al menos un nivel." |
| Cantidad de estudiantes (opcional) | `estudiantes` | select: Menos de 300 / 300 – 700 / Más de 700 | none |

**Fieldset 02 "Persona de contacto"**
| Field | id / name | Control | Rule → error copy |
| --- | --- | --- | --- |
| Nombre completo | `nombre` | text, `autocomplete=name` | required → "Ingrese su nombre completo." |
| Cargo | `cargo` | select: Director/a, Subdirector/a, Coordinación académica, Otro | required → "Seleccione su cargo." |
| Correo electrónico | `correo` | email, `autocomplete=email`, `mail` icon | required → "Ingrese su correo electrónico."; regex `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` → "Ingrese un correo válido." |
| Teléfono o WhatsApp | `telefono` | fixed "+506" prefix box + tel input (`inputmode=numeric`, `autocomplete=tel-national`). Strip non-digits and cap at 8. Display as "8888 8888". | exactly 8 digits → "Ingrese un número de 8 dígitos." |

**Fieldset 03 "Comentarios"**
- Mensaje (opcional): `comentarios`, a textarea with 4 rows, `maxlength=500`, `min-height:120px`, vertical resize.
- Live counter "N / 500" below it, right-aligned.

**Footer**
- Consent checkbox "Acepto que el equipo de Simple Manage Pro me contacte sobre el piloto 2027." Required → "Necesitamos su autorización para contactarle."
- Link "Leer la política de privacidad" → PRIVACY_URL.
- Submit button "Enviar postulación" ("Enviando…" while sending, disabled) + note "Respondemos en las próximas 24 horas hábiles."

**Legends** are "01"–"03" (14px/700 `#4455e6`) + the title (18px/700). Fieldsets 02 and 03 have `border-top:1px solid rgba(132,139,200,.3); padding-top:32px`.

**Labels and controls**
- Labels: `.78rem/600 uppercase`, `letter-spacing: var(--tracking-label)`, `color: var(--color-dark-variant)`. Optional hints in `var(--color-info-dark)`, no uppercase.
- Selects, textarea and the prefix use the DS input look: `1.5px solid var(--border-control)`, `border-radius: var(--border-radius-2)`, `background: var(--color-background)`, `.87rem`.
  - On focus: border `var(--color-primary)` and `box-shadow: var(--focus-ring)`, background white.
  - On error: border `var(--color-danger)` and `box-shadow: 0 0 0 3px var(--color-danger-light)`. Error text is `.72rem/500 var(--color-danger-text)`.
- **Grid:** D/T `repeat(auto-fit,minmax(min(100%,max(240px,calc(50% - 8px))),1fr))` with `gap:20px 16px`. M one column, gap 18.

## 2. Validation behavior
- Errors show for a field after it is blurred or touched, or for all fields after the first submit attempt.
- When a submit fails validation, scroll to the first `[data-invalid="true"]` (offset 140px on D, 100px on M/T, smooth unless reduced motion) and focus its control.
- Set `aria-invalid` on invalid controls and connect errors with `aria-describedby`.
- The same validation must run on the server.

## 3. States
1. **Form:** the default.
2. **Errors:** inline per field.
3. **Sending:** button disabled, label "Enviando…".
4. **Confirmación** replaces the form in the same card. White, `1px solid rgba(132,139,200,.3)`, radius 36 (M/T 24), `min-height: clamp(420px,64vh,680px)` (M/T 360px), padding `clamp(28px,4vw,64px)` (M `28px 20px`). Contents:
   - `check_circle` icon at 48px in `var(--color-success-text)`.
   - H3 "Postulación recibida.".
   - "Le escribiremos a **{correo}** en las próximas 24 horas hábiles."
   - A ruled summary line "{colegio} · {cantón}, {provincia}".
5. **Send failure** (new, not in the design; follows SMP voice): keep the form and show an inline message above the submit button in `var(--color-danger-text)`: "No pudimos enviar la postulación. Intente de nuevo o escríbanos por WhatsApp." The WhatsApp part links to waHref.

## 4. Endpoint (Astro 5 + Vercel + Resend)
- Add the adapter with `npx astro add vercel`. In Astro 5, the default static output plus an adapter lets one route run on demand. **There is no `output:'hybrid'` in Astro 5.**
- `src/pages/api/postular.ts`:
```ts
import type { APIRoute } from "astro";
import { Resend } from "resend";
import { EMAIL } from "../../config";
export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const data = await request.json().catch(() => null);
  if (!data) return json({ ok: false }, 400);
  if (data.website) return json({ ok: true });          // honeypot: pretend success
  const errors = validate(data);                         // same rules as the client (§1)
  if (Object.keys(errors).length) return json({ ok: false, errors }, 422);
  // basic rate limit: e.g. 5 requests / 10 min per clientAddress (Vercel KV or in-memory best-effort)
  const { error } = await resend.emails.send({
    from: "Simple Manage Pro <postulaciones@simplemanagepro.com>", // verified domain in Resend
    to: [EMAIL],
    replyTo: data.correo,
    subject: `Postulación Piloto 2027 — ${data.colegio}`,
    text: renderPlainText(data),                          // every field, one per line, Spanish labels
    html: renderHtml(data),
  });
  if (error) return json({ ok: false }, 502);
  return json({ ok: true });
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json" } });
```
- **Env:** `RESEND_API_KEY` in Vercel (Production + Preview). Verify the sending domain in Resend first (DNS records).
- **Honeypot:** a visually hidden `website` input with `tabindex=-1` and `autocomplete=off`.
- **Client:** `fetch('/api/postular', {method:'POST', headers:{'Content-Type':'application/json'}, body})`. Then `ok` → confirmation, 422 → map the server errors onto the fields, anything else → send-failure message.
- **No-JS fallback:** give the form `action="/api/postular" method="post"`. The endpoint should accept `application/x-www-form-urlencoded` too and redirect to `/piloto?enviado=1#postular`, which renders the confirmation.
- Optional: send a confirmation email to the applicant, using the same copy as the confirmation panel. Only if the owner approves.
