// Producto copy, verbatim from design_handoff_smp_landing/design/*/Producto.dc.html.
// Mock-UI strings painted inside canvas textures stay in the texture modules.

import type { IconName } from "../components/ui/icons";
import type { BadgeTone, ButtonVariant } from "../scripts/ui/ds-runtime";

export const productoMeta = {
  title: "Producto",
  description:
    "Del cierre de periodo a un solo expediente. Notas, asistencia e informes reunidos en el expediente de cada estudiante, con portales para la dirección, los docentes y los estudiantes.",
} as const;

export const openingCopy = {
  headline: ["Del cierre de periodo", "a un solo expediente."],
  lead: "Notas, asistencia e informes reunidos en el expediente de cada estudiante.",
  chapters: [
    { eyebrow: "01 · Las notas", statement: "Cada docente lleva su propia hoja de cálculo." },
    { eyebrow: "02 · La asistencia", statement: "La asistencia se pasa en papel. Las consultas llegan por WhatsApp." },
    { eyebrow: "03 · El cierre", statement: "Al cierre de periodo, los informes se arman a mano." },
    { eyebrow: "04 · Simple Manage Pro", statement: "Con SMP, todo queda en un solo expediente." },
  ],
  demoCta: "Ver la demo",
  whatsappCta: "Conversar por WhatsApp",
  stepFirst: "01",
  stepLast: "04",
} as const;

export const portalsIntroCopy = {
  eyebrow: "Cómo funciona",
  headline: ["Tres portales.", "Un mismo registro."],
  body: "Dirección, docentes y estudiantes trabajan sobre la misma base de datos. Cada rol ve solo lo que le corresponde.",
  railFirst: "01",
  railLast: "03",
} as const;

export interface PortalCapability {
  icon: IconName;
  text: string;
}

export interface PortalPanelCopy {
  eyebrow: string;
  title: string;
  capabilities: readonly PortalCapability[];
}

export const portalPanels: readonly PortalPanelCopy[] = [
  {
    eyebrow: "01 · Administración",
    title: "La dirección arma el curso lectivo una sola vez.",
    capabilities: [
      { icon: "calendar_month", text: "Años, periodos, niveles y secciones" },
      { icon: "groups", text: "Docentes y asignaciones por sección" },
      { icon: "person_add", text: "Matrícula por CSV y cuentas de usuario" },
    ],
  },
  {
    eyebrow: "02 · Docente",
    title: "Asistencia y notas, desde la misma lección.",
    capabilities: [
      { icon: "today", text: "Las lecciones del día, en orden" },
      { icon: "fact_check", text: "Asistencia por lección" },
      { icon: "grading", text: "Libro de notas y conducta" },
    ],
  },
  {
    eyebrow: "03 · Estudiante",
    title: "Cada estudiante consulta sus notas sin preguntar.",
    capabilities: [
      { icon: "grade", text: "Notas por periodo y materia" },
      { icon: "schedule", text: "Horario semanal" },
      { icon: "history_edu", text: "Historial de asistencia" },
    ],
  },
];

export const savedToast = "Guardado.";

export interface AdminPeriodState {
  badge: string;
  tone: BadgeTone;
  variant: ButtonVariant;
  cta: string;
}

export const adminConsoleCopy = {
  courseTitle: "Curso lectivo 2026",
  minimumGrade: "Nota mínima 70",
  periodOne: { badge: "I Periodo activo", tone: "primary", variant: "primary", cta: "Activar II Periodo" },
  periodTwo: { badge: "II Periodo activo", tone: "success", variant: "secondary", cta: "Activar I Periodo" },
  stats: [
    { icon: "school", label: "Estudiantes", value: "412", tone: "primary" },
    { icon: "category", label: "Secciones", value: "14", tone: "success" },
    { icon: "co_present", label: "Docentes", value: "28", tone: "warning" },
  ],
  tableLabel: "Secciones del curso lectivo",
  // Mobile and tablet drop the homeroom teacher and shorten the count head.
  columnsWide: [
    { key: "sec", header: "Sección", nowrap: true },
    { key: "lvl", header: "Nivel" },
    { key: "guia", header: "Docente guía" },
    { key: "n", header: "Estudiantes", align: "right" },
  ],
  columnsCompact: [
    { key: "sec", header: "Sección", nowrap: true },
    { key: "lvl", header: "Nivel" },
    { key: "n", header: "Estud.", align: "right" },
  ],
  rows: [
    { id: 1, sec: "7-1", lvl: "Sétimo", guia: "Marta Solís", n: 31 },
    { id: 2, sec: "8-2", lvl: "Octavo", guia: "José Arias", n: 29 },
    { id: 3, sec: "10-2", lvl: "Décimo", guia: "Laura Mora", n: 28 },
    { id: 4, sec: "12-1", lvl: "Duodécimo", guia: "Andrés Quesada", n: 26 },
  ],
} as const satisfies {
  periodOne: AdminPeriodState;
  periodTwo: AdminPeriodState;
  [key: string]: unknown;
};

export type AttendanceStatus = "present" | "absent" | "late";

export const attendanceStatuses: readonly AttendanceStatus[] = ["present", "absent", "late"];

export interface AttendanceStudent {
  name: string;
  initials: string;
  /** Where the pills start. */
  status: AttendanceStatus;
}

const attendanceStudents: readonly AttendanceStudent[] = [
  { name: "Sofía Alvarado", initials: "SA", status: "present" },
  { name: "Mateo Brenes", initials: "MB", status: "present" },
  { name: "Valeria Castro", initials: "VC", status: "absent" },
  { name: "Diego Fallas", initials: "DF", status: "late" },
];

export const teacherConsoleCopy = {
  today: { start: "07:00", end: "08:20", subject: "Matemáticas", meta: "10-2 · Aula 12", accent: "#7380ec" },
  attendanceTitle: "Asistencia · 10-2",
  pillLabels: { present: "Presente", absent: "Ausente", late: "Tardía" },
  // [singular, plural] for the live summary, e.g. "2 presentes · 1 ausente".
  summaryWords: {
    present: ["presente", "presentes"],
    absent: ["ausente", "ausentes"],
    late: ["tardía", "tardías"],
  },
  summarySeparator: " · ",
  students: attendanceStudents,
  saveCta: "Guardar asistencia",
} as const;

export type StudentPeriod = "I" | "II";

export interface StudentPeriodData {
  grades: readonly number[];
  average: string;
  attendance: number;
  attendanceLine: string;
}

export const studentConsoleCopy = {
  initials: "YR",
  name: "Yendry Rojas Vargas",
  meta: "Duodécimo · 12-1",
  periodButtons: { I: "I Periodo", II: "II Periodo" },
  averageLabel: "Promedio del periodo",
  passLabel: "Aprobado",
  subjects: ["Matemáticas", "Español", "Química", "Física", "Inglés"],
  periods: {
    I: { grades: [88, 91, 79, 84, 95], average: "87,4", attendance: 96, attendanceLine: "96 % de asistencia · 2 ausencias" },
    II: { grades: [82, 93, 85, 88, 96], average: "88,8", attendance: 98, attendanceLine: "98 % de asistencia · 1 ausencia" },
  },
} as const satisfies { periods: Record<StudentPeriod, StudentPeriodData>; [key: string]: unknown };

export const portalsEndCopy = {
  headline: "Recorra los tres portales",
  headlineAccent: "con datos de ejemplo.",
  body: "La demo abre con un colegio ficticio. Nada de lo que haga se guarda.",
  demoCta: "Probar demo",
  whatsappCta: "Escribir por WhatsApp",
} as const;
