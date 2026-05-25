export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  /** Short hook shown in cards/listings. Keep under 160 chars. */
  excerpt: string;
  /** ISO date, e.g. "2026-05-24" */
  date: string;
  /** Estimated reading time in minutes. */
  readingMinutes: number;
  /** Topical tag: used as the eyebrow above the title and for filtering. */
  category: string;
  author: {
    name: string;
    role: string;
  };
};

export const blogPosts: BlogPostMeta[] = [
  // Ordered newest first: drives the featured-post slot on /blog and the
  // related-posts sort order inside each article.
  {
    slug: "5-motive-sa-automatizezi-conversatiile",
    title: "5 motive să automatizezi conversațiile cu clienții",
    description:
      "De ce să automatizezi conversațiile cu clienții: viteză de răspuns, disponibilitate non-stop, coșuri abandonate, costuri de suport. Cu cifre reale.",
    excerpt:
      "5 motive concrete, fiecare susținut de date din 2025-2026: viteza de răspuns, costuri, disponibilitate, mobil, coșuri abandonate.",
    date: "2026-05-23",
    readingMinutes: 7,
    category: "Strategie",
    author: { name: "Echipa Convia", role: "Convia" },
  },
  {
    slug: "cum-functioneaza-asistentii-ai",
    title: "Cum funcționează asistenții AI pentru clienți",
    description:
      "Ce e în spatele unui asistent AI care răspunde clienților: modele lingvistice, bază de cunoștințe, retrieval. Explicat fără jargon.",
    excerpt:
      "Ce e în spatele unui asistent AI care răspunde clienților, ce face bine și ce încă nu poate. Explicat în limba română, fără jargon.",
    date: "2026-05-14",
    readingMinutes: 8,
    category: "Cum funcționează",
    author: { name: "Echipa Convia", role: "Convia" },
  },
  {
    slug: "ce-este-un-chatbot-ai",
    title: "Ce este un chatbot AI și cum poate ajuta afacerea ta",
    description:
      "Ce diferențiază un chatbot AI de bara FAQ obișnuită, ce face în practică și de ce afacerile din România îl adoptă rapid în 2026.",
    excerpt:
      "Diferența între un buton de FAQ și un chatbot AI care înțelege limba ta, ce face în practică și de ce IMM-urile îl folosesc deja.",
    date: "2026-05-02",
    readingMinutes: 6,
    category: "Bază",
    author: { name: "Echipa Convia", role: "Convia" },
  },
];

export function getPostBySlug(slug: string): BlogPostMeta | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getOtherPosts(slug: string): BlogPostMeta[] {
  return blogPosts.filter((p) => p.slug !== slug);
}

export const SITE_URL = "https://convia.ro";
