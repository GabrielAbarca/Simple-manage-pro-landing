import { Resend } from "resend";
import type { RenderedEmail } from "./render-email";

export interface OutgoingEmail extends RenderedEmail {
  replyTo: string;
}

export type EmailSender = (email: OutgoingEmail) => Promise<boolean>;
export type ErrorLogger = (message: string, detail?: unknown) => void;

export const POSTULAR_FROM = "Simple Manage Pro <postulaciones@simplemanagepro.com>";

export function createResendSender(apiKey: string | undefined, recipient: string, logError: ErrorLogger): EmailSender {
  if (!apiKey) {
    return async () => {
      logError("[postular] RESEND_API_KEY is not set; the application was not sent.");
      return false;
    };
  }
  const resend = new Resend(apiKey);
  return async ({ subject, text, html, replyTo }) => {
    try {
      const { error } = await resend.emails.send({ from: POSTULAR_FROM, to: [recipient], replyTo, subject, text, html });
      if (!error) return true;
      logError("[postular] Resend rejected the email.", error);
      return false;
    } catch (error) {
      logError("[postular] Resend request failed.", error);
      return false;
    }
  };
}
