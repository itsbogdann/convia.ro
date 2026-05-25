import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

export const metadata = { title: "Facturare" };

export default function BillingSettingsPage() {
  return (
    <div className="max-w-3xl space-y-7">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Înapoi la setări
      </Link>

      <div>
        <h1 className="text-h2 font-gilroy text-ink">Facturare</h1>
        <p className="mt-1.5 text-[14.5px] text-ink-3">
          Planul tău, conversațiile incluse și istoricul facturilor.
        </p>
      </div>

      <div className="card p-10 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
          <CreditCard className="h-6 w-6 text-accent" strokeWidth={2.25} />
        </div>
        <h2 className="text-h4 font-gilroy text-ink mb-2">În curs de construire</h2>
        <p className="text-[14px] text-ink-3 max-w-md mx-auto">
          Detaliile de facturare vor fi disponibile în curând.
        </p>
      </div>
    </div>
  );
}
