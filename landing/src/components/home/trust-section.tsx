import { Lock, ShieldCheck, MapPin, Languages, FileCheck2, Headphones } from "lucide-react";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

const trustItems = [
  {
    icon: MapPin,
    title: "100% dezvoltat în România",
    description:
      "Echipa noastră e în România, suportul e în română, facturarea e cu firmă românească (CUI, factură fiscală).",
  },
  {
    icon: ShieldCheck,
    title: "GDPR compliant",
    description:
      "Respectăm GDPR și legea românească de protecție a datelor. DPA disponibil la cerere.",
  },
  {
    icon: MapPin,
    title: "Date stocate în Uniunea Europeană",
    description:
      "Serverele noastre sunt în UE (Germania și Franța). Datele clienților tăi nu părăsesc niciodată Europa.",
  },
  {
    icon: Lock,
    title: "Criptare AES-256",
    description:
      "Toate datele sunt criptate atât în repaus cât și în tranzit (TLS 1.3). Standard bancar.",
  },
  {
    icon: Languages,
    title: "Suport în limba română",
    description:
      "Vorbești cu noi în română, prin email sau WhatsApp. Răspundem în mai puțin de 2 ore în timpul programului.",
  },
  {
    icon: FileCheck2,
    title: "Factură fiscală cu TVA",
    description:
      "Primești factură fiscală conformă cu legea românească. Deductibil ca cheltuială de afacere.",
  },
];

export function TrustSection() {
  return (
    <section aria-labelledby="trust-heading" className="section-y bg-soft">
      <div className="container-x">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto">
            <span className="section-label">De ce să ai încredere</span>
            <h2
              id="trust-heading"
              className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy"
            >
              Construit în România. <br className="hidden sm:block" />
              Pentru afacerile din România.
            </h2>
            <p className="mt-5 text-body-lg text-ink-3">
              Nu suntem o platformă americană tradusă pe Google Translate. Convia e gândit, scris și
              suportat în limba română, cu legi și obiceiuri locale în minte.
            </p>
          </div>
        </FadeInOnScroll>

        <FadeInOnScroll>
          <div className="mt-12 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white px-4 py-2 text-[13.5px] font-semibold text-ink-2 shadow-card">
              <span className="text-lg leading-none">🇷🇴</span>
              100% dezvoltat și suportat în România
            </span>
          </div>
        </FadeInOnScroll>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trustItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <FadeInOnScroll key={item.title} delay={i * 40}>
                <div className="card p-6 h-full flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink mb-1.5">{item.title}</h3>
                    <p className="text-[13.5px] text-ink-3 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </FadeInOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
