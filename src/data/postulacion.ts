export const PROVINCIAS = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"] as const;
export const TIPOS = ["Público", "Privado", "Subvencionado"] as const;
export const NIVELES = ["7°", "8°", "9°", "10°", "11°", "12°"] as const;
export const ESTUDIANTES = ["Menos de 300", "300 – 700", "Más de 700"] as const;
export const CARGOS = ["Director/a", "Subdirector/a", "Coordinación académica", "Otro"] as const;

export const COMENTARIOS_MAX_LENGTH = 500;
export const TELEFONO_DIGITS = 8;

export const TEXT_MAX_LENGTH = {
  colegio: 160,
  canton: 80,
  nombre: 120,
  correo: 254,
  comentarios: COMENTARIOS_MAX_LENGTH,
} as const;

export const formCopy = {
  title: "Formulario de postulación",
  intro: "Todos los campos son obligatorios salvo los marcados como opcionales.",
  selectPlaceholder: "Seleccione…",
  optionalHint: "(opcional)",
  fieldsets: {
    school: { number: "01", title: "El colegio" },
    contact: { number: "02", title: "Persona de contacto" },
    comments: { number: "03", title: "Comentarios" },
  },
  labels: {
    colegio: "Nombre del colegio",
    provincia: "Provincia",
    canton: "Cantón",
    tipo: "Tipo de colegio",
    niveles: "Niveles que imparte",
    estudiantes: "Cantidad de estudiantes",
    nombre: "Nombre completo",
    cargo: "Cargo",
    correo: "Correo electrónico",
    telefono: "Teléfono o WhatsApp",
    comentarios: "Mensaje",
  },
  phonePrefix: "+506",
  phoneAriaLabel: "Teléfono o WhatsApp, 8 dígitos",
  counterSuffix: ` / ${COMENTARIOS_MAX_LENGTH}`,
  consent: "Acepto que el equipo de Simple Manage Pro me contacte sobre el piloto 2027.",
  privacyLink: "Leer la política de privacidad",
  submit: "Enviar postulación",
  sending: "Enviando…",
  responseNote: "Respondemos en las próximas 24 horas hábiles.",
  honeypotLabel: "Sitio web",
} as const;

export const errorCopy = {
  colegio: "Ingrese el nombre del colegio.",
  provincia: "Seleccione una provincia.",
  canton: "Ingrese el cantón.",
  tipo: "Seleccione el tipo de colegio.",
  niveles: "Seleccione al menos un nivel.",
  nombre: "Ingrese su nombre completo.",
  cargo: "Seleccione su cargo.",
  correoRequired: "Ingrese su correo electrónico.",
  correoInvalid: "Ingrese un correo válido.",
  telefono: "Ingrese un número de 8 dígitos.",
  consent: "Necesitamos su autorización para contactarle.",
  estudiantes: "Seleccione una opción de la lista.",
  tooLong: (maxLength: number) => `Use como máximo ${maxLength} caracteres.`,
} as const;

export const confirmationCopy = {
  title: "Postulación recibida.",
  emailBefore: "Le escribiremos a",
  emailAfter: "en las próximas 24 horas hábiles.",
  genericEmailLine: "Le escribiremos al correo que nos indicó en las próximas 24 horas hábiles.",
  summarySeparator: " · ",
} as const;

export const failureCopy = {
  before: "No pudimos enviar la postulación. Intente de nuevo o ",
  link: "escríbanos por WhatsApp",
  after: ".",
} as const;

export const emailCopy = {
  subjectPrefix: "Postulación Piloto 2027: ",
  heading: "Nueva postulación al Piloto 2027",
  consentLabel: "Autorización de contacto",
  consentYes: "Sí",
  emptyValue: "(sin indicar)",
} as const;

// Trailing slash because astro.config sets trailingSlash: "always"; the slashless
// path is a 404 there, and a redirect would drop the POST body.
export const POSTULAR_ENDPOINT = "/api/postular/";

export const NOJS_REDIRECT = {
  success: "/piloto/#postulacion-recibida",
  failure: "/piloto/#postulacion-error",
} as const;
