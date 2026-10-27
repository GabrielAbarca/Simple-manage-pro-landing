// Turns a raw POST to /api/postular into typed fields, or refuses it. This is
// the structural gate (content type, size, value types); the business rules
// run afterwards in validate.ts, the same function the browser uses.
// Anything that is not a string, a list of short strings or a checkbox value
// is treated as hostile and rejected outright.

import { NIVELES } from "../../data/postulacion";
import type { PostulacionFields } from "./validate";

export type BodyFormat = "json" | "form";

export interface ParsedPostulacion {
  format: BodyFormat;
  fields: PostulacionFields;
  /** The hidden `website` field: only bots fill it in. */
  honeypotFilled: boolean;
}

export type ParseOutcome =
  | { ok: true; value: ParsedPostulacion }
  | { ok: false; format: BodyFormat };

const MAX_BODY_BYTES = 16_384;
const MAX_STRING_LENGTH = 1_000;
const MAX_NIVEL_LENGTH = 8;
const TEXT_FIELDS = ["colegio", "provincia", "canton", "tipo", "estudiantes", "nombre", "cargo", "correo", "comentarios"] as const;
const CHECKED_VALUES = new Set(["on", "true", "1", "yes"]);

/** A lookup that only ever answers for a field it was asked about by name. */
type RawLookup = (name: string) => unknown;

class RejectedBody extends Error {}

export function detectFormat(contentType: string | null): BodyFormat | null {
  const mediaType = (contentType ?? "").split(";")[0].trim().toLowerCase();
  if (mediaType === "application/json") return "json";
  if (mediaType === "application/x-www-form-urlencoded") return "form";
  return null;
}

function readString(raw: unknown): string {
  if (raw === undefined || raw === null) return "";
  if (typeof raw !== "string" || raw.length > MAX_STRING_LENGTH) throw new RejectedBody();
  return raw;
}

function readNiveles(raw: unknown): string[] {
  if (raw === undefined || raw === null) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  if (list.length > NIVELES.length) throw new RejectedBody();
  const values = list.map((entry) => {
    if (typeof entry !== "string" || entry.length > MAX_NIVEL_LENGTH) throw new RejectedBody();
    return entry;
  });
  return [...new Set(values)];
}

function readConsent(raw: unknown): boolean {
  if (raw === undefined || raw === null || raw === false) return false;
  if (raw === true) return true;
  if (typeof raw !== "string" || raw.length > 8) throw new RejectedBody();
  return CHECKED_VALUES.has(raw.toLowerCase());
}

// A no-JS visitor types "8888 8888" or "8888-8888"; the script already sends
// digits. Only separators are dropped, so letters still fail validation.
const normalizePhone = (value: string): string => value.replace(/[\s\-().]/g, "");

function fieldsFrom(lookup: RawLookup, nivelesRaw: unknown): PostulacionFields {
  const text = Object.fromEntries(TEXT_FIELDS.map((name) => [name, readString(lookup(name))])) as Record<
    (typeof TEXT_FIELDS)[number],
    string
  >;
  return {
    ...text,
    niveles: readNiveles(nivelesRaw),
    telefono: normalizePhone(readString(lookup("telefono"))),
    consent: readConsent(lookup("consent")),
  };
}

function parseJson(text: string): ParsedPostulacion {
  const data: unknown = JSON.parse(text);
  if (typeof data !== "object" || data === null || Array.isArray(data)) throw new RejectedBody();
  const record = data as Record<string, unknown>;
  const lookup: RawLookup = (name) => (Object.hasOwn(record, name) ? record[name] : undefined);
  return {
    format: "json",
    fields: fieldsFrom(lookup, lookup("niveles")),
    honeypotFilled: readString(lookup("website")).trim() !== "",
  };
}

function parseForm(text: string): ParsedPostulacion {
  const params = new URLSearchParams(text);
  const lookup: RawLookup = (name) => {
    const values = params.getAll(name);
    if (values.length > 1) throw new RejectedBody();
    return values[0];
  };
  return {
    format: "form",
    fields: fieldsFrom(lookup, params.getAll("niveles")),
    honeypotFilled: readString(lookup("website")).trim() !== "",
  };
}

async function readLimitedText(request: Request): Promise<string> {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) throw new RejectedBody();
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) throw new RejectedBody();
  return text;
}

/** Parses the request body. Never throws: a bad body is a typed refusal. */
export async function parsePostulacionRequest(request: Request): Promise<ParseOutcome> {
  const format = detectFormat(request.headers.get("content-type"));
  if (!format) return { ok: false, format: "json" };
  try {
    const text = await readLimitedText(request);
    return { ok: true, value: format === "json" ? parseJson(text) : parseForm(text) };
  } catch {
    // Malformed JSON, oversized or mistyped values: all the same refusal.
    return { ok: false, format };
  }
}
