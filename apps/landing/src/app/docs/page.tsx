import type { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  Globe,
  Webhook,
  Cog,
  BookOpen,
  ArrowRight,
  Clock,
  Mail,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

export const metadata: Metadata = {
  title: "Documentație",
  description:
    "Documentație tehnică pentru integrarea Convia: widget pe site, conectare WhatsApp Business, API REST și webhooks.",
  alternates: { canonical: "/docs" },
  openGraph: {
    type: "website",
    title: "Convia | Documentație",
    description: "Documentație tehnică pentru integrarea Convia.",
    url: "/docs",
  },
};

export default function DocsPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-y bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="text-center max-w-2xl mx-auto">
              <span className="section-label">Documentație</span>
              <h1 className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy">
                Documentație tehnică
              </h1>
              <p className="mt-5 text-body-lg text-ink-3">
                Pentru cei care integrează Convia direct cu codul propriu. Începem cu widget-ul de
                site (cea mai folosită integrare), restul vine pe parcurs.
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Pornire rapidă cu cod real */}
      <section className="pb-16 bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="max-w-3xl mx-auto card p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
                  <Code2 className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-h4 font-gilroy text-ink leading-tight">
                    Pornire rapidă: widget pe site
                  </h2>
                  <p className="text-[13px] text-soft font-semibold mt-1">
                    Timp estimat: 2 minute
                  </p>
                </div>
              </div>

              <p className="text-[14.5px] text-ink-3 leading-relaxed mb-5">
                Pui scriptul de mai jos înainte de tag-ul de închidere <code className="px-1.5 py-0.5 rounded bg-surface-2 text-ink-2 font-mono text-[13px] border border-line">&lt;/body&gt;</code> pe orice pagină unde vrei să apară botul. Înlocuiești <code className="px-1.5 py-0.5 rounded bg-surface-2 text-ink-2 font-mono text-[13px] border border-line">YOUR_BOT_ID</code> cu ID-ul botului tău din dashboard.
              </p>

              {/* Code block */}
              <pre className="bg-surface-2 border border-line rounded-xl p-5 font-mono text-[13px] leading-relaxed text-ink-2 overflow-x-auto">
                <code>
                  <span className="text-soft">&lt;</span>
                  <span className="text-accent font-semibold">script</span>
                  {"\n  "}
                  <span className="text-[#9333EA]">src</span>
                  <span className="text-ink-3">=</span>
                  <span className="text-[#059669]">&quot;https://convia.ro/w.js&quot;</span>
                  {"\n  "}
                  <span className="text-[#9333EA]">data-bot</span>
                  <span className="text-ink-3">=</span>
                  <span className="text-[#059669]">&quot;YOUR_BOT_ID&quot;</span>
                  {"\n  "}
                  <span className="text-[#9333EA]">async</span>
                  {"\n"}
                  <span className="text-soft">&gt;&lt;/</span>
                  <span className="text-accent font-semibold">script</span>
                  <span className="text-soft">&gt;</span>
                </code>
              </pre>

              <p className="mt-5 text-[14px] text-ink-3 leading-relaxed">
                Funcționează pe WordPress, Shopify, Webflow, Gomag, Magento sau orice site HTML.
                Pe WordPress poți folosi un plugin de tip „Insert Header and Footer” pentru același
                rezultat.
              </p>

              <div className="mt-6 pt-6 border-t border-line">
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-soft mb-3">
                  Atribute disponibile
                </div>
                <ul className="space-y-2 text-[13.5px]">
                  <li className="flex items-start gap-2.5">
                    <code className="px-1.5 py-0.5 rounded bg-surface-2 text-accent font-mono text-[12.5px] border border-line flex-shrink-0">
                      data-bot
                    </code>
                    <span className="text-ink-3">
                      ID-ul botului. Obligatoriu.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <code className="px-1.5 py-0.5 rounded bg-surface-2 text-accent font-mono text-[12.5px] border border-line flex-shrink-0">
                      data-color
                    </code>
                    <span className="text-ink-3">
                      Culoarea accent (hex). Opțional, default e culoarea setată în dashboard.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <code className="px-1.5 py-0.5 rounded bg-surface-2 text-accent font-mono text-[12.5px] border border-line flex-shrink-0">
                      data-position
                    </code>
                    <span className="text-ink-3">
                      „bottom-right” (default) sau „bottom-left”.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <code className="px-1.5 py-0.5 rounded bg-surface-2 text-accent font-mono text-[12.5px] border border-line flex-shrink-0">
                      data-lang
                    </code>
                    <span className="text-ink-3">
                      „ro” (default) sau „en”. Influențează limba interfeței widget-ului.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Coming soon sections */}
      <section className="section-y bg-soft">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="section-label">În lucru</span>
              <h2 className="mt-5 text-h2-mobile sm:text-h2 gradient-ink font-gilroy">
                Restul documentației vine pe parcurs.
              </h2>
              <p className="mt-5 text-body-lg text-ink-3">
                Publicăm fiecare secțiune când o terminăm. Dacă ai nevoie urgent de ceva specific,
                scrie-ne și-ți răspundem în detaliu pe email.
              </p>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {[
              {
                icon: Cog,
                title: "Configurare widget",
                description:
                  "Personalizare avansată: mesaj de bun venit, sugestii rapide, comportament la mobile, declanșatoare.",
                status: "În scriere",
              },
              {
                icon: WhatsAppIcon,
                title: "WhatsApp Business API",
                description:
                  "Conectarea contului oficial de WhatsApp Business, verificarea Meta și gestionarea șabloanelor de mesaje aprobate.",
                status: "Planificat pentru iunie",
              },
              {
                icon: Code2,
                title: "API REST",
                description:
                  "Autentificare, conversații, contacte, agenți, knowledge base. Pentru integrări custom în sistemele tale.",
                status: "Planificat pentru iulie",
              },
              {
                icon: Webhook,
                title: "Webhooks",
                description:
                  "Primește evenimente în timp real direct în sistemele tale (conversație nouă, preluare umană sau mesaj marcat important).",
                status: "Planificat pentru iulie",
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeInOnScroll key={s.title} delay={i * 60}>
                  <div className="card h-full p-6 flex flex-col">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-accent" strokeWidth={2.25} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[16px] font-bold font-gilroy text-ink leading-tight">
                          {s.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-soft">
                          <Clock className="h-3 w-3" strokeWidth={2.5} />
                          {s.status}
                        </div>
                      </div>
                    </div>
                    <p className="text-[13.5px] text-ink-3 leading-relaxed">{s.description}</p>
                  </div>
                </FadeInOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Non-tech link + contact */}
      <section className="section-y bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Link
                href="/ajutor"
                className="group card card-hover p-7 flex flex-col"
              >
                <div className="h-11 w-11 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
                  <BookOpen className="h-5 w-5 text-accent" strokeWidth={2.25} />
                </div>
                <h3 className="text-h4 font-gilroy text-ink mb-2 leading-tight tracking-tight">
                  Vrei explicații non-tehnice?
                </h3>
                <p className="text-[14px] text-ink-3 leading-relaxed mb-5 flex-1">
                  Centrul de ajutor are răspunsuri pentru folosirea botului, fără jargon de
                  dezvoltator.
                </p>
                <span className="inline-flex items-center gap-2 text-accent font-bold text-[14px] group-hover:gap-3 transition-all">
                  Mergi la Ajutor
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>

              <a
                href="mailto:salut@convia.ro?subject=Documenta%C8%9Bie%20%2F%20integrare"
                className="group card card-hover p-7 flex flex-col"
              >
                <div className="h-11 w-11 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
                  <Mail className="h-5 w-5 text-accent" strokeWidth={2.25} />
                </div>
                <h3 className="text-h4 font-gilroy text-ink mb-2 leading-tight tracking-tight">
                  Întrebări tehnice specifice?
                </h3>
                <p className="text-[14px] text-ink-3 leading-relaxed mb-5 flex-1">
                  Scrie-ne pe email cu ce vrei să integrezi. Răspundem cu detalii și exemple
                  concrete.
                </p>
                <span className="inline-flex items-center gap-2 text-accent font-bold text-[14px] group-hover:gap-3 transition-all">
                  Scrie pe email
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
