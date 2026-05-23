import Link from "next/link";
import { ArrowRight, ShieldCheck, MessageCircle, Globe2 } from "lucide-react";
import { Mascot } from "@/components/ui/brand-mark";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="bg-hero bg-dots relative pt-20 pb-16 lg:pt-28 lg:pb-20"
    >
      <div className="container-x relative z-10 text-center">
        {/* Mascot */}
        <div className="flex justify-center mb-7">
          <div className="relative">
            <Mascot
              size={84}
              bodyColor="#1D4ED8"
              className="animate-float drop-shadow-[0_8px_24px_rgba(29,78,216,0.20)]"
            />
          </div>
        </div>

        {/* Eyebrow pill */}
        <div className="flex justify-center mb-6">
          <span className="accent-pill">
            <span className="dot" />
            Primul chatbot AI gândit pentru afaceri din România
          </span>
        </div>

        {/* Headline */}
        <h1
          id="hero-heading"
          className="mx-auto max-w-[920px] text-h1-mobile sm:text-display-sm lg:text-display gradient-ink font-gilroy"
        >
          Răspunde clienților tăi <span className="text-accent">24/7</span>.
          <br className="hidden sm:block" /> Pe site sau pe WhatsApp.
        </h1>

        {/* Subhead */}
        <p className="mx-auto mt-6 max-w-[640px] text-body-lg text-ink-3">
          Construiești un asistent AI pentru afacerea ta în 5 minute. Învață-l cu propriile tale
          informații. Fără cod, fără efort, fără bătăi de cap.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Link href="#waitlist" className="btn-primary btn-lg">
            Începe gratuit
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#demo" className="btn-secondary btn-lg">
            <svg
              className="h-3.5 w-3.5 text-accent"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Vezi demo live
          </Link>
        </div>

        {/* Reassurance */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13.5px] font-semibold text-soft">
          <span>Fără card de credit</span>
          <span className="text-line-strong">·</span>
          <span>14 zile gratuit</span>
          <span className="text-line-strong">·</span>
          <span>Suport în limba română</span>
        </div>
      </div>

      {/* Channel / trust strip */}
      <div className="container-x mt-16">
        <div className="mx-auto max-w-3xl flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] text-ink-3">
          <span className="overline text-soft">Funcționează pe</span>
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <WhatsAppIcon size={14} className="text-[#25D366]" />
            WhatsApp
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Globe2 className="h-3.5 w-3.5 text-accent" />
            Site web
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <MessageCircle className="h-3.5 w-3.5 text-accent" />
            Messenger & Instagram
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            GDPR & 100% românesc
          </span>
        </div>
      </div>
    </section>
  );
}
