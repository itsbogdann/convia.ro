import Link from "next/link";
import {
  FileUp,
  Globe,
  Check,
  Sparkles,
  MessageSquare,
  ArrowRight,
  HeartHandshake,
} from "lucide-react";
import { Mascot } from "@/components/ui/brand-mark";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

export function HowItWorksSection() {
  return (
    <section id="how" aria-labelledby="how-heading" className="section-y relative bg-white">
      <div className="container-x">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto">
            <span className="section-label">Cum funcționează</span>
            <h2
              id="how-heading"
              className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy"
            >
              3 pași până ai un asistent AI<br className="hidden sm:block" /> care răspunde clienților.
            </h2>
            <p className="mt-5 text-body-lg text-ink-3">
              De la cont nou la bot live pe site — în mai puțin de 10 minute. Fără cod, fără
              configurări complicate.
            </p>
          </div>
        </FadeInOnScroll>

        <div className="relative mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-6">
          {/* Step 1 */}
          <FadeInOnScroll>
            <StepCard
              number="01"
              title="Spune-i botului despre afacerea ta"
              description="Încarci site-ul (cu un link), un PDF cu meniul, un Excel cu prețurile sau scrii informațiile direct. Convia învață și le ține minte."
              visual={<UploadVisual />}
            />
          </FadeInOnScroll>

          {/* Step 2 */}
          <FadeInOnScroll delay={100}>
            <StepCard
              number="02"
              title="Îl pui unde vrei tu să răspundă"
              description="Un cod copy-paste pe site, sau 3 clickuri ca să-l conectezi la WhatsApp Business. Sau pe Messenger și Instagram."
              visual={<DeployVisual />}
            />
          </FadeInOnScroll>

          {/* Step 3 */}
          <FadeInOnScroll delay={200}>
            <StepCard
              number="03"
              title="Răspunde clienților 24/7, tu vezi statistici"
              description="Botul ține conversațiile, salvează datele clienților și te anunță când are nevoie de ajutor. Tu vezi tot dintr-un singur loc."
              visual={<ConversationVisual />}
            />
          </FadeInOnScroll>
        </div>

        {/* "We'll set it up for you" callout */}
        <FadeInOnScroll>
          <div
            className="mt-10 relative overflow-hidden rounded-2xl border border-accent-ring/40 p-7 sm:p-8"
            style={{
              background:
                "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 60%, #EFF6FF 100%)",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="h-12 w-12 rounded-2xl bg-white border border-accent-ring/40 shadow-card flex items-center justify-center flex-shrink-0">
                  <HeartHandshake className="h-5 w-5 text-accent" strokeWidth={2.25} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent text-white text-[10.5px] font-bold tracking-[0.08em] uppercase">
                      Gratuit
                    </span>
                    <span className="text-[12px] font-bold tracking-[0.06em] uppercase text-ink-3">
                      Nu te descurci singur?
                    </span>
                  </div>
                  <h3 className="text-h4 font-gilroy text-ink leading-tight tracking-tight">
                    Îl instalăm noi pe site-ul tău, fără niciun cost.
                  </h3>
                  <p className="mt-2 text-[14.5px] font-semibold text-ink-3 leading-relaxed">
                    Echipa Convia adaugă botul pe site, conectează WhatsApp și învață botul cu
                    informațiile afacerii tale. Tu te ocupi de afacere, noi de tehnică.
                  </p>
                </div>
              </div>
              <Link href="#contact" className="btn-primary flex-shrink-0 self-start md:self-auto">
                Cere setup gratuit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}

function StepCard({
  number,
  title,
  description,
  visual,
}: {
  number: string;
  title: string;
  description: string;
  visual: React.ReactNode;
}) {
  return (
    <div className="card card-hover h-full overflow-hidden flex flex-col">
      {/* Top: visual */}
      <div className="relative h-48 bg-gradient-to-br from-surface-2 via-white to-accent-soft/30 border-b border-line overflow-hidden">
        {/* Faint big number watermark */}
        <span
          className="absolute -top-2 -right-2 text-[120px] font-black leading-none select-none pointer-events-none font-gilroy"
          style={{
            background: "linear-gradient(180deg, rgba(11,18,32,0.05) 0%, rgba(11,18,32,0) 70%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: "-0.06em",
          }}
          aria-hidden="true"
        >
          {number}
        </span>
        <div className="relative h-full p-5">{visual}</div>
      </div>

      {/* Bottom: copy */}
      <div className="p-7 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent-soft text-accent text-[10.5px] font-bold tracking-[0.08em] uppercase border border-accent-ring/30">
            Pas {number}
          </span>
        </div>
        <h3 className="text-h4 font-gilroy text-ink mb-3 leading-tight">{title}</h3>
        <p className="text-[14.5px] text-ink-3 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function UploadVisual() {
  return (
    <div className="h-full flex flex-col justify-center gap-2">
      {[
        { icon: Globe, name: "site-restaurant.ro", status: "Indexat", color: "text-accent", bg: "bg-accent-soft" },
        { icon: FileUp, name: "meniu-restaurant.pdf", status: "32 pagini", color: "text-[#F5871F]", bg: "bg-[#F5871F]/12" },
        { icon: Sparkles, name: "Întrebări frecvente", status: "12 intrări", color: "text-success", bg: "bg-success/12" },
      ].map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className="relative flex items-center gap-2.5 bg-white border border-line rounded-lg px-3 py-2 shadow-card"
          >
            <div className={`h-7 w-7 rounded-md ${item.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`h-3.5 w-3.5 ${item.color}`} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-ink leading-tight truncate">{item.name}</div>
              <div className="text-[10.5px] text-soft mt-0.5">{item.status}</div>
            </div>
            <Check className="h-3.5 w-3.5 text-success flex-shrink-0" strokeWidth={3} />
          </div>
        );
      })}
    </div>
  );
}

function DeployVisual() {
  return (
    <div className="h-full flex flex-col justify-center gap-2.5">
      {/* Code snippet */}
      <div className="bg-surface-2 border border-line rounded-lg px-3 py-2.5 font-mono text-[10.5px] leading-relaxed text-ink-2 shadow-card">
        <span className="text-soft">&lt;</span>
        <span className="text-accent font-semibold">script </span>
        <span className="text-[#9333EA]">src</span>
        <span className="text-ink-3">=</span>
        <span className="text-[#059669]">"convia.ro/w.js"</span>
        <span className="text-soft"> /&gt;</span>
      </div>
      {/* Channels */}
      <div className="text-[10px] uppercase tracking-[0.08em] font-bold text-soft">Canale active</div>
      <div className="grid grid-cols-3 gap-1.5">
        <ChannelChip icon={<Globe className="h-3.5 w-3.5" strokeWidth={2.25} />} label="Site" color="accent" />
        <ChannelChip icon={<WhatsAppIcon size={14} />} label="WhatsApp" color="whatsapp" />
        <ChannelChip icon={<MessageSquare className="h-3.5 w-3.5" strokeWidth={2.25} />} label="Messenger" color="meta" />
      </div>
    </div>
  );
}

function ChannelChip({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: "accent" | "whatsapp" | "meta";
}) {
  const colors = {
    accent: "bg-accent-soft text-accent border-accent-ring/30",
    whatsapp: "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20",
    meta: "bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/20",
  };
  return (
    <div
      className={`relative flex items-center gap-1.5 bg-white border rounded-lg px-2 py-1.5 shadow-card ${colors[color]}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
    </div>
  );
}

function ConversationVisual() {
  return (
    <div className="h-full flex flex-col justify-center gap-1.5">
      {/* Client message */}
      <div className="flex justify-end">
        <div
          className="bg-accent text-white text-[11.5px] leading-snug px-2.5 py-1.5 shadow-sm max-w-[80%]"
          style={{ borderRadius: "12px 12px 3px 12px" }}
        >
          Aveți rezervări sâmbătă seara?
        </div>
      </div>
      {/* Bot message */}
      <div className="flex justify-start items-end gap-1.5">
        <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mb-0.5">
          <Mascot size={14} bodyColor="#FFFFFF" eyeColor="#FFFFFF" />
        </div>
        <div
          className="bg-white text-ink-2 border border-line text-[11.5px] leading-snug px-2.5 py-1.5 shadow-card max-w-[78%]"
          style={{ borderRadius: "12px 12px 12px 3px" }}
        >
          Da! 20:00 pentru 4 persoane, masă lângă fereastră. Confirm?
        </div>
      </div>
      {/* Stats strip */}
      <div className="mt-2 flex items-center justify-between bg-white border border-line rounded-lg px-2.5 py-1.5 shadow-card">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <span className="text-[10.5px] font-semibold text-ink-2">Răspuns în 0.4s</span>
        </div>
        <div className="text-[10px] text-soft">+12 conversații azi</div>
      </div>
    </div>
  );
}
