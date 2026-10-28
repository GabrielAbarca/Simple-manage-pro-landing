const ORIGIN = "https://simplemanagepro.com";

export function breadcrumbLd(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: `${ORIGIN}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: `${ORIGIN}${path.replace(/\/$/, "")}/`,
      },
    ],
  };
}

export function faqLd(items: readonly { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
