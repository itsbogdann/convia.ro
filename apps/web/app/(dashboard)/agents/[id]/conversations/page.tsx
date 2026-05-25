"use client";

import { MessageSquare } from "lucide-react";

export default function BotConversationsPage() {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
        <MessageSquare className="h-6 w-6 text-accent" strokeWidth={2.25} />
      </div>
      <h3 className="text-h5 font-gilroy text-ink mb-2">
        Nicio conversație încă
      </h3>
      <p className="text-[14px] text-ink-3 max-w-md mx-auto leading-relaxed">
        După ce botul tău primește primii vizitatori, toate conversațiile lor vor
        apărea aici. Vei putea răspunde manual când e nevoie.
      </p>
    </div>
  );
}
