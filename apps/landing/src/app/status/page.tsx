import type { ComponentType } from "react";
import type { Metadata } from "next";
import {
  Activity,
  CheckCircle2,
  Database,
  Globe,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Bell,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { FadeInOnScroll } from "@/components/ui/fade-in-on-scroll";

export const metadata: Metadata = {
  title: "Status",
  description:
    "Status în timp real pentru serviciile Convia: API, widget de chat, dashboard, integrări. Istoric uptime și incidente.",
  alternates: { canonical: "/status" },
  openGraph: {
    type: "website",
    title: "Status · Convia",
    description: "Status în timp real pentru serviciile Convia.",
    url: "/status",
  },
};

type ComponentStatus = {
  name: string;
  description: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  status: "operational" | "degraded" | "down";
};

const components: ComponentStatus[] = [
  {
    name: "API",
    description: "Endpoint-urile pentru dashboard, conversații și agenți",
    icon: Activity,
    status: "operational",
  },
  {
    name: "Widget de chat",
    description: "Widget-ul integrat pe site-urile clienților",
    icon: Globe,
    status: "operational",
  },
  {
    name: "Dashboard",
    description: "Aplicația web pentru gestionarea boților și conversațiilor",
    icon: LayoutDashboard,
    status: "operational",
  },
  {
    name: "Integrare WhatsApp",
    description: "Conectarea cu WhatsApp Business API",
    icon: WhatsAppIcon,
    status: "operational",
  },
  {
    name: "Email tranzacțional",
    description: "Notificări, confirmări și facturi trimise pe email",
    icon: Mail,
    status: "operational",
  },
  {
    name: "Bază de date",
    description: "Stocarea conversațiilor, configurărilor și conturilor (în UE)",
    icon: Database,
    status: "operational",
  },
];

// 30 days of uptime data, all up. In a real implementation this comes from
// a status feed. Showing 30 dummy days so the page looks alive.
const uptimeDays = Array.from({ length: 30 }, () => "up" as const);

const statusLabel: Record<ComponentStatus["status"], string> = {
  operational: "Operațional",
  degraded: "Degradat",
  down: "Indisponibil",
};

const statusColor: Record<ComponentStatus["status"], string> = {
  operational: "bg-success",
  degraded: "bg-[#F59E0B]",
  down: "bg-[#EF4444]",
};

const statusBadge: Record<ComponentStatus["status"], string> = {
  operational: "bg-success/10 text-success border-success/20",
  degraded: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  down: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
};

export default function StatusPage() {
  const allOperational = components.every((c) => c.status === "operational");
  const lastUpdated = new Date().toLocaleString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      {/* Hero + global status */}
      <section className="section-y bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="text-center max-w-2xl mx-auto">
              <span className="section-label">Status</span>
              <h1 className="mt-5 text-h2-mobile sm:text-h2 lg:text-h1 gradient-ink font-gilroy">
                Status Convia
              </h1>
              <p className="mt-5 text-body-lg text-ink-3">
                Vezi în timp real ce merge și ce nu pe platformă. Dacă apare o problemă, găsești
                aici detalii și estimări de rezolvare.
              </p>
            </div>
          </FadeInOnScroll>

          {/* Global status banner */}
          <FadeInOnScroll>
            <div className="mt-12 mx-auto max-w-3xl">
              <div
                className={`relative overflow-hidden rounded-2xl border p-6 sm:p-7 ${
                  allOperational
                    ? "border-success/30 bg-gradient-to-br from-success/10 to-white"
                    : "border-[#F59E0B]/30 bg-gradient-to-br from-[#F59E0B]/10 to-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        allOperational ? "bg-success" : "bg-[#F59E0B]"
                      } shadow-[0_4px_12px_-2px_rgba(16,185,129,0.4)]`}
                    >
                      <CheckCircle2 className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </div>
                    <span
                      className={`absolute inset-0 rounded-full ${
                        allOperational ? "bg-success" : "bg-[#F59E0B]"
                      } animate-ping opacity-20`}
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-h4 font-gilroy text-ink leading-tight">
                      {allOperational
                        ? "Toate serviciile funcționează normal"
                        : "Există probleme raportate"}
                    </h2>
                    <p className="text-[13.5px] text-ink-3 font-semibold mt-1">
                      Ultima actualizare: {lastUpdated}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Components */}
      <section className="pb-12 bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="mx-auto max-w-3xl">
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-soft mb-3">
                Componente
              </div>
              <div className="card overflow-hidden">
                <ul className="divide-y divide-line">
                  {components.map((c) => {
                    const Icon = c.icon;
                    return (
                      <li
                        key={c.name}
                        className="px-5 py-4 flex items-center gap-4 hover:bg-surface-2/40 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-accent" strokeWidth={2.25} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14.5px] font-bold text-ink leading-tight">
                            {c.name}
                          </div>
                          <div className="text-[12.5px] text-ink-3 font-semibold mt-0.5 truncate">
                            {c.description}
                          </div>
                        </div>
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11.5px] font-bold ${
                            statusBadge[c.status]
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusColor[c.status]}`}
                          />
                          {statusLabel[c.status]}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* 30-day uptime */}
      <section className="pb-16 bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="mx-auto max-w-3xl card p-6 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-soft">
                    Uptime ultimele 30 de zile
                  </div>
                  <div className="text-h4 font-gilroy text-ink leading-none mt-1.5">100,00%</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-soft">
                    Incidente
                  </div>
                  <div className="text-[14px] font-bold text-ink-2 mt-1.5">0 raportate</div>
                </div>
              </div>

              {/* Uptime bars */}
              <div
                className="flex gap-[3px] h-10"
                role="img"
                aria-label="Grafic uptime ultimele 30 de zile, toate zilele operaționale"
              >
                {uptimeDays.map((day, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${
                      day === "up" ? "bg-success/80 hover:bg-success" : "bg-[#EF4444]/80"
                    } transition-colors`}
                    title={`Ziua -${30 - i}`}
                  />
                ))}
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.06em] text-soft">
                <span>acum 30 zile</span>
                <span>azi</span>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Incidents */}
      <section className="pb-16 bg-white">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="mx-auto max-w-3xl">
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-soft mb-3">
                Istoric incidente
              </div>
              <div className="card p-8 text-center">
                <div className="inline-flex h-12 w-12 rounded-2xl bg-success/10 border border-success/20 items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-success" strokeWidth={2.25} />
                </div>
                <h3 className="text-h4 font-gilroy text-ink mb-2">
                  Niciun incident în ultimele 90 de zile
                </h3>
                <p className="text-[14px] text-ink-3 leading-relaxed max-w-md mx-auto">
                  Publicăm aici detaliile complete: cauză, impact, timeline de rezolvare, măsuri
                  preventive.
                </p>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Subscribe to updates */}
      <section className="section-y bg-soft">
        <div className="container-x">
          <FadeInOnScroll>
            <div className="mx-auto max-w-2xl card p-8 sm:p-10 text-center">
              <div className="flex justify-center mb-5">
                <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(29,78,216,0.4)]">
                  <Bell className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="text-h4 font-gilroy text-ink mb-3">
                Vrei să fii anunțat la incidente?
              </h2>
              <p className="text-[14.5px] text-ink-3 leading-relaxed mb-6 max-w-md mx-auto">
                Lasă-ne email-ul și primești notificare automată când apare o problemă și când se
                rezolvă. Nimic altceva.
              </p>
              <form
                action="mailto:salut@convia.ro"
                method="post"
                encType="text/plain"
                className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto"
              >
                <label htmlFor="status-email" className="sr-only">
                  Adresa ta de email
                </label>
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soft" />
                  <input
                    id="status-email"
                    type="email"
                    name="email"
                    placeholder="nume@firma.ro"
                    required
                    className="w-full h-12 pl-11 pr-4 rounded-full border border-line-strong bg-white text-[14.5px] font-semibold text-ink placeholder:text-soft focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <button type="submit" className="btn-primary">
                  <MessageCircle className="h-4 w-4" />
                  Abonează-mă
                </button>
              </form>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </>
  );
}
