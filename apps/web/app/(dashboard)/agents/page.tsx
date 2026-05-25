import Link from "next/link";
import { ArrowRight, Bot, Plus } from "lucide-react";

export const metadata = { title: "Boții mei" };

export default function AgentsPage() {
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-gilroy text-ink">Boții mei</h1>
          <p className="mt-1.5 text-[14.5px] text-ink-3">
            Toți chatboții pe care i-ai creat. Creează unul nou sau gestionează-i pe
            cei existenți.
          </p>
        </div>
        <Link href="/agents/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Bot nou
        </Link>
      </div>

      {/* Empty state — replaced by real list in the next session */}
      <div className="card p-10 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
          <Bot className="h-6 w-6 text-accent" strokeWidth={2.25} />
        </div>
        <h2 className="text-h4 font-gilroy text-ink mb-2">Niciun bot încă</h2>
        <p className="text-[14px] text-ink-3 max-w-md mx-auto mb-6">
          Construiește primul tău chatbot AI în 5 minute. Setup ghidat în 5 pași simpli.
        </p>
        <Link href="/agents/new" className="btn-primary">
          Creează primul bot
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
