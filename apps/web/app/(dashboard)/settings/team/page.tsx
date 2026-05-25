import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export const metadata = { title: "Echipă" };

export default function TeamSettingsPage() {
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
        <h1 className="text-h2 font-gilroy text-ink">Echipă</h1>
        <p className="mt-1.5 text-[14.5px] text-ink-3">
          Invită colegi, schimbă rolurile și asignează boți.
        </p>
      </div>

      <div className="card p-10 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
          <Users className="h-6 w-6 text-accent" strokeWidth={2.25} />
        </div>
        <h2 className="text-h4 font-gilroy text-ink mb-2">În curs de construire</h2>
        <p className="text-[14px] text-ink-3 max-w-md mx-auto">
          Managementul echipei va fi disponibil în curând.
        </p>
      </div>
    </div>
  );
}
