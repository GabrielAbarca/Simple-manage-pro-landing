// Contacto copy, verbatim from design_handoff_smp_landing/design/*/Contacto.dc.html.
// Hrefs are built from src/config.ts so the number, the address and the
// WhatsApp prefill stay single-sourced.

import type { IconName } from "../components/ui/icons";
import { EMAIL, WA_MSG_PRODUCTO, mailtoHref, waHref } from "../config";

export const contactoMeta = {
  title: "Contacto",
  description:
    "Escríbanos por WhatsApp o por correo electrónico, o postule a su colegio al Piloto 2027. Respondemos en las próximas 24 horas hábiles.",
  breadcrumb: "Contacto",
} as const;

export const contactoHeroCopy = {
  headline: ["Hablemos de", "su colegio."],
  lead: "Escríbanos por el medio que prefiera. Respondemos en las próximas 24 horas hábiles.",
} as const;

export const copyFeedback = {
  success: "Copiado.",
  failure: "No se pudo copiar. Selecciónelo manualmente.",
} as const;

export interface ContactCardAction {
  label: string;
  href: string;
  /** Opens in a new tab (WhatsApp leaves the site). */
  external?: boolean;
  /** Ends the pill in a 24px rule, as card 03 does. */
  withRule?: boolean;
}

export interface ContactCardCopyButton {
  /** Visible label; the same on every card. */
  label: string;
  /** Accessible name, so the two "Copiar" buttons are told apart. */
  accessibleLabel: string;
  /** Exactly what lands on the clipboard. */
  value: string;
}

export interface ContactCardContent {
  icon: IconName;
  number: string;
  title: string;
  description: string;
  valueLabel: string;
  value: string;
  /** Omit when the value is plain text rather than a link. */
  valueHref?: string;
  /** Long unbroken values (the address) may wrap anywhere. */
  valueWrapsAnywhere?: boolean;
  /** Tabular figures for the phone number. */
  valueIsNumeric?: boolean;
  primaryAction: ContactCardAction;
  copyButton?: ContactCardCopyButton;
}

const PHONE_DISPLAY = "+506 7184-8300";
const COPY_LABEL = "Copiar";

export const contactCards: readonly ContactCardContent[] = [
  {
    icon: "call",
    number: "01",
    title: "WhatsApp",
    description: "Para consultas rápidas o coordinar una llamada.",
    valueLabel: "Teléfono",
    value: PHONE_DISPLAY,
    valueHref: "tel:+50671848300",
    valueIsNumeric: true,
    primaryAction: { label: "Abrir WhatsApp", href: waHref(WA_MSG_PRODUCTO), external: true },
    copyButton: { label: COPY_LABEL, accessibleLabel: "Copiar número", value: PHONE_DISPLAY },
  },
  {
    icon: "mail",
    number: "02",
    title: "Correo electrónico",
    description: "Para consultas con más detalle o documentos adjuntos.",
    valueLabel: "Correo",
    value: EMAIL,
    valueHref: mailtoHref(),
    valueWrapsAnywhere: true,
    primaryAction: { label: "Escribir un correo", href: mailtoHref("Consulta sobre Simple Manage Pro") },
    copyButton: { label: COPY_LABEL, accessibleLabel: "Copiar correo", value: EMAIL },
  },
  {
    icon: "edit_note",
    number: "03",
    title: "Piloto 2027",
    description: "Para postular a su colegio al curso lectivo 2027.",
    valueLabel: "Formulario",
    value: "Postulación",
    primaryAction: { label: "Llenar el formulario", href: "/piloto/#postular", withRule: true },
  },
];
