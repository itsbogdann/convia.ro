"use client";

import { Inbox, Bell, UserCheck, Check } from "lucide-react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Mascot } from "@/components/ui/brand-mark";
import { team } from "@/data/team";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

export function TeamTakeoverSection() {
  return (
    <section
      id="echipa"
      aria-labelledby="team-heading"
      className="section-y bg-white relative overflow-hidden"
    >
      <div className="container-x">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <FadeInOnScroll className="lg:col-span-5">
            <div className="max-w-lg">
              <span className="section-label">Echipa ta</span>
              <h2
                id="team-heading"
                className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy"
              >
                Echipa ta preia<br />când e nevoie.
              </h2>
              <p className="mt-5 text-body-lg text-ink-3">
                Botul răspunde la 80% din întrebări automat. Pentru restul, colegii tăi sunt acolo,
                cu acces la tot istoricul conversațiilor și un inbox comun.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  {
                    icon: UserCheck,
                    title: "Preluare cu un click",
                    description:
                      "Când botul nu știe, un coleg preia conversația fără să o ia de la zero.",
                  },
                  {
                    icon: Inbox,
                    title: "Inbox comun pentru toți",
                    description:
                      "Toate conversațiile, pe toate canalele, într-un singur loc. Oricine din echipă poate ajuta.",
                  },
                  {
                    icon: Bell,
                    title: "Notificări instant",
                    description:
                      "Email, WhatsApp sau push pe mobil. Vezi imediat când e nevoie de tine.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} className="flex items-start gap-3.5">
                      <div className="h-9 w-9 rounded-xl bg-accent-soft border border-accent-ring/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-accent" strokeWidth={2.25} />
                      </div>
                      <div>
                        <div className="text-[15px] font-bold text-ink leading-tight tracking-tight">
                          {item.title}
                        </div>
                        <div className="mt-1 text-[14px] font-semibold text-ink-3 leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </FadeInOnScroll>

          {/* Right: team stack + inbox mockup */}
          <FadeInOnScroll className="lg:col-span-7" delay={120}>
            <div className="relative">
              {/* Ambient glow */}
              <div
                className="absolute -inset-10 -z-10 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(29,78,216,0.10) 0%, rgba(29,78,216,0.03) 50%, transparent 80%)",
                  filter: "blur(50px)",
                }}
                aria-hidden="true"
              />

              {/* Team avatars (animated tooltips) */}
              <div className="flex items-center justify-center gap-0 mb-8">
                <AnimatedTooltip items={team} />
              </div>
              <p className="text-center text-[13px] font-semibold text-ink-3 mb-10">
                <span className="text-success">●</span>{" "}
                <span className="text-ink-2">5 colegi online</span>{" "}
                <span className="text-soft">· răspund în mai puțin de 5 minute</span>
              </p>

              {/* Inbox mockup */}
              <div
                className="relative bg-white border border-line overflow-hidden"
                style={{
                  borderRadius: 20,
                  boxShadow:
                    "0 0 0 1px rgba(11,18,32,0.04), 0 24px 60px -16px rgba(11,18,32,0.12), 0 8px 24px -8px rgba(29,78,216,0.08)",
                }}
              >
                {/* Inbox header */}
                <div className="px-5 py-3.5 border-b border-line bg-gradient-to-br from-white to-accent-soft/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                      <Inbox className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-ink leading-tight">Inbox comun</div>
                      <div className="text-[11px] font-semibold text-ink-3 mt-0.5">12 conversații active</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Live
                  </div>
                </div>

                {/* Conversation rows */}
                <ul className="divide-y divide-line">
                  <InboxRow
                    customerName="Andreea Marcu"
                    channel="WhatsApp"
                    channelColor="#25D366"
                    preview="Bună, ce ore aveți de lucru duminica?"
                    time="acum 2 min"
                    assignedTo="Convia"
                    assignedColor="bg-accent"
                    isBot
                    unread
                  />
                  <InboxRow
                    customerName="Vlad Iliescu"
                    channel="Site"
                    channelColor="#1D4ED8"
                    preview="Am o problemă cu plata. Cardul a fost respins de două ori..."
                    time="acum 12 min"
                    assignedTo="Andrei P."
                    assignedAvatar={team[0].image}
                    assignedColor="bg-[#F59E0B]"
                    unread
                  />
                  <InboxRow
                    customerName="Cristina Voinea"
                    channel="WhatsApp"
                    channelColor="#25D366"
                    preview="Mulțumesc! Mi-a ajuns coletul azi. ✓"
                    time="acum 1 oră"
                    assignedTo="Maria I."
                    assignedAvatar={team[1].image}
                    assignedColor="bg-[#10B981]"
                  />
                  <InboxRow
                    customerName="Tudor Negrescu"
                    channel="Messenger"
                    channelColor="#A855F7"
                    preview="Aveți cumva și varianta în albastru?"
                    time="acum 3 ore"
                    assignedTo="Convia"
                    assignedColor="bg-accent"
                    isBot
                  />
                </ul>

                {/* Footer */}
                <div className="px-5 py-3 bg-surface-2/50 flex items-center justify-between text-[12px] font-semibold">
                  <span className="text-ink-3">
                    Răspuns mediu: <span className="text-ink">42 secunde</span>
                  </span>
                  <span className="text-soft">Astăzi · {new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "long" })}</span>
                </div>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </div>
    </section>
  );
}

function InboxRow({
  customerName,
  channel,
  channelColor,
  preview,
  time,
  assignedTo,
  assignedColor,
  assignedAvatar,
  isBot,
  unread,
}: {
  customerName: string;
  channel: string;
  channelColor: string;
  preview: string;
  time: string;
  assignedTo: string;
  assignedColor: string;
  assignedAvatar?: string;
  isBot?: boolean;
  unread?: boolean;
}) {
  return (
    <li className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface-2/40 transition-colors">
      {/* Customer avatar (initials) */}
      <div className="relative h-9 w-9 flex-shrink-0">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[12px] font-bold text-ink-2">
          {customerName
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white"
          style={{ backgroundColor: channelColor }}
          aria-label={channel}
        />
      </div>

      {/* Customer + preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13.5px] font-bold text-ink leading-tight truncate">
            {customerName}
          </span>
          <span className="text-[11px] font-semibold text-soft flex-shrink-0">{time}</span>
        </div>
        <div className="text-[12.5px] font-semibold text-ink-3 leading-tight mt-1 truncate">
          {preview}
        </div>
      </div>

      {/* Assigned chip */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {unread && <span className="h-2 w-2 rounded-full bg-accent" />}
        <div
          className={`h-7 pl-1 pr-2.5 rounded-full ${assignedColor} text-white text-[11px] font-bold flex items-center gap-1.5`}
        >
          {isBot ? (
            <span className="h-5 w-5 rounded-full bg-accent flex items-center justify-center border-2 border-white">
              <Mascot size={13} bodyColor="#FFFFFF" eyeColor="#FFFFFF" />
            </span>
          ) : assignedAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={assignedAvatar}
              alt=""
              className="h-5 w-5 rounded-full object-cover border-2 border-white"
            />
          ) : (
            <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          )}
          {assignedTo}
        </div>
      </div>
    </li>
  );
}
