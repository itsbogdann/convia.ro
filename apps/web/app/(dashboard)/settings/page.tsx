import Link from "next/link";
import { ArrowRight, CreditCard, Settings as Cog, Users } from "lucide-react";

export const metadata = { title: "Setări" };

const SECTIONS = [
  {
    icon: Cog,
    title: "Spațiul de lucru",
    description: "Nume, brand, industrie, datele firmei.",
    href: "/settings/workspace" as const,
  },
  {
    icon: Users,
    title: "Echipă",
    description: "Invită colegi, schimbă rolurile, asignează boți.",
    href: "/settings/team" as const,
  },
  {
    icon: CreditCard,
    title: "Facturare",
    description: "Planul, conversațiile incluse, istoricul facturilor.",
    href: "/settings/billing" as const,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-h2 font-gilroy text-ink">Setări</h1>
        <p className="mt-1.5 text-[14.5px] text-ink-3">
          Configurări pentru spațiul tău de lucru, echipă și facturare.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="card card-hover p-6 flex items-start gap-4 group"
            >
              <div className="h-10 w-10 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4.5 w-4.5 text-accent" strokeWidth={2.25} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-ink leading-tight">
                  {section.title}
                </div>
                <div className="text-[13px] text-ink-3 mt-1 leading-relaxed">
                  {section.description}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-soft group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
