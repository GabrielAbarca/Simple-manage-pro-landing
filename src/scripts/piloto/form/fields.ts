// Reads the application form into typed fields, and keeps the two controls
// that reshape what the visitor types: the phone (eight digits, shown as
// "8888 8888") and the message (500 characters, with its live counter).

import { COMENTARIOS_MAX_LENGTH, TELEFONO_DIGITS, formCopy } from "../../../data/postulacion";
import type { PostulacionFields } from "../../../lib/postular/validate";

const PHONE_GROUP_LENGTH = 4;

export const phoneDigits = (value: string): string => value.replace(/\D/g, "").slice(0, TELEFONO_DIGITS);

export const formatPhone = (digits: string): string =>
  digits.length > PHONE_GROUP_LENGTH ? `${digits.slice(0, PHONE_GROUP_LENGTH)} ${digits.slice(PHONE_GROUP_LENGTH)}` : digits;

/** Index just past the `digitCount`-th digit, so the caret survives reformatting. */
function caretAfterDigits(formatted: string, digitCount: number): number {
  if (digitCount === 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) seen += 1;
    if (seen === digitCount) return i + 1;
  }
  return formatted.length;
}

export function reformatPhoneInput(input: HTMLInputElement): void {
  const caret = input.selectionStart ?? input.value.length;
  const digitsBeforeCaret = phoneDigits(input.value.slice(0, caret)).length;
  const formatted = formatPhone(phoneDigits(input.value));
  if (formatted === input.value) return;
  input.value = formatted;
  const position = caretAfterDigits(formatted, digitsBeforeCaret);
  input.setSelectionRange(position, position);
}

export function updateCommentCounter(form: HTMLFormElement): void {
  const textarea = form.querySelector<HTMLTextAreaElement>('[name="comentarios"]');
  const counter = form.querySelector<HTMLElement>("[data-comment-counter]");
  if (!textarea || !counter) return;
  counter.textContent = `${textarea.value.slice(0, COMENTARIOS_MAX_LENGTH).length}${formCopy.counterSuffix}`;
}

export function readFields(form: HTMLFormElement): PostulacionFields {
  const data = new FormData(form);
  const text = (name: string): string => {
    const value = data.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    colegio: text("colegio"),
    provincia: text("provincia"),
    canton: text("canton"),
    tipo: text("tipo"),
    niveles: data.getAll("niveles").filter((value): value is string => typeof value === "string"),
    estudiantes: text("estudiantes"),
    nombre: text("nombre"),
    cargo: text("cargo"),
    correo: text("correo"),
    telefono: phoneDigits(text("telefono")),
    comentarios: text("comentarios").slice(0, COMENTARIOS_MAX_LENGTH),
    consent: data.get("consent") !== null,
  };
}

export const readHoneypot = (form: HTMLFormElement): string => {
  const value = new FormData(form).get("website");
  return typeof value === "string" ? value : "";
};
