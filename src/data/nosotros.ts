export const nosotrosMeta = {
  title: "Nosotros",
  description:
    "Simple Manage Pro es un software escolar pensado para los colegios de Costa Rica. Conozca nuestra misión, nuestra visión, la historia del sistema y a su fundador.",
  breadcrumb: "Nosotros",
} as const;

export const nosotrosHeroCopy = {
  headline: ["Somos un software", "escolar pensado", "para su colegio"],
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
  headline: ["Empezó como un proyecto", "de feria científica"],
  paragraphBeforeLink:
    "Utilizando técnicas de el sistema educativo estadounidense, Simple Manage Pro fue pensado con el propósito de resolver los problemas que la gestión escolar latinoamericana enfrenta, y fue desarrollado para reflejar la estructura del sistema educativo costarricense, con curso lectivo, periodos, niveles, secciones y expedientes. El sistema está compuesto por ",
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
      body: "Las tres consolas, los periodos ponderados, la asistencia por sección y la matrícula. El proyecto se transformó en una idea de negocio, dando inico al desarrollo del software escolar.",
    },
    {
      year: "2026",
      title: "Lanzamiento oficial del sistema junto a la demo pública",
      body: "El software fue oficialmente abierto al público, en busca de colegios que escogan a Simple Manage Pro como su herramienta de gestión escolar.",
    },
    {
      year: "2027",
      title: "Piloto 2027",
      body: "El plan para la implementación del sistema escolar en el curso lectivo 2027 es ejecutado. Se espera que los colegios que adopten el sistema puedan experimentar una mejora significativa en la eficiencia de sus procesos administrativos y académicos.",
    },
  ],
} as const;

export const founderCopy = {
  eyebrow: "Fundador",
  initials: "GZ",
  name: "Gabriel Zelaya",
  role: "Founder & CEO",
  bio: "Gabriel Zelaya es un desarrollador Full-Stack con experiencia remota e internacional. Gabriel analizó las diferencias en el manejo de información escolar en el extranjero con países como Costa Rica. Dando lugar a la idea de un software para mejorar la experiencia de gestión escolar latinoamericana.",
} as const;
