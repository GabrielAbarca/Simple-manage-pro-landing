// Single source for the values that appear on more than one route. DEMO_URL
// used to be declared separately in Header.astro and index.astro; at five
// routes that becomes five copies and one of them eventually goes stale.

export const DEMO_URL = "https://demo.simplemanagepro.com";

// Legal pages live on the demo origin. BRIEF §9: link them, never copy them:
// two divergent privacy policies is a real liability.
export const PRIVACY_URL = `${DEMO_URL}/privacy.html`;
export const TERMS_URL = `${DEMO_URL}/terms.html`;

// wa.me wants digits only, country code first (506 = CR).
export const WHATSAPP = "50671848300";
export const EMAIL = "contact@gzelaya.com";

// Two prefills: the pilot one everywhere a director is deciding whether to
// apply, the product one where the reader is still evaluating the software.
export const WA_MSG_PILOTO =
  "Buenas, soy director/a de [colegio] y quisiera conocer más sobre el piloto 2027.";
export const WA_MSG_PRODUCTO =
  "Buenas, soy director/a de [colegio] y quisiera conocer más sobre Simple Manage Pro.";

export function waHref(message: string = WA_MSG_PILOTO): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export const mailtoHref = (subject?: string): string =>
  subject ? `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}` : `mailto:${EMAIL}`;

// Hrefs carry the trailing slash the build serves (trailingSlash: "always"),
// so a nav click never costs a redirect.
export const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/producto/", label: "Producto" },
  { href: "/piloto/", label: "Piloto 2027" },
  { href: "/nosotros/", label: "Nosotros" },
  { href: "/contacto/", label: "Contacto" },
] as const;

// The design's three layouts. CSS uses the same numbers as min-width queries;
// the 3D scenes read them through matchMedia (src/scripts/core/breakpoints.ts).
export const BREAKPOINTS = { tablet: 768, desktop: 1200 } as const;

export const SITE_NAME = "Simple Manage Pro";
