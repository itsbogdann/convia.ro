import { Inbox } from "lucide-react";

export const metadata = { title: "Inbox" };

export default function ConversationsPage() {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-h2 font-gilroy text-ink">Inbox</h1>
        <p className="mt-1.5 text-[14.5px] text-ink-3">
          Conversațiile tuturor boților tăi, într-un singur loc. Preia când e nevoie.
        </p>
      </div>

      <div className="card p-10 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
          <Inbox className="h-6 w-6 text-accent" strokeWidth={2.25} />
        </div>
        <h2 className="text-h4 font-gilroy text-ink mb-2">Nicio conversație încă</h2>
        <p className="text-[14px] text-ink-3 max-w-md mx-auto">
          Conversațiile apar aici imediat ce un client îți scrie pe site sau pe
          WhatsApp. Creează un bot ca să începi.
        </p>
      </div>
    </div>
  );
}
