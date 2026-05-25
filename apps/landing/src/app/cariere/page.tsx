import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Rocket,
  Heart,
  Coffee,
  Map,
  Zap,
  Send,
  Mail,
} from "lucide-react";
import { Mascot } from "@/components/ui/brand-mark";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

export const metadata: Metadata = {
  title: "Cariere",
  description:
    "Vino în echipa Convia. Construim primul chatbot AI pentru afaceri din România. Echipă mică, impact mare, decizii rapide.",
  alternates: { canonical: "/cariere" },
  openGraph: {
    type: "website",
    title: "Convia | Cariere",
    description: "Vino în echipa Convia. Construim primul chatbot AI gândit pentru România.",
    url: "/cariere",
  },
};

const perks = [
  {
    icon: Rocket,
    title: "Companie tânără, decizii rapide",
    description:
      "Fără 7 niveluri de aprobare. Vezi efectul muncii tale într-o săptămână, nu într-un trimestru.",
  },
  {
    icon: Heart,
    title: "Lucrăm pentru oameni din RO",
    description:
      "Clienții noștri sunt patroni de hoteluri, magazine, restaurante. Munca ta îi ajută direct.",
  },
  {
    icon: Map,
    title: "Remote-first, din orice oraș",
    description:
      "Lucrezi de unde vrei, când e mai bine pentru tine. Întâlniri scurte, focus pe rezultat.",
  },
  {
    icon: Coffee,
    title: "Echipă tehnică care îți dă spațiu",
    description:
      "Tooling modern, code review serios, decizii bazate pe argumente. Fără birocrație inutilă.",
  },
  {
    icon: Zap,
    title: "Stack modern, învățare continuă",
    description:
      "TypeScript, Next.js, NestJS, AI providers de top. Plus buget pentru cursuri și cărți.",
  },
  {
    icon: Send,
    title: "Pachete competitive în RON",
    description:
      "Salariu raportat la piața RO, bonus de performanță, plus 25 de zile de concediu/an.",
  },
];

export default function CareersPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-y bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="text-center max-w-3xl mx-auto">
              <span className="section-label">Cariere</span>
              <h1 className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy">
                Construiește cu noi primul AI chatbot<br className="hidden sm:block" /> gândit pentru România.
              </h1>
              <p className="mt-5 text-body-lg text-ink-3">
                Suntem o echipă mică care construiește un produs serios. Dacă vrei să lucrezi pe
                ceva ce contează pentru afaceri reale, citește mai departe.
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Perks */}
      <section className="pb-20 bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="section-label">De ce Convia</span>
              <h2 className="mt-5 text-h2-mobile sm:text-h2 gradient-ink font-gilroy">
                Cum e să lucrezi cu noi.
              </h2>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks.map((p, i) => {
              const Icon = p.icon;
              return (
                <FadeInOnScroll key={p.title} delay={i * 60}>
                  <div className="card card-hover h-full p-6">
                    <div className="h-11 w-11 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-accent" strokeWidth={2.25} />
                    </div>
                    <h3 className="text-[17px] font-bold font-gilroy text-ink mb-2 leading-tight tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-[14px] text-ink-3 leading-relaxed">{p.description}</p>
                  </div>
                </FadeInOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open positions: empty state */}
      <section className="section-y bg-soft">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="section-label">Poziții deschise</span>
              <h2 className="mt-5 text-h2-mobile sm:text-h2 gradient-ink font-gilroy">
                Momentan nu avem roluri active.
              </h2>
              <p className="mt-5 text-body-lg text-ink-3">
                Echipa noastră crește atent. Dacă te potrivești cu valorile noastre și ai un skill
                puternic în engineering, produs, design sau marketing, scrie-ne. Păstrăm CV-ul
                tău și te contactăm când apare ceva.
              </p>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll>
            <div className="mx-auto max-w-2xl card p-8 sm:p-10 text-center">
              <div className="flex justify-center mb-5">
                <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(29,78,216,0.4)]">
                  <Mascot size={36} bodyColor="#FFFFFF" eyeColor="#FFFFFF" />
                </div>
              </div>
              <h3 className="text-h4 font-gilroy text-ink mb-3">
                Trimite-ne CV-ul tău spontan
              </h3>
              <p className="text-[14.5px] text-ink-3 leading-relaxed mb-7">
                Spune-ne în 2 paragrafe ce te interesează la Convia și de ce crezi că am avea nevoie
                de tine. Atașează CV-ul (PDF) și link-uri către proiecte sau profil LinkedIn.
              </p>
              <a
                href="mailto:salut@convia.ro?subject=Aplica%C8%9Bie%20spontan%C4%83%20%E2%80%94%20Cariere"
                className="btn-primary"
              >
                <Mail className="h-4 w-4" />
                Aplică prin email
              </a>
              <div className="mt-4 text-[12.5px] text-soft font-semibold">
                salut@convia.ro · răspundem în maximum 5 zile lucrătoare
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="section-y bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="mx-auto max-w-3xl text-center p-10 sm:p-14 rounded-3xl border border-line bg-gradient-to-br from-white to-accent-soft/40 shadow-card-lg">
              <h2 className="text-h2-mobile sm:text-h2 gradient-ink font-gilroy max-w-xl mx-auto">
                Curios cine suntem?
              </h2>
              <p className="mt-5 text-body-lg text-ink-3 max-w-lg mx-auto">
                Citește mai multe despre echipă, despre valorile noastre și de ce am început.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <Link href="/despre-noi" className="btn-primary btn-lg">
                  Despre noi
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="btn-secondary btn-lg">
                  Contact
                </Link>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
