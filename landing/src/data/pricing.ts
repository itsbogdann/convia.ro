export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  monthly: number; // EUR, excluding TVA
  yearly: number; // EUR per month when billed yearly
  highlight?: boolean;
  cta: { label: string; href: string };
  features: string[];
};

export const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Pentru a testa Convia fără niciun risc.",
    monthly: 0,
    yearly: 0,
    cta: { label: "Începe gratuit", href: "#waitlist" },
    features: [
      "1 chatbot",
      "200 conversații pe lună",
      "Conectare site web",
      "Model GPT-4o mini",
      "Branding Convia",
      "Suport prin email",
    ],
  },
  {
    id: "start",
    name: "Start",
    description: "Pentru afaceri mici care vor să automatizeze suportul.",
    monthly: 29,
    yearly: 23,
    highlight: true,
    cta: { label: "Începe gratuit 14 zile", href: "#waitlist" },
    features: [
      "3 chatboți",
      "2.000 conversații pe lună",
      "Site web + WhatsApp",
      "Toate modelele AI (GPT-4o, Claude)",
      "Branding personalizat",
      "Preluare umană",
      "Suport prioritar în română",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Pentru afaceri cu volum mare de conversații.",
    monthly: 89,
    yearly: 71,
    cta: { label: "Începe gratuit 14 zile", href: "#waitlist" },
    features: [
      "10 chatboți",
      "10.000 conversații pe lună",
      "Toate canalele (Site, WhatsApp, Messenger, Instagram)",
      "Toate modelele AI premium",
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
