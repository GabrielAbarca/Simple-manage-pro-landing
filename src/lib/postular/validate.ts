import {
  CARGOS,
  ESTUDIANTES,
  NIVELES,
  PROVINCIAS,
  TELEFONO_DIGITS,
  TEXT_MAX_LENGTH,
  TIPOS,
  errorCopy,
} from "../../data/postulacion";

export interface PostulacionFields {
  colegio: string;
  provincia: string;
  canton: string;
  tipo: string;
  niveles: string[];
  estudiantes: string;
  nombre: string;
  cargo: string;
  correo: string;
  telefono: string;
  comentarios: string;
  consent: boolean;
}

export type FieldName = keyof PostulacionFields;
export type FieldErrors = Partial<Record<FieldName, string>>;

export const FIELD_NAMES: readonly FieldName[] = [
  "colegio", "provincia", "canton", "tipo", "niveles", "estudiantes",
  "nombre", "cargo", "correo", "telefono", "comentarios", "consent",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = new RegExp(`^\\d{${TELEFONO_DIGITS}}$`);

export function emptyPostulacion(): PostulacionFields {
  return {
    colegio: "", provincia: "", canton: "", tipo: "", niveles: [], estudiantes: "",
    nombre: "", cargo: "", correo: "", telefono: "", comentarios: "", consent: false,
  };
}

const isOneOf = (options: readonly string[], value: string): boolean => options.includes(value);

function requiredText(value: string, maxLength: number, missingMessage: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return missingMessage;
  return trimmed.length > maxLength ? errorCopy.tooLong(maxLength) : undefined;
}

function nivelesError(niveles: readonly string[]): string | undefined {
  const allKnown = niveles.every((nivel) => isOneOf(NIVELES, nivel));
  return niveles.length && allKnown ? undefined : errorCopy.niveles;
}

function correoError(correo: string): string | undefined {
  const trimmed = correo.trim();
  if (!trimmed) return errorCopy.correoRequired;
  if (trimmed.length > TEXT_MAX_LENGTH.correo) return errorCopy.tooLong(TEXT_MAX_LENGTH.correo);
  return EMAIL_PATTERN.test(trimmed) ? undefined : errorCopy.correoInvalid;
}

function optionalFieldErrors(fields: PostulacionFields): FieldErrors {
  const errors: FieldErrors = {};
  if (fields.estudiantes && !isOneOf(ESTUDIANTES, fields.estudiantes)) errors.estudiantes = errorCopy.estudiantes;
  if (fields.comentarios.length > TEXT_MAX_LENGTH.comentarios) {
    errors.comentarios = errorCopy.tooLong(TEXT_MAX_LENGTH.comentarios);
  }
  return errors;
}

function schoolErrors(fields: PostulacionFields): FieldErrors {
  return {
    colegio: requiredText(fields.colegio, TEXT_MAX_LENGTH.colegio, errorCopy.colegio),
    provincia: isOneOf(PROVINCIAS, fields.provincia) ? undefined : errorCopy.provincia,
    canton: requiredText(fields.canton, TEXT_MAX_LENGTH.canton, errorCopy.canton),
    tipo: isOneOf(TIPOS, fields.tipo) ? undefined : errorCopy.tipo,
    niveles: nivelesError(fields.niveles),
  };
}

function contactErrors(fields: PostulacionFields): FieldErrors {
  return {
    nombre: requiredText(fields.nombre, TEXT_MAX_LENGTH.nombre, errorCopy.nombre),
    cargo: isOneOf(CARGOS, fields.cargo) ? undefined : errorCopy.cargo,
    correo: correoError(fields.correo),
    telefono: PHONE_PATTERN.test(fields.telefono) ? undefined : errorCopy.telefono,
    consent: fields.consent === true ? undefined : errorCopy.consent,
  };
}

export function validatePostulacion(fields: PostulacionFields): FieldErrors {
  const all = { ...schoolErrors(fields), ...contactErrors(fields), ...optionalFieldErrors(fields) };
  const errors: FieldErrors = {};
  for (const name of FIELD_NAMES) {
    const message = all[name];
    if (message) errors[name] = message;
  }
  return errors;
}

export const hasErrors = (errors: FieldErrors): boolean => Object.keys(errors).length > 0;
