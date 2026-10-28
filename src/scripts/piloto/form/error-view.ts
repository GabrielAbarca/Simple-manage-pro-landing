import { currentLayout } from "../../core/breakpoints";
import { prefersReducedMotion } from "../../core/anim";
import type { FieldErrors, FieldName } from "../../../lib/postular/validate";

const ERROR_SCROLL_OFFSET_DESKTOP = 140;
const ERROR_SCROLL_OFFSET_COMPACT = 100;

export interface ErrorVisibility {
  clientErrors: FieldErrors;
  serverErrors: FieldErrors;
  touched: ReadonlySet<FieldName>;
  submitted: boolean;
}

export function visibleErrors({ clientErrors, serverErrors, touched, submitted }: ErrorVisibility): FieldErrors {
  const shown: FieldErrors = { ...serverErrors };
  for (const [name, message] of Object.entries(clientErrors) as [FieldName, string][]) {
    if (shown[name]) continue;
    if (submitted || touched.has(name)) shown[name] = message;
  }
  return shown;
}

function paintField(wrapper: HTMLElement, message: string): void {
  wrapper.dataset.invalid = message ? "true" : "false";
  const errorLine = wrapper.querySelector<HTMLElement>("[data-field-error], [data-input-error]");
  if (errorLine && errorLine.textContent !== message) errorLine.textContent = message;
  wrapper.querySelectorAll<HTMLElement>("[data-control]").forEach((control) => {
    if (message) control.setAttribute("aria-invalid", "true");
    else control.removeAttribute("aria-invalid");
  });
}

export function renderFieldErrors(form: HTMLFormElement, errors: FieldErrors): void {
  form.querySelectorAll<HTMLElement>("[data-field]").forEach((wrapper) => {
    paintField(wrapper, errors[wrapper.dataset.field as FieldName] ?? "");
  });
}

export function revealFirstError(form: HTMLFormElement): boolean {
  const field = form.querySelector<HTMLElement>('[data-invalid="true"]');
  if (!field) return false;
  const offset = currentLayout() === "desktop" ? ERROR_SCROLL_OFFSET_DESKTOP : ERROR_SCROLL_OFFSET_COMPACT;
  scrollTo({
    top: field.getBoundingClientRect().top + scrollY - offset,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  field.querySelector<HTMLElement>("input, select, textarea, button")?.focus({ preventScroll: true });
  return true;
}
