// Request → response for /api/postular, with its collaborators injected so it
// can be exercised without Resend or a network. Order matters: rate limit
// first (cheapest refusal), then structure, then the honeypot, then the same
// validation the browser ran, and only then the email.
//
// JSON callers (the page script) get a status and a small body. The no-JS
// form gets a 303 back to /piloto/, where a :target block says what happened.

import { NOJS_REDIRECT } from "../../data/postulacion";
import { detectFormat, parsePostulacionRequest, type BodyFormat } from "./parse-body";
import type { RateLimiter } from "./rate-limit";
import { renderPostulacionEmail } from "./render-email";
import type { EmailSender, ErrorLogger } from "./send-email";
import { hasErrors, validatePostulacion, type FieldErrors } from "./validate";

export interface PostulacionDependencies {
  sendEmail: EmailSender;
  rateLimiter: RateLimiter;
  logError: ErrorLogger;
}

type Outcome =
  | { kind: "sent" }
  | { kind: "malformed" }
  | { kind: "invalid"; errors: FieldErrors }
  | { kind: "rate-limited" }
  | { kind: "send-failed" };

const NO_STORE = { "Cache-Control": "no-store" };
const RETRY_AFTER_SECONDS = "600";

function jsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...NO_STORE, ...extraHeaders },
  });
}

function jsonOutcome(outcome: Outcome): Response {
  switch (outcome.kind) {
    case "sent": return jsonResponse({ ok: true }, 200);
    case "malformed": return jsonResponse({ ok: false }, 400);
    case "invalid": return jsonResponse({ ok: false, errors: outcome.errors }, 422);
    case "rate-limited": return jsonResponse({ ok: false }, 429, { "Retry-After": RETRY_AFTER_SECONDS });
    case "send-failed": return jsonResponse({ ok: false }, 502);
  }
}

function redirectOutcome(outcome: Outcome): Response {
  const location = outcome.kind === "sent" ? NOJS_REDIRECT.success : NOJS_REDIRECT.failure;
  return new Response(null, { status: 303, headers: { Location: location, ...NO_STORE } });
}

const respond = (format: BodyFormat, outcome: Outcome): Response =>
  format === "form" ? redirectOutcome(outcome) : jsonOutcome(outcome);

async function decide(request: Request, deps: PostulacionDependencies): Promise<Outcome> {
  const parsed = await parsePostulacionRequest(request);
  if (!parsed.ok) return { kind: "malformed" };
  // Pretend success so a bot learns nothing from the response.
  if (parsed.value.honeypotFilled) return { kind: "sent" };
  const { fields } = parsed.value;
  const errors = validatePostulacion(fields);
  if (hasErrors(errors)) return { kind: "invalid", errors };
  const email = renderPostulacionEmail(fields);
  const sent = await deps.sendEmail({ ...email, replyTo: fields.correo.trim() });
  return sent ? { kind: "sent" } : { kind: "send-failed" };
}

export async function handlePostulacion(
  request: Request,
  clientKey: string,
  deps: PostulacionDependencies,
): Promise<Response> {
  const format = detectFormat(request.headers.get("content-type")) ?? "json";
  if (!deps.rateLimiter.allow(clientKey)) return respond(format, { kind: "rate-limited" });
  try {
    return respond(format, await decide(request, deps));
  } catch (error) {
    // Whatever broke stays in the server log; the visitor gets the generic failure.
    deps.logError("[postular] Unexpected failure handling an application.", error);
    return respond(format, { kind: "send-failed" });
  }
}
