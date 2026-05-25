import { Library } from "lucide-react";

export const metadata = { title: "Bază de cunoștințe" };

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-h2 font-gilroy text-ink">Bază de cunoștințe</h1>
        <p className="mt-1.5 text-[14.5px] text-ink-3">
          Site-uri, PDF-uri și texte pe care învață botul tău. Baza e separată pentru
          fiecare bot.
        </p>
      </div>

      <div className="card p-10 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
          <Library className="h-6 w-6 text-accent" strokeWidth={2.25} />
        </div>
        <h2 className="text-h4 font-gilroy text-ink mb-2">Nimic indexat încă</h2>
        <p className="text-[14px] text-ink-3 max-w-md mx-auto">
          Creează un bot și apoi adaugă surse direct din pagina de detaliu a botului.
        </p>
      </div>
    </div>
  );
}
