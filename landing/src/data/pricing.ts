export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  monthly: number; // RON per month, billed monthly (excluding TVA)
  yearly: number; // RON per month, billed yearly (excluding TVA)
  overage?: number; // RON per extra conversation beyond the included monthly cap
  highlight?: boolean;
  cta: { label: string; href: string };
  features: string[];
};

export const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Gratuit",
    description: "Pentru a testa Convia fără niciun risc.",
    monthly: 0,
    yearly: 0,
    cta: { label: "Începe gratuit", href: "#waitlist" },
    features: [
      "1 chatbot",
      "100 conversații pe lună",
      "Conectare site web",
      "Model AI standard",
      "Branding Convia",
      "Suport prin email",
    ],
  },
  {
    id: "business",
    name: "Business",
    description: "Pentru afaceri mici care vor să automatizeze suportul.",
    monthly: 149,
    yearly: 119,
    overage: 0.25,
    highlight: true,
    cta: { label: "Începe gratuit 14 zile", href: "#waitlist" },
    features: [
      "3 chatboți",
      "1.000 conversații pe lună incluse",
      "Site web + WhatsApp",
      "Modele AI premium (OpenAI și Anthropic)",
      "Branding personalizat",
      "Preluare umană",
      "Suport prioritar în română",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Pentru afaceri cu volum mare de conversații.",
    monthly: 349,
    yearly: 279,
    overage: 0.12,
    cta: { label: "Începe gratuit 14 zile", href: "#waitlist" },
    features: [
      "Chatboți nelimitați",
      "5.000 conversații pe lună incluse",
      "Toate canalele (Site, WhatsApp, Messenger, Instagram)",
      "Modele AI premium + acces prioritar la modele noi",
      "Statistici avansate",
      "Integrare cu CRM și calendar",
      "Manager de cont dedicat",
    ],
  },
];

export const enterprisePlan = {
  name: "Enterprise",
  description: "Pentru companii mari cu nevoi specifice.",
  features: [
    "Conversații nelimitate",
    "Chatboți nelimitați",
    "Acord prelucrare date (DPA)",
    "SLA garantat",
    "Onboarding cu echipa noastră",
    "Integrare custom cu sistemele tale",
  ],
  cta: { label: "Programează o discuție", href: "#contact" },
};
