import type { APIRoute } from "astro";
import { EMAIL } from "../../config";
import { handlePostulacion } from "../../lib/postular/handle";
import { POSTULAR_RATE_LIMIT, createRateLimiter } from "../../lib/postular/rate-limit";
import { createResendSender } from "../../lib/postular/send-email";

export const prerender = false;

const rateLimiter = createRateLimiter(POSTULAR_RATE_LIMIT);
const logServerError = (message: string, detail?: unknown) => console.error(message, detail ?? "");
const sendEmail = createResendSender(import.meta.env.RESEND_API_KEY, EMAIL, logServerError);

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
