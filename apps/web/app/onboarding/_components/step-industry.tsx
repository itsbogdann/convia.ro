"use client";

import {
  Briefcase,
  Building2,
  LayoutGrid,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Industry } from "@convia/shared-types";
import { cn } from "@/lib/utils";

interface IndustryOption {
  id: Industry;
  label: string;
  description: string;
  icon: LucideIcon;
}

const OPTIONS: IndustryOption[] = [
  {
    id: Industry.RESTAURANT,
    label: "Restaurant / Cafenea",
    description: "Rezervări, meniu, orar.",
    icon: UtensilsCrossed,
  },
  {
    id: Industry.ECOMMERCE,
    label: "Magazin online",
    description: "Produse, livrare, retur.",
    icon: ShoppingBag,
  },
  {
    id: Industry.SERVICII,
    label: "Servicii profesionale",
    description: "Consultanță, agenție, freelance.",
    icon: Briefcase,
  },
  {
    id: Industry.HOTEL,
    label: "Hotel / Cazare",
    description: "Camere, disponibilitate, check-in.",
    icon: Building2,
  },
  {
    id: Industry.OTHER,
    label: "Altele",
    description: "Configurăm de la zero.",
    icon: LayoutGrid,
  },
];

interface StepIndustryProps {
  value: Industry | null;
  onChange: (industry: Industry) => void;
}

export function StepIndustry({ value, onChange }: StepIndustryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "text-left rounded-xl border-2 p-4 flex items-start gap-3 transition-all",
              selected
                ? "border-accent bg-accent-soft shadow-ring-accent"
                : "border-line-strong bg-white hover:border-accent/60 hover:bg-accent-soft/40",
            )}
          >
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                selected
                  ? "bg-accent text-white"
                  : "bg-surface-3 text-ink-3",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14.5px] font-bold text-ink leading-tight">
                {option.label}
              </div>
              <div className="text-[12.5px] text-ink-3 mt-1 leading-snug">
                {option.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export const INDUSTRY_LABELS: Record<Industry, string> = {
  [Industry.RESTAURANT]: "Restaurant / Cafenea",
  [Industry.ECOMMERCE]: "Magazin online",
  [Industry.SERVICII]: "Servicii profesionale",
  [Industry.HOTEL]: "Hotel / Cazare",
  [Industry.OTHER]: "Altele",
};
