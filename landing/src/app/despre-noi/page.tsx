import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  MessageSquareHeart,
} from "lucide-react";
import { Mascot } from "@/components/ui/brand-mark";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { team } from "@/data/team";

export const metadata: Metadata = {
  title: "Despre noi",
  description:
    "Convia construiește primul chatbot AI gândit pentru afacerile din România. Suntem o echipă mică, 100% românească, focusată pe IMM-uri și antreprenori.",
  alternates: { canonical: "/despre-noi" },
  openGraph: {
    type: "website",
    title: "Despre noi · Convia",
    description:
      "Cine suntem și de ce am construit Convia: primul chatbot AI gândit pentru afaceri din România.",
    url: "/despre-noi",
  },
};

const values = [
  {
    icon: HeartHandshake,
    title: "Construim pentru oameni reali",
    description:
      "Nu pentru ingineri. Convia trebuie să poată fi pornit într-o duminică seara de un patron de restaurant care n-a scris cod în viața lui.",
  },
  {
    icon: MessageSquareHeart,
    title: "Limba română contează",
    description:
      "Diacritice, regionalisme, prescurtări, formule de politețe. Tot ce face conversația să sune natural — nu o traducere stângace de pe engleză.",
  },
  {
    icon: ShieldCheck,
    title: "Date sigure, fără jocuri",
    description:
      "Companie românească, facturare cu firmă din RO, GDPR aplicat serios. Datele clienților tăi nu antrenează nimic și nu pleacă unde nu trebuie.",
  },
  {
    icon: Sparkles,
    title: "Onești despre AI",
    description:
      "Botul nu e magic. Spune ce știe, recunoaște ce nu știe, predă mai departe omului. Fără halucinații vândute ca trăsnaie.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-y bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="text-center max-w-3xl mx-auto">
              <span className="section-label">Despre noi</span>
              <h1 className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy">
                Construim chatbot-ul AI<br className="hidden sm:block" /> pe care l-am vrea ca antreprenori.
              </h1>
              <p className="mt-5 text-body-lg text-ink-3">
                Convia s-a născut dintr-o frustrare simplă: toți chatboții AI buni erau construiți
                pentru engleză, pentru companii mari și pentru oameni care înțeleg cod. România
                merita ceva propriu.
              </p>
            </div>
          </FadeInOnScroll>

          {/* Stats strip */}
          <FadeInOnScroll>
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-px bg-line rounded-2xl overflow-hidden border border-line shadow-card max-w-4xl mx-auto">
              {[
                { value: "100%", label: "Nativ în română" },
                { value: "GDPR", label: "Companie din RO" },
                { value: "5 min", label: "De la cont la live" },
                { value: "24/7", label: "Bot disponibil" },
              ].map((s) => (
                <div key={s.label} className="bg-white p-6 text-center">
                  <div className="text-h3 font-gilroy text-ink leading-none">{s.value}</div>
                  <div className="mt-2 text-[12px] font-bold uppercase tracking-[0.08em] text-soft">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Story */}
      <section className="section-y bg-soft">
        <div className="container-x">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <FadeInOnScroll className="lg:col-span-5">
              <div>
                <span className="section-label">Povestea</span>
                <h2 className="mt-5 text-h2-mobile sm:text-h2 gradient-ink font-gilroy">
                  De ce există Convia.
                </h2>
              </div>
            </FadeInOnScroll>
            <FadeInOnScroll className="lg:col-span-7" delay={100}>
              <div className="space-y-5 text-body text-ink-3 leading-relaxed">
                <p>
                  Lucrăm cu antreprenori români de ani buni — patroni de hoteluri, magazine online,
                  saloane, restaurante. Le vedeam aceeași problemă: clienții scriu pe site sau pe
                  WhatsApp la ore imposibile și nimeni nu apucă să răspundă. Comenzi pierdute,
                  rezervări care merg la concurență, întrebări simple care se repetă de 50 de ori
                  pe zi.
                </p>
                <p>
                  Existau soluții. Toate construite pentru piețe mari, în engleză, cu prețuri în
                  dolari și interfețe pe care doar IT-iștii le înțelegeau. Pentru un patron de
                  pensiune din România, era ca și cum nu ar fi existat.
                </p>
                <p>
                  Așa am început Convia: un chatbot AI care înțelege limba ta, prețuri în lei,
                  factură cu firmă românească și o experiență gândită pentru oameni care vor să
                  rezolve problema, nu să învețe un soft nou. În 5 minute, nu în 5 zile.
                </p>
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-y bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="text-center max-w-2xl mx-auto">
              <span className="section-label">Valorile noastre</span>
              <h2 className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy">
                În ce credem când scriem cod.
              </h2>
            </div>
          </FadeInOnScroll>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <FadeInOnScroll key={v.title} delay={i * 70}>
                  <div className="card card-hover h-full p-7">
                    <div className="h-11 w-11 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-5">
                      <Icon className="h-5 w-5 text-accent" strokeWidth={2.25} />
                    </div>
                    <h3 className="text-h4 font-gilroy text-ink mb-2 leading-tight tracking-tight">
                      {v.title}
                    </h3>
                    <p className="text-[14.5px] text-ink-3 leading-relaxed">{v.description}</p>
                  </div>
                </FadeInOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-y bg-soft">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="text-center max-w-2xl mx-auto">
              <span className="section-label">Echipa</span>
              <h2 className="mt-5 text-h2-mobile sm:text-h2 gradient-ink font-gilroy">
                O echipă mică, 100% din România.
              </h2>
              <p className="mt-5 text-body-lg text-ink-3">
                Suntem oameni care răspund la email-uri, vorbesc românește la telefon și știu cum
                arată o factură de la ANAF. Convia e construită aici, în țară.
              </p>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll>
            <div className="mt-12 flex items-center justify-center">
              <AnimatedTooltip items={team} />
            </div>
            <p className="mt-6 text-center text-[13px] font-semibold text-ink-3">
              <span className="text-success">●</span>{" "}
              <span className="text-ink-2">5 colegi</span>{" "}
              <span className="text-soft">· angajăm constant</span>{" "}
              <Link href="/cariere" className="text-accent font-bold hover:underline">
                — vezi pozițiile deschise
              </Link>
            </p>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Company info */}
      <section className="section-y bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="max-w-3xl mx-auto card p-8 sm:p-10">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-5 w-5 text-accent" strokeWidth={2.25} />
                </div>
                <div className="flex-1">
                  <h2 className="text-h4 font-gilroy text-ink mb-2">Datele societății</h2>
                  <p className="text-[14.5px] text-ink-3 leading-relaxed mb-4">
                    Convia este o marcă operată de <strong>NORTEC BLANC S.R.L.</strong>, companie
                    înregistrată în România. Toate facturile și contractele se emit pe firma din RO,
                    cu CUI și TVA conforme.
                  </p>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[13.5px]">
                    <div>
                      <dt className="font-bold uppercase tracking-[0.06em] text-[11px] text-soft">
                        Denumire
                      </dt>
                      <dd className="text-ink-2 font-semibold mt-0.5">NORTEC BLANC S.R.L.</dd>
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
                    <div>
                      <dt className="font-bold uppercase tracking-[0.06em] text-[11px] text-soft">
                        Cod TVA UE
                      </dt>
                      <dd className="text-ink-2 font-semibold mt-0.5">RO41773828</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-bold uppercase tracking-[0.06em] text-[11px] text-soft">
                        Sediu social
                      </dt>
                      <dd className="text-ink-2 font-semibold mt-0.5">
                        Sat Ciofrângeni, Comuna Ciofrângeni, Nr. 257 bis, corp C16, Județ Argeș,
                        România
                      </dd>
                    </div>
                  </dl>
                </div>
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
              <div className="flex justify-center mb-6">
                <Mascot
                  size={56}
                  bodyColor="#1D4ED8"
                  className="drop-shadow-[0_8px_24px_rgba(29,78,216,0.20)]"
                />
              </div>
              <h2 className="text-h2-mobile sm:text-h2 gradient-ink font-gilroy max-w-xl mx-auto">
                Vrei să încerci?
              </h2>
              <p className="mt-5 text-body-lg text-ink-3 max-w-lg mx-auto">
                Construiești un bot pentru afacerea ta în 5 minute. Fără card, fără cod.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <Link href="/#waitlist" className="btn-primary btn-lg">
                  Începe gratuit
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="btn-secondary btn-lg">
                  Hai să vorbim
                </Link>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
