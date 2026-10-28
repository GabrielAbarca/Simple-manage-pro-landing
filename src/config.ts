export const DEMO_URL = "https://demo.simplemanagepro.com";

export const PRIVACY_URL = `${DEMO_URL}/privacy.html`;
export const TERMS_URL = `${DEMO_URL}/terms.html`;

export const WHATSAPP = "12242164181";
export const EMAIL = "contact@gzelaya.com";

export const WA_MSG_PILOTO =
  "Buenas, soy director/a de [colegio] y quisiera conocer más sobre el piloto 2027.";
export const WA_MSG_PRODUCTO =
  "Buenas, soy director/a de [colegio] y quisiera conocer más sobre Simple Manage Pro.";

export function waHref(message: string = WA_MSG_PILOTO): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export const mailtoHref = (subject?: string): string =>
  subject ? `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}` : `mailto:${EMAIL}`;

export const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/producto/", label: "Producto" },
  { href: "/piloto/", label: "Piloto 2027" },
  { href: "/nosotros/", label: "Nosotros" },
  { href: "/contacto/", label: "Contacto" },
] as const;

export const BREAKPOINTS = { tablet: 768, desktop: 1200 } as const;

export const SITE_NAME = "Simple Manage Pro";
