import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export const metadata = { title: "Bot nou" };

export default function NewAgentPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-7">
      <Link
        href="/agents"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Înapoi la boți
      </Link>

      <div className="card p-10 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
          <Sparkles className="h-6 w-6 text-accent" strokeWidth={2.25} />
        </div>
        <h1 className="text-h3 font-gilroy text-ink mb-2">Creează un bot nou</h1>
        <p className="text-[14px] text-ink-3 max-w-md mx-auto">
          Wizard-ul de creare bot va fi disponibil în curând. Te vom ghida pas cu pas
          prin configurarea bot-ului tău.
        </p>
      </div>
    </div>
  );
}
