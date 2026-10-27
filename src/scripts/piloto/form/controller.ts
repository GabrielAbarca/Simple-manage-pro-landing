import {
  hasErrors,
  validatePostulacion,
  type FieldErrors,
  type FieldName,
} from "../../../lib/postular/validate";
import { renderFieldErrors, revealFirstError, visibleErrors } from "./error-view";
import { readFields, readHoneypot, reformatPhoneInput, updateCommentCounter } from "./fields";
import { setFailureVisible, setSending, showConfirmation } from "./outcome-view";
import { sendPostulacion } from "./send";

interface FormState {
  touched: ReadonlySet<FieldName>;
  submitted: boolean;
  sending: boolean;
  serverErrors: FieldErrors;
}

interface FormContext {
  form: HTMLFormElement;
  confirmation: HTMLElement;
  state: FormState;
}

const TOUCH_ON_BLUR = new Set<string>(["colegio", "provincia", "canton", "nombre", "cargo", "correo", "telefono"]);
const TOUCH_ON_CHANGE = new Set<string>(["tipo", "niveles", "consent"]);
const TOUCH_NONE = new Set<string>();

const controlName = (target: EventTarget | null): string =>
  target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement
    ? target.name
    : "";

function withoutServerError(errors: FieldErrors, name: string): FieldErrors {
  if (!(name in errors)) return errors;
  const { [name as FieldName]: _cleared, ...rest } = errors;
  return rest;
}

function render(context: FormContext): void {
  const clientErrors = validatePostulacion(readFields(context.form));
  renderFieldErrors(context.form, visibleErrors({ ...context.state, clientErrors }));
}

function touch(context: FormContext, name: string): void {
  if (context.state.touched.has(name as FieldName)) return;
  context.state = { ...context.state, touched: new Set([...context.state.touched, name as FieldName]) };
}

function handleValueChange(context: FormContext, event: Event, touchOnThisEvent: ReadonlySet<string>): void {
  const name = controlName(event.target);
  if (!name) return;
  if (name === "telefono") reformatPhoneInput(event.target as HTMLInputElement);
  if (name === "comentarios") updateCommentCounter(context.form);
  if (touchOnThisEvent.has(name)) touch(context, name);
  context.state = { ...context.state, serverErrors: withoutServerError(context.state.serverErrors, name) };
  render(context);
}

function handleFocusOut(context: FormContext, event: FocusEvent): void {
  const name = controlName(event.target);
  if (!TOUCH_ON_BLUR.has(name)) return;
  touch(context, name);
  render(context);
}

async function sendAndShowOutcome(context: FormContext): Promise<void> {
  const { form, confirmation } = context;
  const fields = readFields(form);
  const result = await sendPostulacion(fields, readHoneypot(form));
  if (result.kind === "sent") return showConfirmation(confirmation, fields);
  context.state = { ...context.state, sending: false };
  setSending(form, false);
  if (result.kind === "failed") return setFailureVisible(form, true);
  context.state = { ...context.state, submitted: true, serverErrors: result.errors };
  render(context);
  if (!revealFirstError(form)) setFailureVisible(form, true);
}

function handleSubmit(context: FormContext, event: SubmitEvent): void {
  event.preventDefault();
  if (context.state.sending) return;
  if (hasErrors(validatePostulacion(readFields(context.form)))) {
    context.state = { ...context.state, submitted: true };
    render(context);
    revealFirstError(context.form);
    return;
  }
  context.state = { ...context.state, sending: true };
  setFailureVisible(context.form, false);
  setSending(context.form, true);
  void sendAndShowOutcome(context);
}

export function initApplicationForm(form: HTMLFormElement | null, confirmation: HTMLElement | null): void {
  if (!form || !confirmation) return;
  const context: FormContext = {
    form,
    confirmation,
    state: { touched: new Set(), submitted: false, sending: false, serverErrors: {} },
  };
  form.noValidate = true;
  updateCommentCounter(form);
  form.addEventListener("input", (event) => handleValueChange(context, event, TOUCH_NONE));
  form.addEventListener("change", (event) => handleValueChange(context, event, TOUCH_ON_CHANGE));
  form.addEventListener("focusout", (event) => handleFocusOut(context, event));
  form.addEventListener("submit", (event) => handleSubmit(context, event));
}
