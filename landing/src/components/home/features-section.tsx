import {
  Clock,
  BookOpen,
  MessagesSquare,
  UserCheck,
  BarChart3,
  Zap,
  Globe,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

export function FeaturesSection() {
  return (
    <section id="features" aria-labelledby="features-heading" className="section-y bg-soft">
      <div className="container-x">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto">
            <span className="section-label">Funcționalități</span>
            <h2
              id="features-heading"
              className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy"
            >
              Tot ce-ți trebuie ca să răspunzi clienților<br className="hidden sm:block" /> rapid și corect.
            </h2>
            <p className="mt-5 text-body-lg text-ink-3">
              Construit de la zero pentru afacerile mici și medii. Nu plătești pentru funcții
              complicate pe care nu le folosești.
            </p>
          </div>
        </FadeInOnScroll>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Row 1: Wide channels + Narrow always-on */}
          <FadeInOnScroll className="lg:col-span-2">
            <FeatureCard
              icon={MessagesSquare}
              title="Pe site și pe WhatsApp"
              description="Pui botul cu un cod copy-paste pe site, sau îl conectezi la WhatsApp Business cu 3 clickuri. Aceeași conversație, oriunde te scrie clientul."
              visual={<ChannelsVisual />}
              wide
            />
          </FadeInOnScroll>
          <FadeInOnScroll delay={60}>
            <FeatureCard
              icon={Clock}
              title="Răspunsuri 24/7"
              description="Niciun client pierdut pentru că nu erai la birou. Botul răspunde și la 9 dimineața și la 3 noaptea."
            />
          </FadeInOnScroll>

          {/* Row 2: Narrow human-takeover + Wide knowledge-base */}
          <FadeInOnScroll delay={120}>
            <FeatureCard
              icon={UserCheck}
              title="Preluare umană"
              description="Când botul nu știe, primești notificare instant și preiei conversația fără să o iei de la zero."
            />
          </FadeInOnScroll>
          <FadeInOnScroll className="lg:col-span-2" delay={180}>
            <FeatureCard
              icon={BookOpen}
              title="Învață cu informațiile tale"
              description="Site, PDF, Excel, text — Convia citește și răspunde pe baza datelor tale. Niciodată nu inventează."
              visual={<KnowledgeVisual />}
              wide
            />
          </FadeInOnScroll>

          {/* Row 3: Wide analytics + Narrow setup */}
          <FadeInOnScroll className="lg:col-span-2" delay={240}>
            <FeatureCard
              icon={BarChart3}
              title="Vezi ce întreabă clienții tăi"
              description="Statistici simple: câte conversații, ce întrebări frecvente, unde abandonează. Înțelegi clienții fără să citești toate mesajele."
              visual={<AnalyticsVisual />}
              wide
            />
          </FadeInOnScroll>
          <FadeInOnScroll delay={300}>
            <FeatureCard
              icon={Zap}
              title="Gata în 5 minute"
              description="Fără cod, fără IT, fără bătăi de cap. Te înregistrezi, urci informațiile, botul e live."
            />
          </FadeInOnScroll>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  visual,
  wide,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  visual?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="card card-hover h-full p-7 flex flex-col">
      <div className="h-11 w-11 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-5">
        <Icon className="h-5 w-5 text-accent" strokeWidth={2.25} />
      </div>
      <h3 className={`font-gilroy text-ink mb-2 leading-tight tracking-tight ${wide ? "text-h4" : "text-[18px] font-semibold"}`}>
        {title}
      </h3>
      <p className="text-[14.5px] text-ink-3 leading-relaxed">{description}</p>
      {visual && <div className="mt-6 flex-1 flex items-end">{visual}</div>}
    </div>
  );
}

function ChannelsVisual() {
  return (
    <div className="w-full grid grid-cols-2 gap-2.5">
      {/* WhatsApp preview */}
      <div className="bg-[#EFEAE2] rounded-xl p-3 border border-[#25D366]/15 flex flex-col gap-1.5 shadow-card">
        <div className="flex items-center gap-1.5 text-[#075E54] text-[10.5px] font-bold uppercase tracking-[0.06em]">
          <WhatsAppIcon size={12} />
          WhatsApp
        </div>
        <div
          className="bg-[#D9FDD3] text-ink-2 text-[11px] leading-snug px-2 py-1.5 shadow-sm self-end max-w-[90%]"
          style={{ borderRadius: "10px 10px 3px 10px" }}
        >
          Programare 4 pers · 20:00
        </div>
        <div
          className="bg-white text-ink-2 text-[11px] leading-snug px-2 py-1.5 shadow-sm max-w-[92%]"
          style={{ borderRadius: "10px 10px 10px 3px" }}
        >
          Confirmat! ✓
        </div>
      </div>
      {/* Site preview */}
      <div className="bg-white rounded-xl p-3 border border-line shadow-card flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-accent text-[10.5px] font-bold uppercase tracking-[0.06em]">
          <Globe className="h-3 w-3" strokeWidth={2.5} />
          Site web
        </div>
        <div
          className="bg-accent text-white text-[11px] leading-snug px-2 py-1.5 shadow-sm self-end max-w-[90%]"
          style={{ borderRadius: "10px 10px 3px 10px" }}
        >
          Cât costă livrarea?
        </div>
        <div
          className="bg-surface-2 text-ink-2 text-[11px] leading-snug px-2 py-1.5 border border-line max-w-[92%]"
          style={{ borderRadius: "10px 10px 10px 3px" }}
        >
          25 RON · gratis &gt; 200 RON
        </div>
      </div>
    </div>
  );
}

function KnowledgeVisual() {
  const sources = [
    { name: "convia.ro", type: "Website" },
    { name: "meniu.pdf", type: "PDF · 32 pagini" },
    { name: "prețuri.xlsx", type: "Excel · 142 produse" },
  ];
  return (
    <div className="w-full flex flex-col gap-1.5">
      {sources.map((src, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 bg-white border border-line rounded-lg px-3 py-2 shadow-card"
        >
          <div className="h-7 w-7 rounded-md bg-accent-soft flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-ink leading-tight truncate">{src.name}</div>
            <div className="text-[10.5px] text-soft mt-0.5">{src.type}</div>
          </div>
          <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded">
            INDEXAT
          </span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsVisual() {
  const bars = [42, 78, 55, 91, 67, 88, 73];
  const max = Math.max(...bars);
  return (
    <div className="w-full bg-white border border-line rounded-xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.08em] font-bold text-soft">Conversații</div>
          <div className="text-h4 font-gilroy text-ink leading-none mt-1">1.247</div>
        </div>
        <div className="text-right">
          <div className="text-[10.5px] uppercase tracking-[0.08em] font-bold text-soft">Săptămâna asta</div>
          <div className="text-[12.5px] font-semibold text-success mt-1">+18% vs sept tr.</div>
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-12">
        {bars.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <div
              className="bg-gradient-to-b from-accent to-primary-500 rounded-sm"
              style={{ height: `${(v / max) * 100}%`, minHeight: "8%" }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[9.5px] text-soft font-semibold">
        <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
      </div>
    </div>
  );
}
