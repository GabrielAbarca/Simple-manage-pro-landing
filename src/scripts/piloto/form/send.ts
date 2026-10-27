// Sends the application as JSON and sorts the answer into the three outcomes
// the form can show. The response is untrusted data: only known field names
// with string messages survive, and they are later written as text, never HTML.

import { POSTULAR_ENDPOINT } from "../../../data/postulacion";
import { FIELD_NAMES, type FieldErrors, type FieldName, type PostulacionFields } from "../../../lib/postular/validate";

export type SendResult = { kind: "sent" } | { kind: "invalid"; errors: FieldErrors } | { kind: "failed" };

const MAX_SERVER_MESSAGE_LENGTH = 200;

function knownFieldErrors(raw: unknown): FieldErrors {
  if (typeof raw !== "object" || raw === null) return {};
  const record = raw as Record<string, unknown>;
  const errors: FieldErrors = {};
  for (const name of FIELD_NAMES as readonly FieldName[]) {
    const message = record[name];
    if (typeof message === "string" && message) errors[name] = message.slice(0, MAX_SERVER_MESSAGE_LENGTH);
  }
  return errors;
}

async function readJson(response: Response): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await response.json();
    return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function sendPostulacion(fields: PostulacionFields, honeypot: string): Promise<SendResult> {
  try {
    const response = await fetch(POSTULAR_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...fields, website: honeypot }),
    });
    const body = await readJson(response);
    if (response.ok && body?.ok === true) return { kind: "sent" };
    if (response.status === 422) return { kind: "invalid", errors: knownFieldErrors(body?.errors) };
    return { kind: "failed" };
  } catch {
    return { kind: "failed" };
  }
}
