"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Sparkles,
  Wallet,
  Zap,
  ShieldCheck,
  MessageSquare,
  ChevronUp,
  ChevronRight,
  Clock,
  Languages,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import { Mascot } from "@/components/ui/brand-mark";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";
import { team } from "@/data/team";

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
      "Avem 3 pachete, fără surprize:\n" +
      "• Gratuit: 0 RON/lună (100 conversații)\n" +
      "• Business: 149 RON/lună (1.000 conversații incluse)\n" +
      "• Premium: 349 RON/lună (5.000 conversații incluse)\n\n" +
      "Plata anuală: -20%. Dacă treci de limită, plătești doar conversațiile în plus: 0,25 RON/conv pe Business, 0,12 RON/conv pe Premium. Niciodată nu îți blocăm botul. Vezi detalii mai jos? 👇",
    followUps: ["Cât durează configurarea?", "E sigur cu datele mele?"],
  },
  {
    question: "Cât durează configurarea?",
    shortLabel: "Cât durează configurarea?",
    icon: Zap,
    answer:
      "În medie 5–10 minute. 3 pași simpli:\n" +
      "• Te înregistrezi gratuit\n" +
      "• Încarci informațiile (site sau PDF)\n" +
      "• Alegi canalul (site sau WhatsApp)\n\n" +
      "Și botul e live. Mai repede decât o cafea ☕",
    followUps: ["Cum se conectează la WhatsApp?", "Cât costă Convia?"],
  },
  {
    question: "Cum se conectează la WhatsApp?",
    shortLabel: "Conectare WhatsApp",
    icon: MessageSquare,
    answer:
      "Folosim WhatsApp Business API oficial, de la Meta. Conectarea durează ~10 minute, direct din contul tău Convia.\n\n" +
      "Nu pierzi conturile și răspunzi automat la orice mesaj care intră pe WhatsApp.",
    followUps: ["E sigur cu datele mele?", "Cât costă Convia?"],
  },
  {
    question: "E sigur cu datele mele?",
    shortLabel: "Siguranța datelor",
    icon: ShieldCheck,
    answer:
      "Da, complet sigur 🔒:\n" +
      "• GDPR-compliant\n" +
      "• Criptare AES-256\n" +
      "• Servere în UE (Germania și Franța)\n" +
      "• Nu folosim datele tale pentru antrenament\n" +
      "• DPA semnabil la cerere\n\n" +
      "Datele clienților tăi nu părăsesc niciodată Europa.",
    followUps: ["Cât durează configurarea?", "Cât costă Convia?"],
  },
];

const FALLBACKS: string[] = [
  "Salut! Aici sunt doar în modul demo și răspund la câteva subiecte frecvente despre Convia.\n\n" +
    "Pe site-ul tău însă, voi răspunde pe baza propriilor tale informații. Înregistrează-te gratuit ca să mă configurezi pentru afacerea ta. ✨",
  "Sunt în modul demo, așa că pot răspunde doar la subiecte generale despre Convia.\n\n" +
    "Vrei să mă pui la treabă pentru afacerea ta? Durează 5 minute să-ți configurezi propriul asistent. 🚀",
  "Pentru asta am nevoie de datele afacerii tale, pe care încă nu le am.\n\n" +
    "Cere acces gratuit la Convia și încarcă-ți site-ul sau un PDF, gata să răspund corect în câteva minute. 👇",
  "Aici răspund doar la subiecte demo. Pe site-ul tău, voi învăța din propriile tale informații (site, PDF, Excel) și voi răspunde clienților 24/7.\n\n" +
    "Fără cunoștințe tehnice. Fără card. 14 zile gratuit.",
  "În modul demo nu pot răspunde la lucruri specifice afacerii tale. Pentru asta, trebuie să mă pui pe site-ul tău cu informațiile tale.\n\n" +
    "Cere setup gratuit și ne ocupăm noi de tot. Îți facem cont și instalăm botul în locul tău. 🇷🇴",
];

const INITIAL_QUESTIONS = CANNED.map((c) => c.question);

let idSeq = 0;

export function LiveDemoSection() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>(INITIAL_QUESTIONS);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [quickRepliesVisible, setQuickRepliesVisible] = useState(true);
  const [drawerForceOpen, setDrawerForceOpen] = useState(true);
  const fallbackIndex = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping, quickRepliesVisible]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setHasInteracted(true);
    // From this point on, drawer goes to peek state (hover to expand)
    setDrawerForceOpen(false);

    // Step 1: Slide down quick replies + add user message immediately
    setQuickRepliesVisible(false);
    setMessages((prev) => [...prev, { id: ++idSeq, from: "user", text: trimmed }]);
    setInput("");

    const canned = CANNED.find(
      (c) => c.question.toLowerCase() === trimmed.toLowerCase()
    );
    let answer: string;
    let followUps: string[];
    if (canned) {
      answer = canned.answer;
      followUps = canned.followUps ?? [];
    } else {
      answer = FALLBACKS[fallbackIndex.current % FALLBACKS.length];
      fallbackIndex.current += 1;
      // After a fallback, restore initial suggestions so the user has a way back
      followUps = INITIAL_QUESTIONS;
    }

    // Step 2: After a beat, bot starts "thinking" (typing indicator)
    const typingStartDelay = 600;
    // Step 3: Bot thinks for ~2-3 seconds depending on answer length
    const thinkingDuration = 1800 + Math.min(answer.length * 4, 800);
    // Step 4: After bot message appears, wait ~2.5s before new suggestions slide up
    const replyRevealDelay = 2500;

    setTimeout(() => setIsTyping(true), typingStartDelay);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: ++idSeq, from: "bot", text: answer }]);
    }, typingStartDelay + thinkingDuration);

    if (followUps.length > 0) {
      setTimeout(() => {
        setQuickReplies(followUps);
        setQuickRepliesVisible(true);
      }, typingStartDelay + thinkingDuration + replyRevealDelay);
    }
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
                Așa va arăta și pe site-ul tău.
                <br />
                Apasă pe o întrebare sau scrie-i tu, răspunsurile sunt în timp real.
              </p>

              <div className="mt-10 relative grid grid-cols-2 max-w-md">
                {/* Cross dividers */}
                <div
                  className="absolute left-0 right-0 top-1/2 h-px bg-slate-300 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-300 -translate-x-1/2 pointer-events-none"
                  aria-hidden="true"
                />

                {[
                  {
                    icon: Zap,
                    stat: <CountUp end={0.4} decimals={1} suffix="s" />,
                    label: "Răspuns mediu",
                  },
                  {
                    icon: Clock,
                    stat: "24/7",
                    label: "Disponibil non-stop",
                  },
                  {
                    icon: Languages,
                    stat: <CountUp end={100} suffix="%" />,
                    label: "Nativ în română",
                  },
                  {
                    icon: Rocket,
                    stat: <CountUp end={5} suffix="min" />,
                    label: "Configurare totală",
                  },
                ].map((item, i) => {
                  const col = i % 2;
                  const row = Math.floor(i / 2);
                  const padding = [
                    col === 0 ? "pr-6" : "pl-6",
                    row === 0 ? "pb-6" : "pt-6",
                  ].join(" ");
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={padding}>
                      <div className="text-[44px] font-gilroy font-bold tracking-tight text-accent leading-none tabular-nums">
                        {item.stat}
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-ink-3">
                        <Icon className="h-3.5 w-3.5 text-accent flex-shrink-0" strokeWidth={2.5} />
                        <span className="leading-tight">{item.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  height: 640,
                }}
              >
                {/* Header: team stack + subtle accent gradient */}
                <div
                  className="px-5 py-4 border-b border-line flex items-center justify-between"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFFFFF 0%, rgba(239, 246, 255, 0.65) 100%)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar stack: 2 humans + Convia AI */}
                    <div className="relative flex items-center -space-x-2.5">
                      {/* Human team member 1: Andrei */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={team[0].image}
                        alt={team[0].name}
                        className="h-8 w-8 rounded-full border-2 border-white shadow-sm object-cover object-top"
                      />
                      {/* Human team member 2: Maria */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={team[1].image}
                        alt={team[1].name}
                        className="h-8 w-8 rounded-full border-2 border-white shadow-sm object-cover object-top"
                      />
                      {/* Convia AI: primary */}
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(29,78,216,0.40)] border-2 border-white">
                          <Mascot size={22} bodyColor="#FFFFFF" eyeColor="#FFFFFF" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-white" />
                      </div>
                    </div>
                    <div>
                      <div className="text-[16px] font-bold text-ink leading-tight tracking-tight">
                        Convia
                      </div>
                      <div className="text-[12px] font-semibold text-ink-3 mt-0">
                        3 colegi online
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.08em] font-bold bg-accent-soft text-accent px-2.5 py-1 rounded-full border border-accent-ring/30">
                    Demo
                  </span>
                </div>

                {/* Body wrapper: conversation + floating drawer */}
                <div className="relative flex-1 min-h-0 overflow-hidden">
                  {/* Conversation area (scrollable, full height) */}
                  <div
                    ref={scrollRef}
                    className="absolute inset-0 overflow-y-auto px-5 pt-5 pb-16 space-y-3"
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
                        {msg.from === "bot" ? <FormattedAnswer text={msg.text} /> : msg.text}
                      </Bubble>
                    ))}
                    {isTyping && <TypingBubble />}
                  </div>

                  {/* Floating suggestions drawer (peeks from bottom, expands on hover) */}
                  <div
                    className={`absolute left-0 right-0 bottom-0 z-10 transition-transform ease-out ${
                      quickReplies.length > 0 && quickRepliesVisible
                        ? "translate-y-0 duration-[800ms]"
                        : "translate-y-full duration-500"
                    }`}
                    aria-hidden={!quickRepliesVisible}
                  >
                    <div className="group/drawer">
                      <div
                        className={`bg-white border-t border-line shadow-[0_-12px_24px_-16px_rgba(11,18,32,0.10)] overflow-hidden transition-[max-height] duration-[700ms] ease-out ${
                          drawerForceOpen
                            ? "max-h-[420px]"
                            : "max-h-[52px] group-hover/drawer:max-h-[420px]"
                        }`}
                      >
                        {/* Peek header: always visible */}
                        <div className="h-[52px] px-5 flex items-center justify-between cursor-pointer select-none">
                          <span className="text-[10.5px] uppercase tracking-[0.08em] font-bold text-ink-3">
                            {hasInteracted ? "Mai vrei să afli" : "Sugestii populare"}
                          </span>
                          <ChevronUp
                            className={`h-3.5 w-3.5 text-ink-3 transition-transform duration-[700ms] ease-out ${
                              drawerForceOpen
                                ? "rotate-180"
                                : "group-hover/drawer:rotate-180"
                            }`}
                            strokeWidth={2.5}
                          />
                        </div>
                        {/* Expandable content */}
                        <div className="px-5 pb-5 space-y-2">
                          {quickReplies.slice(0, 4).map((q) => {
                            const meta = CANNED.find((c) => c.question === q);
                            const Icon = meta?.icon ?? Sparkles;
                            return (
                              <button
                                key={q}
                                type="button"
                                onClick={() => sendMessage(q)}
                                className="group/btn w-full text-left flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-white border border-line transition-all hover:bg-surface-2 hover:border-line-strong"
                              >
                                <div className="h-7 w-7 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0">
                                  <Icon
                                    className="h-3.5 w-3.5 text-accent"
                                    strokeWidth={2.25}
                                  />
                                </div>
                                <span className="text-[13.5px] font-semibold text-ink-2 flex-1 group-hover/btn:text-ink transition-colors">
                                  {meta?.shortLabel ?? q}
                                </span>
                                <svg
                                  className="h-3.5 w-3.5 text-soft transition-all flex-shrink-0 group-hover/btn:text-ink-2 group-hover/btn:translate-x-0.5"
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
                    </div>
                  </div>
                </div>

                {/* Input area: single pill with inset send button */}
                <form
                  onSubmit={handleSubmit}
                  className="border-t border-line bg-white px-5 py-2.5"
                >
                  <div className="flex items-center gap-2 bg-surface-2 border border-line rounded-full pl-5 pr-1.5 py-1.5 focus-within:bg-white focus-within:border-slate-300 transition-colors">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Scrie un mesaj..."
                      className="flex-1 bg-transparent border-none outline-none py-2 text-[14px] leading-6 font-semibold text-ink caret-accent placeholder:text-soft placeholder:font-semibold focus:placeholder:text-transparent"
                      aria-label="Scrie un mesaj"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isTyping}
                      className={`h-9 w-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                        input.trim() && !isTyping
                          ? "bg-accent text-white shadow-cta hover:bg-accent-hover"
                          : "bg-white border border-line text-soft cursor-not-allowed"
                      }`}
                      aria-label="Trimite mesajul"
                    >
                      <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </form>

                {/* Footer */}
                <div className="px-5 pb-3 bg-white">
                  <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-soft">
                    <span>Susținut de</span>
                    <span className="inline-flex items-center gap-0.5 font-bold text-ink-3 tracking-tight">
                      <Mascot
                        size={12}
                        bodyColor="#475569"
                        eyeColor="#475569"
                      />
                      Convia
                    </span>
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

function FormattedAnswer({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (line === "") return <div key={i} className="h-1" />;
        if (line.startsWith("• ") || line.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-accent font-bold flex-shrink-0 leading-relaxed">•</span>
              <span className="flex-1">{line.replace(/^[•-]\s/, "")}</span>
            </div>
          );
        }
        return (
          <p key={i} className="m-0">
            {line}
          </p>
        );
      })}
    </div>
  );
}

function Bubble({ from, children }: { from: "user" | "bot"; children: React.ReactNode }) {
  const isUser = from === "user";
  return (
    <div
      className={`flex animate-fade-up ${isUser ? "justify-end" : "justify-start pr-6"}`}
      style={{ animationDuration: "0.45s" }}
    >
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
    <div
      className="flex justify-start pr-6 animate-fade-up"
      style={{ animationDuration: "0.3s" }}
    >
      <div
        className="bg-white border border-line shadow-card px-3.5 py-2.5 inline-flex items-center"
        style={{ borderRadius: "18px 18px 18px 4px" }}
      >
        <span
          className="thinking-wave text-[13.5px] font-semibold tracking-tight"
          aria-label="Convia se gândește"
        >
          Mă gândesc
        </span>
      </div>
    </div>
  );
}
