import type { IconName } from "../components/ui/icons";

export const pilotoMeta = {
  title: "Piloto 2027",
  description:
    "Un curso lectivo completo con Simple Manage Pro, de febrero a diciembre. Curso lectivo configurado, matrícula importada y acompañamiento para su colegio. Postule a su colegio para 2027",
  breadcrumb: "Piloto 2027",
} as const;

export const pilotoHeroCopy = {
  headline: ["Piloto", "2027"],
  lead: "Un curso lectivo completo con Simple Manage Pro, de febrero a diciembre, junto al equipo que lo construye",
  applyCta: "Postular mi colegio",
} as const;

export const audienceCopy = {
  eyebrow: "Para quién es",
  headline: ["Colegios que", "quieren usar un", "sistema moderno"],
  rows: [
    { number: "01", title: "Colegios de Costa Rica", body: "De sétimo a undécimo o duodécimo, públicos o privados" },
    { number: "02", title: "Una dirección que lo impulse", body: "La decisión de usar SMP durante el curso lectivo parte de la dirección" },
    { number: "03", title: "Docentes con acceso a internet", body: "Desde computadora o celular, en el colegio o en la casa" },
  ],
} as const;

export interface OfferPanel {
  eyebrow: string;
  headline: readonly [string, string];
  items: readonly { icon: IconName; label: string }[];
}

export const offerPanels: readonly [OfferPanel, OfferPanel] = [
  {
    eyebrow: "Qué recibe el colegio",
    headline: ["Todo listo", "desde febrero"],
    items: [
      { icon: "calendar_month", label: "Curso lectivo 2027 configurado" },
      { icon: "person_add", label: "Matrícula importada" },
      { icon: "badge", label: "Cuentas para dirección, docentes y estudiantes" },
      { icon: "support_agent", label: "Acompañamiento durante el curso lectivo" },
    ],
  },
  {
    eyebrow: "Qué pedimos a cambio",
    headline: ["Usarlo y", "contarnos"],
    items: [
      { icon: "fact_check", label: "Notas y asistencia en SMP" },
      { icon: "history_edu", label: "Comentarios sobre lo que funciona y lo que no" },
      { icon: "person", label: "Una persona de contacto en la dirección" },
    ],
  },
];

export const calendarCopy = {
  eyebrow: "Calendario del piloto",
  headline: ["Un curso lectivo,", "de punta a punta"],
  months: ["FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SET", "OCT", "NOV", "DIC"],
  milestones: [
    { range: "Febrero", title: "Arranque", body: "Curso lectivo configurado, matrícula cargada y cuentas entregadas" },
    { range: "Feb – Jun", title: "I Periodo", body: "Asistencia y notas en SMP desde la primera lección" },
    { range: "Jul – Nov", title: "II Periodo", body: "Ajustes a partir de lo aprendido en el primer periodo" },
    { range: "Diciembre", title: "Cierre", body: "Informes finales y balance del piloto con la dirección" },
  ],
} as const;

export const applyCopy = {
  headline: ["Postule a", "su colegio", "para 2027"],
  lead: "¿Dudas antes de postular? Escríbanos por el medio que prefiera",
  whatsappCta: "Conversar por WhatsApp",
  emailCta: "Escribir un correo",
  demoCta: "Ver la demo",
} as const;

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqCopy: { eyebrow: string; items: readonly FaqItem[] } = {
  eyebrow: "Preguntas frecuentes",
  items: [
    {
      question: "¿Podemos traer lo que ya tenemos en Excel?",
      answer: "Sí. Los documentos se importan desde los archivos que el colegio ya usa, y lo mismo con docentes y secciones. No hay que volver a digitar el colegio entero para empezar.",
    },
    {
      question: "¿Se puede dejar un colegio configurado desde cero en menos de una hora?",
      answer: "La estructura sí: curso lectivo, periodos, niveles, secciones, materias y aulas se configuran en esa primera sesión, y la matrícula entra importada desde su archivo de Excel. Lo que toma tiempo no es el sistema, es ponerse de acuerdo en cómo está organizado el colegio.",
    },
    {
      question: "¿Cada docente entra con su propia cuenta?",
      answer: "Sí. Cada docente recibe su usuario y ve únicamente sus secciones, sus materias y sus estudiantes. La dirección crea y desactiva esas cuentas desde su consola, sin depender de nadie más.",
    },
    {
      question: "¿Los estudiantes también entran?",
      answer: "Sí, con su propio usuario. Ven su promedio, su porcentaje de asistencia, su horario semanal y sus notas por materia y periodo. No pueden modificar nada.",
    },
    {
      question: "¿Esto reemplaza algo del MEP?",
      answer: "No. Simple Manage Pro no reemplaza nada del MEP. Ordena la información que el colegio ya maneja por dentro: notas, asistencia, horarios, expedientes y documentos para una mejor experiencia administrativa.",
    },
    {
      question: "¿Funciona desde el teléfono?",
      answer: "Sí. Docentes y estudiantes entran desde el teléfono con el mismo usuario, que es donde se pasa asistencia y donde se consultan notas. Sin embargo, la configuración del colegio se hace más cómoda desde una computadora.",
    },
    {
      question: "¿Dónde se aloja la información?",
      answer: "En Estados Unidos, fuera del país. Está dicho también en la política de privacidad.",
    },
    {
      question: "¿Y si algo falla durante el curso lectivo?",
      answer: "Escríbanos por cualquier medio de contacto y recibirá respuesta en menos de 24 horas. Durante el piloto, el soporte es prioritario y se atiende de inmediato.",
    },
  ],
};
