import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Sparkles, Wrench, Minus, Bell, Mail, ArrowRight } from "lucide-react";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

export const metadata: Metadata = {
  title: "Schimbări",
  description:
    "Tot ce am adăugat, rezolvat sau scos din Convia. Istoric de actualizări cu data fiecărei lansări.",
  alternates: { canonical: "/schimbari" },
  openGraph: {
    type: "website",
    title: "Schimbări · Convia",
    description: "Istoric de actualizări pentru platforma Convia.",
    url: "/schimbari",
  },
};

type ChangeType = "added" | "improved" | "fixed" | "removed";

type Change = {
  type: ChangeType;
  text: string;
};

type Release = {
  version: string;
  date: string;
  title: string;
  description?: string;
  changes: Change[];
};

const releases: Release[] = [
  {
    version: "v0.9.0",
    date: "15 mai 2026",
    title: "Beta deschis",
    description: "Deschidem accesul pentru primii 100 de utilizatori înscriși pe lista de așteptare.",
    changes: [
      { type: "added", text: "Onboarding ghidat cu echipa Convia, în 30 minute" },
      { type: "added", text: "Setup gratuit pentru clienții care nu vor să-l facă singuri" },
      { type: "improved", text: "Viteza de indexare a site-urilor (de 2-3x mai rapid)" },
      { type: "improved", text: "Mesajele de eroare la încărcarea fișierelor PDF" },
    ],
  },
  {
    version: "v0.8.0",
    date: "1 mai 2026",
    title: "Inbox comun și preluare umană",
    changes: [
      { type: "added", text: "Inbox comun pentru toți colegii din echipă" },
      { type: "added", text: "Preluare umană dintr-un click, păstrând tot contextul conversației" },
      { type: "added", text: "Notificări pe email când botul nu știe un răspuns" },
      { type: "improved", text: "Răspunsuri în limba română pentru regionalisme (mersi, mulțam, k)" },
      { type: "fixed", text: "Diacritice corecte în notificările push pe mobile" },
    ],
  },
  {
    version: "v0.7.0",
    date: "15 aprilie 2026",
    title: "Conectare WhatsApp Business",
    changes: [
      { type: "added", text: "Integrare cu WhatsApp Business API (oficial, prin Meta)" },
      { type: "added", text: "Sincronizare conversații WhatsApp în același inbox cu site-ul" },
      { type: "improved", text: "Indexarea PDF-urilor cu structură complexă (tabele, coloane)" },
    ],
  },
  {
    version: "v0.6.0",
    date: "1 aprilie 2026",
    title: "Alpha intern",
    description: "Prima versiune funcțională, testată cu 12 afaceri din rețeaua noastră.",
    changes: [
      { type: "added", text: "Primul prototip funcțional al botului AI" },
      {
        type: "added",
        text: "Răspunsuri pe baza informațiilor încărcate (site web, PDF, fișiere Excel sau text scris direct)",
      },
      { type: "added", text: "Widget de chat integrabil pe orice site cu o linie de cod" },
    ],
  },
];

const typeConfig: Record<
  ChangeType,
  { icon: typeof Plus; label: string; chip: string; iconBg: string }
> = {
  added: {
    icon: Plus,
    label: "Adăugat",
    chip: "bg-success/10 text-success border-success/20",
    iconBg: "bg-success",
  },
  improved: {
    icon: Sparkles,
    label: "Îmbunătățit",
    chip: "bg-accent-soft text-accent border-accent-ring/30",
    iconBg: "bg-accent",
  },
  fixed: {
    icon: Wrench,
    label: "Reparat",
    chip: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    iconBg: "bg-[#F59E0B]",
  },
  removed: {
    icon: Minus,
    label: "Scos",
    chip: "bg-slate-100 text-slate-600 border-slate-200",
    iconBg: "bg-slate-500",
  },
};

export default function ChangelogPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-y bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="text-center max-w-2xl mx-auto">
              <span className="section-label">Schimbări</span>
              <h1 className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy">
                Tot ce am adăugat sau reparat.
              </h1>
              <p className="mt-5 text-body-lg text-ink-3">
                Publicăm fiecare actualizare aici, cu detalii reale despre ce s-a schimbat. Cele
                noi sunt sus.
              </p>
            </div>
          </FadeInOnScroll>

          {/* Legend chips */}
          <FadeInOnScroll>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {(Object.entries(typeConfig) as [ChangeType, (typeof typeConfig)[ChangeType]][]).map(
                ([type, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <span
                      key={type}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11.5px] font-bold ${cfg.chip}`}
                    >
                      <Icon className="h-3 w-3" strokeWidth={2.5} />
                      {cfg.label}
                    </span>
                  );
                }
              )}
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-20 bg-white">
        <div className="container-x">
          <div className="mx-auto max-w-3xl relative">
            {/* Vertical line */}
            <div
              className="hidden sm:block absolute left-[19px] top-3 bottom-3 w-px bg-line"
              aria-hidden="true"
            />

            <ul className="space-y-10">
              {releases.map((r, ri) => (
                <li key={r.version} className="relative">
                  <FadeInOnScroll delay={ri * 60}>
                    <div className="flex gap-5">
                      {/* Version dot */}
                      <div className="hidden sm:flex flex-shrink-0 relative z-10">
                        <div className="h-10 w-10 rounded-full bg-white border-2 border-accent flex items-center justify-center shadow-card">
                          <span className="h-2 w-2 rounded-full bg-accent" />
                        </div>
                      </div>

                      {/* Card */}
                      <div className="flex-1 card p-6 sm:p-7">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                          <span className="text-h5 font-gilroy text-ink leading-none tracking-tight">
                            {r.title}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent-soft text-accent text-[11px] font-bold border border-accent-ring/30">
                            {r.version}
                          </span>
                          <span className="text-[12.5px] font-semibold text-soft">{r.date}</span>
                        </div>

                        {r.description && (
                          <p className="text-[14.5px] text-ink-3 leading-relaxed mb-4">
                            {r.description}
                          </p>
                        )}

                        <ul className="space-y-2.5">
                          {r.changes.map((ch, i) => {
                            const cfg = typeConfig[ch.type];
                            const Icon = cfg.icon;
                            return (
                              <li key={i} className="flex items-start gap-3">
                                <span
                                  className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full ${cfg.iconBg} flex-shrink-0`}
                                >
                                  <Icon className="h-3 w-3 text-white" strokeWidth={3} />
                                </span>
                                <span className="text-[14px] text-ink-2 leading-relaxed">
                                  {ch.text}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </FadeInOnScroll>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Subscribe + related */}
      <section className="section-y bg-soft">
        <div className="container-x">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <FadeInOnScroll>
              <div className="card p-7 h-full flex flex-col">
                <div className="h-11 w-11 rounded-xl bg-accent flex items-center justify-center mb-4 shadow-[0_8px_20px_-6px_rgba(29,78,216,0.4)]">
                  <Bell className="h-5 w-5 text-white" strokeWidth={2.25} />
                </div>
                <h2 className="text-h4 font-gilroy text-ink mb-2 leading-tight">
                  Vrei să fii anunțat?
                </h2>
                <p className="text-[14px] text-ink-3 leading-relaxed mb-5 flex-1">
                  Primești un email scurt la fiecare lansare. Maxim 2 pe lună. Nimic altceva.
                </p>
                <form
                  action="mailto:salut@convia.ro"
                  method="post"
                  encType="text/plain"
                  className="flex flex-col sm:flex-row items-stretch gap-2"
                >
                  <label htmlFor="changelog-email" className="sr-only">
                    Adresa ta de email
                  </label>
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soft" />
                    <input
                      id="changelog-email"
                      type="email"
                      name="email"
                      placeholder="nume@firma.ro"
                      required
                      className="w-full h-11 pl-11 pr-4 rounded-full border border-line-strong bg-white text-[14px] font-semibold text-ink placeholder:text-soft focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <button type="submit" className="btn-primary btn-sm">
                    Abonează-mă
                  </button>
                </form>
              </div>
            </FadeInOnScroll>

            <FadeInOnScroll delay={80}>
              <Link href="/status" className="group card card-hover p-7 h-full flex flex-col">
                <div className="h-11 w-11 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
                  <Sparkles className="h-5 w-5 text-accent" strokeWidth={2.25} />
                </div>
                <h2 className="text-h4 font-gilroy text-ink mb-2 leading-tight">
                  Verifică statusul live
                </h2>
                <p className="text-[14px] text-ink-3 leading-relaxed mb-5 flex-1">
                  Vezi în timp real ce componente funcționează și istoricul de uptime al
                  platformei.
                </p>
                <span className="inline-flex items-center gap-2 text-accent font-bold text-[14px] group-hover:gap-3 transition-all">
                  Mergi la Status
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </FadeInOnScroll>
          </div>
        </div>
      </section>
    </>
  );
}
