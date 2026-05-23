import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Mascot } from "@/components/ui/brand-mark";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="section-y bg-white relative overflow-hidden"
    >
      {/* Soft accent glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(29,78,216,0.10) 0%, rgba(29,78,216,0.04) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      <div className="container-x relative z-10">
        <FadeInOnScroll>
          <div className="card-lg mx-auto max-w-3xl text-center p-10 sm:p-14 rounded-3xl border border-line bg-gradient-to-br from-white to-accent-soft/40 shadow-card-lg">
            <div className="flex justify-center mb-6">
              <Mascot
                size={64}
                bodyColor="#1D4ED8"
                className="animate-float drop-shadow-[0_8px_24px_rgba(29,78,216,0.20)]"
              />
            </div>
            <h2
              id="cta-heading"
              className="text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy max-w-xl mx-auto"
            >
              Începe să răspunzi clienților 24/7.
            </h2>
            <p className="mt-5 text-body-lg text-ink-3 max-w-lg mx-auto">
              Înregistrare în 30 secunde. Bot live pe site sau WhatsApp în 5 minute.
              Niciun risc, fără card.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link href="#waitlist" className="btn-primary btn-lg">
                Începe gratuit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#contact" className="btn-secondary btn-lg">
                Programează o discuție
              </Link>
            </div>
            <div className="mt-5 text-[13.5px] font-semibold text-soft">
              14 zile gratuit · Fără card · Suport în română
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
