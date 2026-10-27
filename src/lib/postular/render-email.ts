// The notification Gabriel receives for each application: a subject, a plain
// text body and an HTML body, every field on its own line with its Spanish
// label. Everything here is applicant input, so the HTML body escapes every
// value and the subject is flattened to one line (a newline in a header is
// how header injection starts).

import { emailCopy, formCopy } from "../../data/postulacion";
import type { PostulacionFields } from "./validate";

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

type SummaryRow = readonly [label: string, value: string];

const SUBJECT_MAX_LENGTH = 200;

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

/** Collapses CR, LF and other control characters so the value fits one header line. */
export const toSingleLine = (value: string): string =>
  value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();

const displayValue = (value: string): string => value.trim() || emailCopy.emptyValue;

function summaryRows(fields: PostulacionFields): SummaryRow[] {
  const { labels } = formCopy;
  return [
    [labels.colegio, displayValue(fields.colegio)],
    [labels.provincia, displayValue(fields.provincia)],
    [labels.canton, displayValue(fields.canton)],
    [labels.tipo, displayValue(fields.tipo)],
    [labels.niveles, displayValue(fields.niveles.join(", "))],
    [labels.estudiantes, displayValue(fields.estudiantes)],
    [labels.nombre, displayValue(fields.nombre)],
    [labels.cargo, displayValue(fields.cargo)],
    [labels.correo, displayValue(fields.correo)],
    [labels.telefono, displayValue(fields.telefono && `${formCopy.phonePrefix} ${fields.telefono}`)],
    [labels.comentarios, displayValue(fields.comentarios)],
    [emailCopy.consentLabel, fields.consent ? emailCopy.consentYes : emailCopy.emptyValue],
  ];
}

export function renderSubject(fields: PostulacionFields): string {
  return toSingleLine(`${emailCopy.subjectPrefix}${fields.colegio}`).slice(0, SUBJECT_MAX_LENGTH);
}

export function renderPlainText(fields: PostulacionFields): string {
  const lines = summaryRows(fields).map(([label, value]) => `${label}: ${value}`);
  return [emailCopy.heading, "", ...lines].join("\n");
}

function htmlRow([label, value]: SummaryRow): string {
  const safeValue = escapeHtml(value).replace(/\r?\n/g, "<br>");
  return (
    `<tr><th align="left" valign="top" style="padding:6px 16px 6px 0;color:#627388;font-weight:600;">` +
    `${escapeHtml(label)}</th><td style="padding:6px 0;color:#363949;">${safeValue}</td></tr>`
  );
}

export function renderHtml(fields: PostulacionFields): string {
  const rows = summaryRows(fields).map(htmlRow).join("");
  return (
    `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;">` +
    `<h1 style="font-size:18px;color:#363949;">${escapeHtml(emailCopy.heading)}</h1>` +
    `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table></div>`
  );
}

export function renderPostulacionEmail(fields: PostulacionFields): RenderedEmail {
  return { subject: renderSubject(fields), text: renderPlainText(fields), html: renderHtml(fields) };
}
