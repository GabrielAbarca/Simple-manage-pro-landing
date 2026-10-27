// The Piloto application endpoint, the one route that runs on demand. The
// work is in src/lib/postular/handle.ts; this file only wires the real
// collaborators: Resend, the in-memory limiter and the server log.

import type { APIRoute } from "astro";
import { EMAIL } from "../../config";
import { handlePostulacion } from "../../lib/postular/handle";
import { POSTULAR_RATE_LIMIT, createRateLimiter } from "../../lib/postular/rate-limit";
import { createResendSender } from "../../lib/postular/send-email";

export const prerender = false;

const rateLimiter = createRateLimiter(POSTULAR_RATE_LIMIT);
const logServerError = (message: string, detail?: unknown) => console.error(message, detail ?? "");
const sendEmail = createResendSender(import.meta.env.RESEND_API_KEY, EMAIL, logServerError);

// Astro throws when the platform cannot report an address; every such caller
// then shares one bucket, which still caps a flood.
function clientKeyOf(readAddress: () => string): string {
  try {
    return readAddress() || "unknown";
  } catch {
    return "unknown";
  }
}

const dependencies = { sendEmail, rateLimiter, logError: logServerError };

export const POST: APIRoute = (context) =>
  handlePostulacion(context.request, clientKeyOf(() => context.clientAddress), dependencies);
