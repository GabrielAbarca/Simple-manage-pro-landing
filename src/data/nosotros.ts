export const nosotrosMeta = {
  title: "Nosotros",
  description:
    "Simple Manage Pro es un software escolar pensado para los colegios de Costa Rica. Conozca nuestra misión, nuestra visión, la historia del sistema y a su fundador.",
  breadcrumb: "Nosotros",
} as const;

export const nosotrosHeroCopy = {
  headline: ["Somos un software", "escolar pensado", "para su colegio."],
} as const;

export interface MissionVisionPanel {
  label: string;
  number: string;
  body: string;
}

export const missionVisionCopy = {
  tablistLabel: "Misión y visión",
  previous: "Anterior",
  next: "Siguiente",
  panels: [
    {
      label: "Misión",
      number: "01",
      body: "Nuestra misión en Simple Manage Pro es proveer a las instituciones educativas de Costa Rica un sistema de gestión escolar que refleje la estructura del sistema educativo costarricense, con curso lectivo, periodos, niveles, secciones y expedientes, para que de este modo, los colegios puedan administrar sus procesos académicos de manera eficiente y segura.",
    },
    {
      label: "Visión",
      number: "02",
      body: "Simple Manage Pro aspira a construir un estándar en la gestión escolar en Costa Rica, ofreciendo un sistema que no solo cumpla con las necesidades administrativas de los colegios, sino que también promueva la transparencia, la seguridad de los datos y la eficiencia en la administración educativa. Buscamos ser un aliado confiable para las instituciones educativas proveyendo software moderno que solucione los desafíos de la gestión escolar, facilitando su labor y contribuyendo al desarrollo académico de los estudiantes.",
    },
  ],
} as const;

export interface HistoryMilestone {
  year: string;
  title: string;
  body: string;
}

export const historyCopy = {
  eyebrow: "Nuestra historia",
  headline: ["Empezó como un proyecto", "de feria científica."],
  paragraphBeforeLink:
    "El problema era el mismo que sigue resolviendo hoy: al cierre de cada periodo, alguien en la dirección arma las notas a mano desde archivos sueltos, los resultados tardaban días o incluso semanas en llegar a los estudiantes. Tres cursos lectivos después, es un sistema que un colegio puede usar de verdad. Hoy ese trabajo lo hacen ",
  paragraphLinkLabel: "las tres consolas del sistema",
  paragraphLinkHref: "/producto/",
  paragraphAfterLink: ".",
  milestones: [
    {
      year: "2024",
      title: "Un proyecto de feria científica",
      body: "La idea fue plasmada en un proyecto de feria científica, con un prototipo estático que mostraba mucho potencial, ganando así el segundo puesto de la feria.",
    },
    {
      year: "2025",
      title: "De prototipo a sistema",
      body: "Las tres consolas, los periodos ponderados, la asistencia por sección y la matrícula. Se empezó a construir un software funcional con un propósito.",
    },
    {
      year: "2026",
      title: "Lanzamiento oficial del sistema junto a la demo pública",
      body: "Curso lectivo, secciones, cédula y materias en español, abierta para que cualquier colegio la revise sin pedir permiso ni dejar datos.",
    },
    {
      year: "2027",
      title: "Piloto 2027",
      body: "El piloto arranca en febrero con el curso lectivo 2027. Cada colegio con su estructura y su propia base de datos.",
    },
  ],
} as const;

export const founderCopy = {
  eyebrow: "Fundador",
  initials: "GZ",
  name: "Gabriel Zelaya",
  role: "Founder & CEO",
  bio: "Gabriel Zelaya es un desarrollador Full-Stack con experiencia remota e internacional. Especializado en la creación de software pensado para la aportación de valor para los clientes.",
} as const;
