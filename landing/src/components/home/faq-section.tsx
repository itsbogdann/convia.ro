"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/data/faq";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <section id="faq" aria-labelledby="faq-heading" className="section-y bg-white">
      <div className="container-x">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto">
            <span className="section-label">Întrebări frecvente</span>
            <h2
              id="faq-heading"
              className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy"
            >
              Întrebări frecvente
            </h2>
            <p className="mt-5 text-body-lg text-ink-3">
              Răspunsuri rapide la întrebările pe care ni le pune toată lumea. Mai ai alta?
              Scrie-ne pe email sau WhatsApp.
            </p>
          </div>
        </FadeInOnScroll>

        <FadeInOnScroll>
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="space-y-2.5">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    className={`card overflow-hidden transition-all ${
                      isOpen ? "shadow-card-lg border-line-strong" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-surface-2/50 transition-colors"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${index}`}
                      id={`faq-header-${index}`}
                    >
                      <span className="text-[15.5px] font-semibold text-ink leading-snug">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-ink-3 flex-shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-accent" : ""
                        }`}
                      />
                    </button>
                    <div
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-header-${index}`}
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-6 pb-5 pt-1 text-[14.5px] text-ink-3 leading-relaxed border-t border-line">
                          <div className="pt-4">{faq.answer}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <p className="text-[14px] text-ink-3">
                Mai ai întrebări? Scrie-ne la{" "}
                <a href="mailto:salut@convia.ro" className="text-accent font-semibold hover:underline">
                  salut@convia.ro
                </a>{" "}
                sau pe WhatsApp.
              </p>
            </div>
          </div>
        </FadeInOnScroll>
      </div>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}
