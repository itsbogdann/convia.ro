import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { Mascot } from "@/components/ui/brand-mark";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

export function ChannelsSection() {
  return (
    <section aria-labelledby="channels-heading" className="section-y bg-soft">
      <div className="container-x">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto">
            <span className="section-label">Canale</span>
            <h2
              id="channels-heading"
              className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy"
            >
              Pe site și pe WhatsApp. <br className="hidden sm:block" />
              Unde-i găsești pe clienții tăi.
            </h2>
            <p className="mt-5 text-body-lg text-ink-3">
              Aceeași conversație, indiferent unde îți scrie clientul. Convia ține minte istoricul
              și răspunde unitar peste tot.
            </p>
          </div>
        </FadeInOnScroll>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* WhatsApp card */}
          <FadeInOnScroll>
            <div className="card h-full overflow-hidden flex flex-col">
              <div className="p-8 pb-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-11 w-11 rounded-xl bg-[#25D366]/12 flex items-center justify-center text-[#25D366]">
                    <WhatsAppIcon size={22} />
                  </div>
                  <span className="text-[12.5px] font-bold tracking-[0.08em] text-[#25D366] uppercase">
                    WhatsApp Business
                  </span>
                </div>
                <h3 className="text-h3 text-ink font-gilroy">
                  Răspunde direct unde clienții îți scriu deja
                </h3>
                <p className="mt-3 text-body-sm text-ink-3">
                  Conectezi WhatsApp Business API oficial (de la Meta) în ~10 minute. Convia răspunde
                  instant, ține contextul și te anunță când e cazul să intervii tu.
                </p>
                <ul className="mt-5 space-y-2.5">
                  {[
                    "Conexiune oficială Meta, nu pierzi conturile",
                    "Răspunsuri în limba română, cu diacritice",
                    "Trimite imagini, locație, butoane",
                    "Funcționează 24/7, inclusiv sărbători",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[14px] text-ink-2">
                      <Check className="h-4 w-4 text-[#25D366] flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              {/* WhatsApp mock conversation */}
              <div className="mt-auto bg-[#EFEAE2] p-5 border-t border-line">
                <div className="space-y-2 max-w-xs mx-auto">
                  <ChatBubble side="left" color="white">
                    Salut! Aveți rezervări libere astăzi seara?
                  </ChatBubble>
                  <ChatBubble side="right" color="#D9FDD3">
                    Salut! Pentru diseară am o masă liberă la ora 19:00 (4 persoane). Confirm? 🍽️
                  </ChatBubble>
                  <ChatBubble side="left" color="white">
                    Da, perfect. Mulțumesc!
                  </ChatBubble>
                </div>
              </div>
            </div>
          </FadeInOnScroll>

          {/* Website widget card */}
          <FadeInOnScroll delay={100}>
            <div className="card h-full overflow-hidden flex flex-col">
              <div className="p-8 pb-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-11 w-11 rounded-xl bg-accent-soft flex items-center justify-center text-accent border border-accent-ring/40">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="2" y1="20" x2="22" y2="20" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] font-bold tracking-[0.08em] text-accent uppercase">
                    Site Web
                  </span>
                </div>
                <h3 className="text-h3 text-ink font-gilroy">
                  Un cod copy-paste și e live pe site-ul tău
                </h3>
                <p className="mt-3 text-body-sm text-ink-3">
                  Adaugi o singură linie de cod și widget-ul apare în colțul site-ului. Funcționează
                  pe WordPress, Shopify, Webflow, Gomag, custom: orice site web.
                </p>
                <ul className="mt-5 space-y-2.5">
                  {[
                    "Branding personalizat (culori, logo, mesaj salut)",
                    "Captează emailul vizitatorilor pentru lead-uri",
                    "Funcționează pe mobil și desktop",
                    "Statistici despre vizitatori și conversii",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[14px] text-ink-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Website widget mock */}
              <div className="mt-auto bg-gradient-to-br from-surface-2 to-surface-3 p-5 border-t border-line relative min-h-[180px]">
                {/* fake browser */}
                <div className="absolute top-3 left-3 right-3 h-7 rounded-md bg-white border border-line flex items-center px-3 gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                  <span className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2 w-2 rounded-full bg-[#28C840]" />
                  <span className="ml-3 text-[10px] text-muted truncate">site-ul-tau.ro</span>
                </div>
                {/* widget */}
                <div className="absolute bottom-4 right-4 bg-white rounded-2xl shadow-card-lg border border-line p-3 w-[220px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Mascot size={28} bodyColor="#1D4ED8" />
                    <div>
                      <div className="text-[11.5px] font-semibold text-ink leading-tight">Convia</div>
                      <div className="text-[10px] text-success flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        Online acum
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-ink-2 bg-surface-2 rounded-lg p-2 leading-snug">
                    Salut! Sunt asistentul Convia. Cu ce te pot ajuta? 👋
                  </div>
                </div>
              </div>
            </div>
          </FadeInOnScroll>
        </div>

        <FadeInOnScroll>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="#waitlist" className="btn-primary">
              Începe gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-[13px] text-soft">
              Funcționează cu WordPress, Shopify, Webflow, Gomag, custom: orice site.
            </span>
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}

function ChatBubble({
  side,
  color,
  children,
}: {
  side: "left" | "right";
  color: string;
  children: React.ReactNode;
}) {
  const isLeft = side === "left";
  return (
    <div className={`flex ${isLeft ? "justify-start" : "justify-end"}`}>
      <div
        className="text-[12px] text-ink-2 px-3 py-2 rounded-2xl shadow-sm max-w-[85%]"
        style={{ backgroundColor: color, borderTopLeftRadius: isLeft ? 4 : 16, borderTopRightRadius: isLeft ? 16 : 4 }}
      >
        {children}
      </div>
    </div>
  );
}
