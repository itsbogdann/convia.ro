"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Send,
  Sparkles,
  Wallet,
  Zap,
  ShieldCheck,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { Mascot } from "@/components/ui/brand-mark";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

type Msg = { id: number; from: "user" | "bot"; text: string };

type CannedReply = {
  question: string;
  shortLabel: string;
  icon: LucideIcon;
  answer: string;
  followUps?: string[];
};

const CANNED: CannedReply[] = [
  {
    question: "Cât costă Convia?",
    shortLabel: "Cât costă?",
    icon: Wallet,
    answer:
      "Avem 3 pachete: Free (0€), Start (29€/lună) și Pro (89€/lună), toate cu TVA. Pachetele plătite vin cu 14 zile gratuit, fără card. Vrei să vezi pachetele în detaliu mai jos? 👇",
    followUps: ["Cât durează configurarea?", "E sigur cu datele mele?"],
  },
  {
    question: "Cât durează configurarea?",
    shortLabel: "Cât durează configurarea?",
    icon: Zap,
    answer:
      "În medie 5–10 minute. Te înregistrezi, încarci informațiile despre afacere (site sau PDF), alegi canalul (site sau WhatsApp) și botul e live. Mai repede decât o cafea ☕",
    followUps: ["Cum se conectează la WhatsApp?", "Cât costă Convia?"],
  },
  {
    question: "Cum se conectează la WhatsApp?",
    shortLabel: "Conectare WhatsApp",
    icon: MessageSquare,
    answer:
      "Folosim WhatsApp Business API oficial, de la Meta. Conectarea se face în ~10 minute, direct din contul tău Convia. Nu pierzi conturile și răspunzi automat la orice mesaj care intră pe WhatsApp.",
    followUps: ["E sigur cu datele mele?", "Cât costă Convia?"],
  },
  {
    question: "E sigur cu datele mele?",
    shortLabel: "Siguranța datelor",
    icon: ShieldCheck,
    answer:
      "Da. GDPR-compliant, criptare AES-256, servere în UE (Germania și Franța). Nu folosim datele tale pentru antrenament și îți semnăm DPA la cerere. Datele clienților tăi nu părăsesc niciodată Europa. 🔒",
    followUps: ["Cât durează configurarea?", "Cât costă Convia?"],
  },
];

const FALLBACK_ANSWER =
  "Bună întrebare! Pe site-ul tău, botul va răspunde pe baza propriilor tale informații. Înregistrează-te gratuit ca să-l configurezi pentru afacerea ta. ✨";

const INITIAL_QUESTIONS = CANNED.map((c) => c.question);

let idSeq = 0;

export function LiveDemoSection() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>(INITIAL_QUESTIONS);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping, hasInteracted]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setHasInteracted(true);
    setMessages((prev) => [...prev, { id: ++idSeq, from: "user", text: trimmed }]);
    setInput("");
    setQuickReplies([]);
    setIsTyping(true);

    const canned = CANNED.find(
      (c) => c.question.toLowerCase() === trimmed.toLowerCase()
    );
    const answer = canned?.answer ?? FALLBACK_ANSWER;
    const followUps = canned?.followUps ?? [];

    const delay = 700 + Math.min(answer.length * 7, 900);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: ++idSeq, from: "bot", text: answer }]);
      if (followUps.length > 0) {
        setTimeout(() => setQuickReplies(followUps), 200);
      }
    }, delay);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <section
      id="demo"
      aria-labelledby="demo-heading"
      className="section-y bg-soft relative overflow-hidden"
    >
      <div className="container-x">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: pitch */}
          <FadeInOnScroll className="lg:col-span-6">
            <div className="max-w-lg">
              <span className="section-label">Demo în direct</span>
              <h2
                id="demo-heading"
                className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy"
              >
                Vorbește cu Convia.<br />Acum, fără cont.
              </h2>
              <p className="mt-5 text-body-lg text-ink-3">
                Așa va arăta și pe site-ul tău. Apasă pe o întrebare sau scrie-i tu — răspunsurile
                sunt în timp real.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  {
                    icon: Sparkles,
                    title: "Răspunde instant",
                    description: "Sub o secundă pentru întrebări frecvente.",
                  },
                  {
                    icon: MessageSquare,
                    title: "Vorbește românește",
                    description: "Cu diacritice, cu regionalisme, fără greșeli.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Învață din site-ul tău",
                    description: "Răspunde corect, nu inventează.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} className="flex items-start gap-3.5">
                      <div className="h-8 w-8 rounded-lg bg-white border border-line shadow-card flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-accent" strokeWidth={2.25} />
                      </div>
                      <div>
                        <div className="text-[15px] font-semibold text-ink leading-tight tracking-tight">
                          {item.title}
                        </div>
                        <div className="mt-1 text-[14px] text-ink-3 leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </FadeInOnScroll>

          {/* Right: chat widget */}
          <FadeInOnScroll className="lg:col-span-6" delay={120}>
            <div className="relative mx-auto lg:ml-auto lg:mr-0 max-w-[400px]">
              {/* Ambient glow behind widget */}
              <div
                className="absolute -inset-12 -z-10 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(29,78,216,0.16) 0%, rgba(29,78,216,0.05) 50%, transparent 80%)",
                  filter: "blur(50px)",
                }}
                aria-hidden="true"
              />

              {/* The widget card */}
              <div
                className="relative bg-white border border-line overflow-hidden flex flex-col"
                style={{
                  borderRadius: 24,
                  boxShadow:
                    "0 0 0 1px rgba(11,18,32,0.04), 0 24px 60px -16px rgba(11,18,32,0.12), 0 8px 24px -8px rgba(29,78,216,0.10)",
                  height: 600,
                }}
              >
                {/* Accent stripe at top */}
                <div className="h-1 bg-gradient-to-r from-accent via-primary-500 to-accent" />

                {/* Header */}
                <div className="px-5 py-4 border-b border-line bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(29,78,216,0.35)]">
                        <Mascot size={24} bodyColor="#FFFFFF" eyeColor="#1F4ED8" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-white" />
                    </div>
                    <div>
                      <div className="text-[14.5px] font-semibold text-ink leading-tight">
                        Convia
                      </div>
                      <div className="text-[11.5px] text-ink-3 mt-0.5 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-success" />
                        Online · răspunde în secunde
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.08em] font-bold bg-surface-2 text-ink-3 px-2 py-1 rounded-full border border-line">
                    Demo
                  </span>
                </div>

                {/* Conversation area */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-5 pt-5 pb-2 space-y-3"
                  aria-live="polite"
                >
                  {/* Welcome card */}
                  <div className="relative rounded-2xl bg-gradient-to-br from-accent-soft to-white border border-accent-ring/30 p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-white border border-line shadow-card flex items-center justify-center flex-shrink-0">
                        <span className="text-lg leading-none" aria-hidden="true">👋</span>
                      </div>
                      <div>
                        <div className="text-[14.5px] font-semibold text-ink leading-tight">
                          Salut!
                        </div>
                        <div className="mt-1 text-[13.5px] text-ink-2 leading-relaxed">
                          Sunt asistentul Convia. Alege o întrebare populară sau scrie-mi direct.
                        </div>
                      </div>
                    </div>
                  </div>

                  {messages.map((msg) => (
                    <Bubble key={msg.id} from={msg.from}>
                      {msg.text}
                    </Bubble>
                  ))}
                  {isTyping && <TypingBubble />}
                </div>

                {/* Quick replies */}
                {quickReplies.length > 0 && (
                  <div className="px-5 pt-3 pb-1 border-t border-line bg-surface-2/50">
                    <div className="text-[10.5px] uppercase tracking-[0.08em] font-bold text-soft mb-2.5">
                      {hasInteracted ? "Mai vrei să afli" : "Sugestii populare"}
                    </div>
                    <div className="space-y-2">
                      {quickReplies.slice(0, 4).map((q) => {
                        const meta = CANNED.find((c) => c.question === q);
                        const Icon = meta?.icon ?? Sparkles;
                        return (
                          <button
                            key={q}
                            type="button"
                            onClick={() => sendMessage(q)}
                            className="group w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white border border-line hover:border-accent-ring hover:shadow-card transition-all"
                          >
                            <div className="h-7 w-7 rounded-lg bg-accent-soft flex items-center justify-center flex-shrink-0 group-hover:bg-accent transition-colors">
                              <Icon className="h-3.5 w-3.5 text-accent group-hover:text-white transition-colors" strokeWidth={2.25} />
                            </div>
                            <span className="text-[13.5px] font-semibold text-ink-2 group-hover:text-ink flex-1">
                              {meta?.shortLabel ?? q}
                            </span>
                            <svg
                              className="h-3.5 w-3.5 text-soft group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Input area */}
                <form
                  onSubmit={handleSubmit}
                  className="border-t border-line bg-white px-4 py-3 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Scrie un mesaj..."
                    className="flex-1 px-3 py-2.5 text-[14px] bg-surface-2 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-accent-ring transition-all text-ink placeholder:text-soft"
                    aria-label="Scrie un mesaj"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      input.trim() && !isTyping
                        ? "bg-accent text-white shadow-cta hover:bg-accent-hover"
                        : "bg-surface-2 text-soft cursor-not-allowed"
                    }`}
                    aria-label="Trimite mesajul"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

                {/* Footer */}
                <div className="px-4 pb-3 pt-1 bg-white">
                  <div className="text-[10.5px] text-soft text-center">
                    Powered by{" "}
                    <span className="inline-flex items-center gap-1 font-semibold text-ink-3">
                      <Mascot size={10} bodyColor="#475569" eyeColor="#FFFFFF" />
                      Convia
                    </span>{" "}
                    · 100% românesc 🇷🇴
                  </div>
                </div>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </section>
  );
}

function Bubble({ from, children }: { from: "user" | "bot"; children: React.ReactNode }) {
  const isUser = from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} ${isUser ? "" : "pr-6"}`}>
      <div
        className={`max-w-[88%] text-[13.5px] leading-relaxed px-3.5 py-2.5 ${
          isUser
            ? "bg-accent text-white shadow-[0_1px_2px_rgba(29,78,216,0.18)]"
            : "bg-white text-ink-2 border border-line shadow-card"
        }`}
        style={{
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start pr-6">
      <div
        className="bg-white text-ink-2 border border-line shadow-card px-4 py-3 inline-flex items-center gap-1.5"
        style={{ borderRadius: "18px 18px 18px 4px" }}
      >
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-soft inline-block"
      style={{
        animation: "convia-typing 1.2s ease-in-out infinite",
        animationDelay: `${delay}ms`,
      }}
    />
  );
}
