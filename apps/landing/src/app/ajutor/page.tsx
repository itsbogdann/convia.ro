import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, BookOpen, Bot, Users, CreditCard, ShieldCheck, ArrowRight } from "lucide-react";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

export const metadata: Metadata = {
  title: "Centru de ajutor",
  description:
    "Răspunsuri rapide la întrebările cele mai dese despre Convia: configurare, facturare, GDPR, integrări.",
  alternates: { canonical: "/ajutor" },
  openGraph: {
    type: "website",
    title: "Centru de ajutor · Convia",
    description:
      "Răspunsuri rapide la întrebări despre Convia. Scrie-ne dacă nu găsești ce cauți.",
    url: "/ajutor",
  },
};

type QA = {
  q: string;
  a: string;
  seeAlso?: Array<{ href: string; label: string }>;
};

type Category = {
  icon: typeof BookOpen;
  title: string;
  items: QA[];
};

const categories: Category[] = [
  {
    icon: BookOpen,
    title: "Cum începi",
    items: [
      {
        q: "În cât timp îmi pot lansa botul?",
        a: "5 până la 10 minute pentru un setup de bază. Te înregistrezi, dai botului informațiile (site, PDF sau text scris direct), apoi alegi unde răspunde: pui un cod copy-paste pe site sau conectezi WhatsApp Business cu 3 clickuri. Dacă nu te descurci, instalăm noi gratuit, scrie-ne la salut@convia.ro.",
        seeAlso: [
          {
            href: "/blog/5-motive-sa-automatizezi-conversatiile",
            label: "De ce viteza de răspuns câștigă clienții",
          },
        ],
      },
      {
        q: "Ce tipuri de fișiere pot încărca?",
        a: "PDF, Word, Excel, CSV, text simplu și link-uri către site-uri publice. Pentru site, dai linkul și Convia îl indexează singur. Mărimea maximă per fișier e 50 MB. Ai un volum mai mare? Scrie-ne să vedem împreună.",
        seeAlso: [
          {
            href: "/blog/cum-functioneaza-asistentii-ai",
            label: "Cum „învață” botul din fișierele tale (RAG, explicat)",
          },
        ],
      },
      {
        q: "Pot încerca fără să dau cardul?",
        a: "Da. Planul Gratuit nu cere card și nu are termen. Ai 100 de conversații pe lună, oricât timp vrei să-l folosești. Plătești doar dacă vrei mai mult volum sau funcționalități.",
      },
    ],
  },
  {
    icon: Bot,
    title: "Botul tău",
    items: [
      {
        q: "Cum corectez un răspuns greșit?",
        a: "Intri în conversația respectivă din dashboard, marchezi răspunsul ca greșit și scrii varianta corectă. La următorul mesaj similar, botul răspunde corect. Mai bine: dacă vede că nu știe un subiect, primești notificare automat și preiei tu.",
        seeAlso: [
          {
            href: "/blog/cum-functioneaza-asistentii-ai",
            label: "De ce botul nu inventează: cum funcționează RAG",
          },
        ],
      },
      {
        q: "Pot avea mai mulți boți, fiecare cu personalitate diferită?",
        a: "Da. Pe Business poți avea 3 boți, pe Premium nelimitat. Fiecare bot are propriile informații și ton, configurat separat. De exemplu: un bot pentru rezervări (formal, doar pe site), unul pentru suport (casual, pe site și WhatsApp).",
      },
      {
        q: "Botul poate face mai mult decât să răspundă? De exemplu rezervări?",
        a: "Da, prin integrări cu sistemele tale. Convia poate verifica disponibilitate, prelua date pentru o rezervare și trimite confirmare pe email sau WhatsApp. Pentru integrări custom (calendar, CRM, sisteme proprii) scrie-ne și vedem ce facem.",
        seeAlso: [
          {
            href: "/blog/ce-este-un-chatbot-ai",
            label: "Ce face un chatbot AI în 2026 (cazuri de utilizare reale)",
          },
        ],
      },
    ],
  },
  {
    icon: Users,
    title: "Echipa și conturi",
    items: [
      {
        q: "Câți colegi pot adăuga?",
        a: "Pe Gratuit doar tu. Pe Business, 5 colegi. Pe Premium, nelimitat. Toți văd inbox-ul comun și pot prelua conversații. Avem 4 roluri (Proprietar, Admin, Developer, Agent), așa că dai acces fix la ce e nevoie.",
      },
      {
        q: "Pot da acces limitat doar la inbox?",
        a: "Da. Rolul de Agent vede doar inbox-ul și poate prelua conversații. Nu vede setări de bot, facturare sau utilizatori. Perfect pentru colegii de suport sau colaboratori externi.",
      },
    ],
  },
  {
    icon: CreditCard,
    title: "Facturare",
    items: [
      {
        q: "Primesc factură cu CIF-ul firmei?",
        a: "Da. La înscriere completezi datele firmei (CUI, sediu social, etc.) și primești factură fiscală în RON pe firma ta, conform legislației. Acceptăm card și plată prin ordin de plată (OP), dacă preferi facturare clasică.",
      },
      {
        q: "Cum schimb pachetul?",
        a: "Dintr-un click în setări. Upgrade-ul produce efect imediat și plătești doar diferența proporțională pe restul ciclului. Downgrade-ul produce efect la finalul ciclului curent. Nu sunt taxe ascunse, nu sunt întrebări.",
      },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Date și GDPR",
    items: [
      {
        q: "Pot șterge complet datele unui client?",
        a: "Da. Cauți după email sau telefon, alegi „Șterge tot” și dispar toate datele asociate: conversații, contact, metadate, fișiere atașate. Avem o fereastră de 7 zile pentru recuperare dacă o ceri tu în acea perioadă; după aceea, ștergerea e definitivă.",
      },
      {
        q: "Unde sunt găzduite datele?",
        a: "Pe servere din Uniunea Europeană, în Frankfurt. Backup-urile sunt criptate și redundante geografic, tot în spațiul UE. Furnizorii AI (OpenAI, Anthropic) sunt în SUA, dar cu clauze contractuale standard aprobate de Comisia Europeană. Citește detaliile pe /gdpr.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-y bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="text-center max-w-2xl mx-auto">
              <span className="section-label">Centru de ajutor</span>
              <h1 className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy">
                Cu ce te ajutăm?
              </h1>
              <p className="mt-5 text-body-lg text-ink-3">
                Lucrăm la articole detaliate pentru fiecare funcționalitate. Până atunci, găsești
                aici răspunsurile la întrebările pe care le primim cel mai des.
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Categories with FAQ */}
      <section className="pb-20 bg-white">
        <div className="container-x">
          <div className="max-w-3xl mx-auto space-y-12">
            {categories.map((cat, ci) => {
              const Icon = cat.icon;
              return (
                <FadeInOnScroll key={cat.title} delay={ci * 60}>
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-9 w-9 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-accent" strokeWidth={2.25} />
                      </div>
                      <h2 className="text-h4 font-gilroy text-ink tracking-tight">{cat.title}</h2>
                    </div>
                    <div className="space-y-2.5">
                      {cat.items.map((item, i) => (
                        <details
                          key={i}
                          className="group card overflow-hidden open:shadow-card-lg open:border-line-strong transition-shadow"
                        >
                          <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer w-full px-6 py-5 flex items-center justify-between gap-4 hover:bg-surface-2/50 transition-colors">
                            <span className="text-[15.5px] font-semibold text-ink leading-snug">
                              {item.q}
                            </span>
                            <ChevronDown
                              className="h-5 w-5 text-ink-3 flex-shrink-0 transition-transform group-open:rotate-180 group-open:text-accent"
                              strokeWidth={2.25}
                            />
                          </summary>
                          <div className="px-6 pb-5 pt-4 border-t border-line">
                            <p className="text-[14.5px] text-ink-3 leading-relaxed">{item.a}</p>
                            {item.seeAlso && item.seeAlso.length > 0 && (
                              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-soft">
                                  Vezi și
                                </span>
                                {item.seeAlso.map((sa) => (
                                  <Link
                                    key={sa.href}
                                    href={sa.href}
                                    className="inline-flex items-center gap-1 text-[12.5px] font-bold text-accent hover:underline"
                                  >
                                    {sa.label}
                                    <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                </FadeInOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-y bg-soft">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-h3 font-gilroy text-ink mb-3">
                Nu ai găsit răspunsul?
              </h2>
              <p className="text-body text-ink-3 leading-relaxed mb-7">
                Scrie-ne pe email și răspundem rapid, de obicei sub 24 de ore. Suport în limba
                română, de la oameni reali din echipă.
              </p>
              <Link href="/contact" className="btn-primary">
                Mergi la contact
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-4 text-[13px] text-soft font-semibold">
                Sau direct la{" "}
                <a href="mailto:salut@convia.ro" className="text-accent hover:underline">
                  salut@convia.ro
                </a>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
