import Link from "next/link";
import { ArrowRight, Bot, Inbox, Library, Plus } from "lucide-react";

export const metadata = { title: "Acasă" };

export default function DashboardHomePage() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-h2 font-gilroy text-ink">Bun venit înapoi 👋</h1>
        <p className="mt-2 text-[15px] text-ink-3">
          Construiește botul, învață-l cu informațiile tale, conectează-l pe site sau
          WhatsApp. Aici e centrul de control.
        </p>
      </div>

      {/* Quick stats — placeholder, real numbers come from the usage endpoint */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Boți activi" value="—" hint="Niciun bot încă" />
        <StatCard label="Conversații luna asta" value="—" hint="Setează botul ca să începi" />
        <StatCard label="Conversații incluse" value="100" hint="Planul Gratuit" />
      </div>

      {/* Primary actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/agents/new"
          className="group card card-hover p-7 flex flex-col"
        >
          <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center mb-4 shadow-cta">
            <Plus className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-h5 font-gilroy text-ink mb-1.5 leading-tight">
            Creează un bot
          </h2>
          <p className="text-[13.5px] text-ink-3 leading-relaxed mb-4 flex-1">
            5 pași simpli: alegi industria, dai informațiile, conectezi canalul. Botul
            e live în maximum 10 minute.
          </p>
          <span className="inline-flex items-center gap-1.5 text-accent font-bold text-[13.5px] group-hover:gap-2.5 transition-all">
            Începe
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <Link
          href="/conversations"
          className="group card card-hover p-7 flex flex-col"
        >
          <div className="h-10 w-10 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
            <Inbox className="h-5 w-5 text-accent" strokeWidth={2.25} />
          </div>
          <h2 className="text-h5 font-gilroy text-ink mb-1.5 leading-tight">
            Inbox conversații
          </h2>
          <p className="text-[13.5px] text-ink-3 leading-relaxed mb-4 flex-1">
            Vezi toate conversațiile boților tăi într-un singur loc. Preia când e
            nevoie de un coleg uman.
          </p>
          <span className="inline-flex items-center gap-1.5 text-accent font-bold text-[13.5px] group-hover:gap-2.5 transition-all">
            Deschide inbox
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      {/* Secondary nav */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/agents"
          className="card card-hover p-5 flex items-center gap-4 group"
        >
          <div className="h-9 w-9 rounded-lg bg-surface-2 flex items-center justify-center">
            <Bot className="h-4 w-4 text-ink-2" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-ink leading-tight">Boții mei</div>
            <div className="text-[12.5px] text-ink-3">Listează și configurează toți boții.</div>
          </div>
          <ArrowRight className="h-4 w-4 text-soft group-hover:text-accent group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/knowledge-base"
          className="card card-hover p-5 flex items-center gap-4 group"
        >
          <div className="h-9 w-9 rounded-lg bg-surface-2 flex items-center justify-center">
            <Library className="h-4 w-4 text-ink-2" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-ink leading-tight">
              Bază de cunoștințe
            </div>
            <div className="text-[12.5px] text-ink-3">
              Site-uri, PDF-uri și texte pe care învață boții.
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-soft group-hover:text-accent group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="card p-5">
      <div className="text-[10.5px] uppercase tracking-[0.08em] font-bold text-soft">
        {label}
      </div>
      <div className="mt-1.5 text-h3 font-gilroy text-ink leading-none">{value}</div>
      <div className="mt-2 text-[12px] text-ink-3 font-semibold">{hint}</div>
    </div>
  );
}
