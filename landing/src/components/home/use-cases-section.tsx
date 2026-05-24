"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useCases, type ConversationTurn } from "@/data/use-cases";
import { Mascot } from "@/components/ui/brand-mark";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";
import { team } from "@/data/team";

export function UseCasesSection() {
  const [activeId, setActiveId] = useState(useCases[0].id);
  const active = useCases.find((u) => u.id === activeId) ?? useCases[0];

  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    setVisibleCount(0);
    setShowTyping(false);

    const timers: ReturnType<typeof setTimeout>[] = [];
    let cursor = 400;

    active.conversation.forEach((turn, i) => {
      if (turn.from === "bot") {
        timers.push(setTimeout(() => setShowTyping(true), cursor));
        cursor += 900;
        timers.push(
          setTimeout(() => {
            setShowTyping(false);
            setVisibleCount(i + 1);
          }, cursor)
        );
      } else {
        timers.push(setTimeout(() => setVisibleCount(i + 1), cursor));
      }
      cursor += 1100;
    });

    return () => timers.forEach(clearTimeout);
  }, [active.id, active.conversation]);

  return (
    <section id="use-cases" aria-labelledby="usecase-heading" className="section-y bg-white">
      <div className="container-x">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto">
            <span className="section-label">Cazuri de utilizare</span>
            <h2
              id="usecase-heading"
              className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy"
            >
              Construit pentru afacerea ta, exact așa cum lucrezi tu.
            </h2>
            <p className="mt-5 text-body-lg text-ink-3">
              Alege industria ta și vezi un exemplu real de conversație. Convia se mulează pe
              modul tău de a interacționa cu clienții.
            </p>
          </div>
        </FadeInOnScroll>

        {/* Tabs */}
        <FadeInOnScroll>
          <div
            role="tablist"
            aria-label="Selectează o industrie"
            className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
          >
            {useCases.map((uc) => {
              const isActive = uc.id === activeId;
              return (
                <button
                  key={uc.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`usecase-panel-${uc.id}`}
                  id={`usecase-tab-${uc.id}`}
                  onClick={() => setActiveId(uc.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold transition-all ${
                    isActive
                      ? "bg-accent text-white shadow-cta"
                      : "bg-white text-ink-2 border border-line-strong hover:bg-surface-2"
                  }`}
                >
                  <span className="text-base leading-none">{uc.icon}</span>
                  {uc.industry}
                </button>
              );
            })}
          </div>
        </FadeInOnScroll>

        {/* Panel */}
        <div
          id={`usecase-panel-${active.id}`}
          role="tabpanel"
          aria-labelledby={`usecase-tab-${active.id}`}
          className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
        >
          {/* Left: content */}
          <div>
            <h3 className="text-h3 font-gilroy text-ink mb-4">{active.headline}</h3>
            <p className="text-body text-ink-3 leading-relaxed mb-7">{active.description}</p>
            <ul className="space-y-3">
              {active.examples.map((ex) => (
                <li key={ex} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent-soft border border-accent-ring/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <span className="text-[14.5px] text-ink-2 leading-relaxed">{ex}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: conversation preview */}
          <div className="relative">
            <div
              className="absolute -inset-12 -z-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(29,78,216,0.14) 0%, rgba(29,78,216,0.04) 50%, transparent 80%)",
                filter: "blur(50px)",
              }}
              aria-hidden="true"
            />
            <div
              className="relative bg-white border border-line overflow-hidden"
              style={{
                borderRadius: 22,
                boxShadow:
                  "0 0 0 1px rgba(11,18,32,0.04), 0 24px 60px -16px rgba(11,18,32,0.12), 0 8px 24px -8px rgba(29,78,216,0.08)",
              }}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-line bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(29,78,216,0.35)]">
                      <Mascot size={24} bodyColor="#FFFFFF" eyeColor="#FFFFFF" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-white" />
                  </div>
                  <div>
                    <div className="text-[14.5px] font-semibold text-ink leading-tight">
                      Convia · {active.industry}
                    </div>
                    <div className="text-[11.5px] text-ink-3 mt-0.5 flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-success" />
                      Răspuns instant
                    </div>
                  </div>
                </div>
                <div className="flex items-center -space-x-2" aria-label="Echipa Convia">
                  {team.slice(0, 3).map((member) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={member.id}
                      src={member.image}
                      alt={member.name}
                      className="h-7 w-7 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ))}
                </div>
              </div>

              <div className="bg-surface-2/60 px-5 py-5 space-y-2.5 min-h-[300px]">
                {active.conversation.slice(0, visibleCount).map((turn, i) => (
                  <ConversationBubble key={`${active.id}-${i}`} turn={turn} />
                ))}
                {showTyping && <TypingBubble key={`${active.id}-typing`} />}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 bg-white border-t border-line">
                <div className="text-[10.5px] text-soft text-center">
                  Conversație reală generată de Convia pentru {active.industry.toLowerCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConversationBubble({ turn }: { turn: ConversationTurn }) {
  const isUser = turn.from === "user";
  return (
    <div
      className={`flex opacity-0 animate-message-in ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
          <Mascot size={18} bodyColor="#FFFFFF" eyeColor="#FFFFFF" />
        </div>
      )}
      <div
        className={`max-w-[82%] text-[13.5px] leading-relaxed px-3.5 py-2.5 ${
          isUser
            ? "bg-accent text-white shadow-[0_1px_2px_rgba(29,78,216,0.18)]"
            : "bg-white text-ink-2 border border-line shadow-sm"
        }`}
        style={{ borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px" }}
      >
        {turn.text}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start opacity-0 animate-message-in">
      <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
        <Mascot size={18} bodyColor="#FFFFFF" eyeColor="#FFFFFF" />
      </div>
      <div
        className="bg-white border border-line shadow-sm px-3.5 py-3 flex items-center gap-1"
        style={{ borderRadius: "18px 18px 18px 4px" }}
        aria-label="Convia scrie un răspuns"
      >
        {[0, 160, 320].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 rounded-full bg-ink-3/70"
            style={{
              animation: "convia-typing 1.2s ease-in-out infinite",
              animationDelay: `${delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
