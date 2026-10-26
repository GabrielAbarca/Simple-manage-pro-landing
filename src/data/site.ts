// Copy shared by every route: header, menu panel and footer. Verbatim from
// design_handoff_smp_landing; the owner edits strings here, never in markup.

export const headerCopy = {
  demoCta: "Ver la demo",
  openMenu: "Abrir menú",
  closeMenu: "Cerrar menú",
  menuLabel: "Menú",
  primaryNavLabel: "Principal",
} as const;

export const menuContacts = {
  whatsappLabel: "WhatsApp",
  whatsappDisplay: "+506 7184 8300",
  emailLabel: "Correo",
} as const;

export const footerCopy = {
  blurb:
    "Sistema de gestión para colegios. Notas, asistencia, horarios y expedientes en un solo lugar.",
  siteHeading: "Sitio",
  legalHeading: "Legal",
  privacy: "Privacidad",
  terms: "Términos",
  residency: "Expedientes alojados en Estados Unidos, cifrados en tránsito y en reposo.",
  copyright: "© 2026 Simple Manage Pro",
  mepNote: "SMP no reemplaza nada del MEP.",
} as const;

export const scrollCue = "Desplácese";
