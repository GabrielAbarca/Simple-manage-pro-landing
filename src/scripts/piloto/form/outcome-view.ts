// The form's non-field states: "Enviando…" on the submit button, the inline
// send-failure message, and the confirmation that replaces the form.

import { confirmationCopy, formCopy } from "../../../data/postulacion";
import type { PostulacionFields } from "../../../lib/postular/validate";
import { currentLayout } from "../../core/breakpoints";
import { prefersReducedMotion } from "../../core/anim";
import { setButtonLabel } from "../../ui/ds-runtime";

const CONFIRMATION_SCROLL_OFFSET_DESKTOP = 140;
const CONFIRMATION_SCROLL_OFFSET_COMPACT = 100;

export function setSending(form: HTMLFormElement, sending: boolean): void {
  const button = form.querySelector<HTMLButtonElement>("[data-submit]");
  if (!button) return;
  button.disabled = sending;
  setButtonLabel(button, sending ? formCopy.sending : formCopy.submit);
  form.setAttribute("aria-busy", sending ? "true" : "false");
}

export function setFailureVisible(form: HTMLFormElement, visible: boolean): void {
  const message = form.querySelector<HTMLElement>("[data-send-failure]");
  if (!message) return;
  if (visible) message.dataset.shown = "true";
  else delete message.dataset.shown;
}

/** "{colegio} · {cantón}, {provincia}", as the prototype composes it. */
export function confirmationSummary(fields: PostulacionFields): string {
  const place = [fields.canton.trim(), fields.provincia].filter(Boolean).join(", ");
  return [fields.colegio.trim(), place].filter(Boolean).join(confirmationCopy.summarySeparator);
}

function fillConfirmation(confirmation: HTMLElement, fields: PostulacionFields): void {
  const email = confirmation.querySelector<HTMLElement>("[data-sent-email]");
  const summary = confirmation.querySelector<HTMLElement>("[data-sent-summary]");
  const generic = confirmation.querySelector<HTMLElement>("[data-confirmation-generic]");
  const specific = confirmation.querySelector<HTMLElement>("[data-confirmation-specific]");
  if (email) email.textContent = fields.correo.trim();
  if (summary) {
    summary.textContent = confirmationSummary(fields);
    summary.hidden = false;
  }
  if (generic) generic.hidden = true;
  if (specific) specific.hidden = false;
}

// The form is far taller than the confirmation, so after the swap the card
// can sit above the viewport; bring it back the way error scrolling does.
function bringIntoView(confirmation: HTMLElement): void {
  const top = confirmation.getBoundingClientRect().top;
  if (top >= 0 && top < innerHeight) return;
  const offset = currentLayout() === "desktop" ? CONFIRMATION_SCROLL_OFFSET_DESKTOP : CONFIRMATION_SCROLL_OFFSET_COMPACT;
  scrollTo({ top: top + scrollY - offset, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

export function showConfirmation(confirmation: HTMLElement, fields: PostulacionFields): void {
  fillConfirmation(confirmation, fields);
  confirmation.dataset.shown = "true";
  bringIntoView(confirmation);
  confirmation.querySelector<HTMLElement>("[data-confirmation-title]")?.focus({ preventScroll: true });
}
