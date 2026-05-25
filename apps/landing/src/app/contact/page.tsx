import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MessageSquare,
  Newspaper,
  Scale,
  MapPin,
  Clock,
} from "lucide-react";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Scrie-ne. Echipa Convia răspunde în limba română, de obicei în mai puțin de 24 de ore. Vânzări, suport, presă, juridic.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    title: "Convia | Contact",
    description:
      "Scrie-ne. Echipa Convia răspunde în limba română, de obicei în mai puțin de 24 de ore.",
    url: "/contact",
  },
};

const channels = [
  {
    icon: MessageSquare,
    label: "Vânzări și demo",
    description: "Vrei să vezi platforma, să primești un demo personalizat sau o ofertă pentru afacerea ta.",
    email: "salut@convia.ro",
    cta: "Programează un demo",
    href: "mailto:salut@convia.ro?subject=Vreau%20un%20demo",
    accent: true,
  },
  {
    icon: Mail,
    label: "Suport tehnic",
    description: "Ești deja client și ai nevoie de ajutor cu botul tău, integrările sau facturarea.",
    email: "salut@convia.ro",
    cta: "Scrie la suport",
    href: "mailto:salut@convia.ro?subject=Suport%20tehnic",
  },
  {
    icon: Newspaper,
    label: "Presă și parteneriate",
    description: "Lucrezi în presă, faci podcast sau vrei să dezvoltăm ceva împreună.",
    email: "salut@convia.ro",
    cta: "Trimite o propunere",
    href: "mailto:salut@convia.ro?subject=Pres%C4%83%20%2F%20parteneriat",
  },
  {
    icon: Scale,
    label: "Juridic și GDPR",
    description: "Pentru DPA, întrebări legate de protecția datelor, contracte sau aspecte legale.",
    email: "salut@convia.ro",
    cta: "Contact juridic",
    href: "mailto:salut@convia.ro?subject=Juridic%20%2F%20GDPR",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-y bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="text-center max-w-2xl mx-auto">
              <span className="section-label">Contact</span>
              <h1 className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy">
                Hai să vorbim. Răspundem repede.
              </h1>
              <p className="mt-5 text-body-lg text-ink-3">
                Echipa noastră răspunde în limba română, de obicei în mai puțin de 24 de ore. Scrie-ne
                cum te ajută cel mai mult, pe email, în limba română, fără formalism.
              </p>
            </div>
          </FadeInOnScroll>

          {/* SLA strip */}
          <FadeInOnScroll>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px]">
              <span className="inline-flex items-center gap-2 text-ink-2 font-semibold">
                <Clock className="h-4 w-4 text-accent" strokeWidth={2.5} />
                Răspuns mediu: sub 24 ore
              </span>
              <span className="h-3 w-px bg-line-strong" aria-hidden="true" />
              <span className="inline-flex items-center gap-2 text-ink-2 font-semibold">
                <span className="text-base leading-none">🇷🇴</span>
                Suport 100% în română
              </span>
              <span className="h-3 w-px bg-line-strong" aria-hidden="true" />
              <span className="inline-flex items-center gap-2 text-ink-2 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                Echipă online L–V, 09:00–18:00
              </span>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Contact cards */}
      <section className="pb-16 bg-white">
        <div className="container-x">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {channels.map((c, i) => {
              const Icon = c.icon;
              return (
                <FadeInOnScroll key={c.label} delay={i * 60}>
                  <a
                    href={c.href}
                    className={`group relative block h-full p-7 rounded-2xl border transition-all ${
                      c.accent
                        ? "bg-white border-accent shadow-[0_20px_50px_-10px_rgba(29,78,216,0.18)] ring-1 ring-accent/20"
                        : "bg-white border-line shadow-card hover:shadow-card-lg hover:border-line-strong"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-11 w-11 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-accent" strokeWidth={2.25} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-h4 font-gilroy text-ink leading-tight tracking-tight mb-2">
                          {c.label}
                        </h3>
                        <p className="text-[14.5px] text-ink-3 leading-relaxed mb-4">
                          {c.description}
                        </p>
                        <span className="inline-flex items-center gap-2 text-accent font-bold text-[14px] group-hover:gap-3 transition-all">
                          {c.cta}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                        <div className="mt-2 text-[12.5px] text-soft font-semibold">{c.email}</div>
                      </div>
                    </div>
                  </a>
                </FadeInOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company / address */}
      <section className="section-y bg-soft">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="mx-auto max-w-3xl">
              <div className="card p-8 sm:p-10">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-accent" strokeWidth={2.25} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-h4 font-gilroy text-ink mb-2">Sediu social</h2>
                    <p className="text-[14.5px] text-ink-3 leading-relaxed mb-4">
                      Convia este o marcă operată de <strong>NORTEC BLANC S.R.L.</strong>, companie
                      înregistrată și plătitoare de TVA în România.
                    </p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[13.5px]">
                      <div className="sm:col-span-2">
                        <dt className="font-bold uppercase tracking-[0.06em] text-[11px] text-soft">
                          Adresă
                        </dt>
                        <dd className="text-ink-2 font-semibold mt-0.5">
                          Sat Ciofrângeni, Comuna Ciofrângeni, Nr. 257 bis, corp C16, Județ Argeș,
                          România
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold uppercase tracking-[0.06em] text-[11px] text-soft">
                          CUI
                        </dt>
                        <dd className="text-ink-2 font-semibold mt-0.5">41773828</dd>
                      </div>
                      <div>
                        <dt className="font-bold uppercase tracking-[0.06em] text-[11px] text-soft">
                          Reg. Comerțului
                        </dt>
                        <dd className="text-ink-2 font-semibold mt-0.5">J3/2526/2019</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-center text-[13px] text-soft">
                Mai degrabă pe email? Scrie-ne direct la{" "}
                <a
                  href="mailto:salut@convia.ro"
                  className="text-accent font-bold hover:underline"
                >
                  salut@convia.ro
                </a>
                .
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
