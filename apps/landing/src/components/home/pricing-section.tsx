"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { plans, enterprisePlan } from "@/data/pricing";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

type Billing = "monthly" | "yearly";

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="section-y bg-soft">
      <div className="container-x">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto">
            <span className="section-label">Prețuri</span>
            <h2
              id="pricing-heading"
              className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy"
            >
              Prețuri simple. Fără surprize.
            </h2>
            <p className="mt-5 text-body-lg text-ink-3">
              Începi gratuit. Plătești când vrei mai mult. Dacă depășești limita lunară, plătești
              doar pentru conversațiile în plus. Niciodată nu îți blocăm botul.
            </p>
          </div>
        </FadeInOnScroll>

        {/* Billing toggle */}
        <FadeInOnScroll>
          <div className="mt-10 flex items-center justify-center">
            <div className="inline-flex p-1 bg-white border border-line rounded-full shadow-card">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                aria-pressed={billing === "monthly"}
                className={`px-5 py-2 rounded-full text-[13.5px] font-semibold transition-all ${
                  billing === "monthly"
                    ? "bg-ink text-white shadow-sm"
                    : "text-ink-3 hover:text-ink"
                }`}
              >
                Lunar
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                aria-pressed={billing === "yearly"}
                className={`relative px-5 py-2 rounded-full text-[13.5px] font-semibold transition-all ${
                  billing === "yearly"
                    ? "bg-ink text-white shadow-sm"
                    : "text-ink-3 hover:text-ink"
                }`}
              >
                Anual
                <span className="ml-1.5 inline-flex items-center gap-1 text-[10.5px] font-bold text-success">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Plan cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const isFree = plan.monthly === 0;
            const price = billing === "monthly" ? plan.monthly : plan.yearly;

            return (
              <FadeInOnScroll key={plan.id} delay={i * 80}>
                <div
                  className={`relative h-full flex flex-col p-7 rounded-2xl border transition-all ${
                    plan.highlight
                      ? "bg-white border-accent shadow-[0_20px_50px_-10px_rgba(29,78,216,0.25)] ring-1 ring-accent/20"
                      : "bg-white border-line shadow-card hover:shadow-card-lg"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-white text-[11px] font-bold uppercase tracking-[0.06em] shadow-cta">
                        <Sparkles className="h-3 w-3" />
                        Cel mai popular
                      </span>
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-h3 font-gilroy text-ink mb-1.5">{plan.name}</h3>
                    <p className="text-[13.5px] text-ink-3 leading-relaxed min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-5xl font-bold text-ink font-gilroy tracking-tight">
                        {price}
                      </span>
                      <span className="text-[14px] text-muted font-semibold">RON / lună</span>
                    </div>
                    <div className="mt-1.5 text-[12px] text-soft">
                      {isFree
                        ? "Gratuit pentru totdeauna"
                        : billing === "yearly"
                          ? `Plătit anual (${(plan.yearly * 12).toLocaleString("ro-RO")} RON/an) · + TVA`
                          : "+ TVA · plătit lunar"}
                    </div>
                    {plan.overage !== undefined && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent-soft/60 border border-accent-ring/20 text-[11.5px] font-semibold text-accent">
                        + {plan.overage.toLocaleString("ro-RO", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        RON / conversație suplimentară
                      </div>
                    )}
                  </div>

                  <Link
                    href={plan.cta.href}
                    className={`w-full text-center mb-7 ${
                      plan.highlight ? "btn-primary" : "btn-secondary"
                    }`}
                  >
                    {plan.cta.label}
                  </Link>

                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-[13.5px]">
                        <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-ink-2">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeInOnScroll>
            );
          })}
        </div>

        {/* Enterprise tile */}
        <FadeInOnScroll>
          <div className="mt-6 max-w-5xl mx-auto">
            <div className="card p-7 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <h3 className="text-h4 font-gilroy text-ink">{enterprisePlan.name}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-ink text-white text-[10.5px] font-bold uppercase tracking-[0.06em]">
                    Custom
                  </span>
                </div>
                <p className="text-[14px] text-ink-3 mb-3 max-w-xl">{enterprisePlan.description}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {enterprisePlan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[13px] text-ink-2">
                      <Check className="h-3.5 w-3.5 text-accent flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={enterprisePlan.cta.href} className="btn-secondary md:flex-shrink-0">
                {enterprisePlan.cta.label}
              </Link>
            </div>
          </div>
        </FadeInOnScroll>

        <FadeInOnScroll>
          <div className="mt-10 text-center text-[13px] text-soft">
            Toate planurile includ branding personalizabil, integrare site web, securitate
            enterprise și suport în limba română. Anulezi oricând.
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
