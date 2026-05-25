"use client";

import { BarChart3 } from "lucide-react";

export default function BotAnalyticsPage() {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
        <BarChart3 className="h-6 w-6 text-accent" strokeWidth={2.25} />
      </div>
      <h3 className="text-h5 font-gilroy text-ink mb-2">
        Analitica vine în curând
      </h3>
      <p className="text-[14px] text-ink-3 max-w-md mx-auto leading-relaxed">
        Vei vedea statistici despre numărul de conversații, subiectele cele mai
        frecvente, rata de satisfacție și unde botul nu reușește să răspundă.
      </p>
    </div>
  );
}
