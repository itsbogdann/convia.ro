"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const COLOR_OPTIONS: Array<{ name: string; hex: string }> = [
  { name: "Albastru", hex: "#1D4ED8" },
  { name: "Verde", hex: "#059669" },
  { name: "Mov", hex: "#7C3AED" },
  { name: "Roșu", hex: "#E11D48" },
  { name: "Portocaliu", hex: "#EA580C" },
  { name: "Gri închis", hex: "#475569" },
];

interface StepBrandProps {
  name: string;
  color: string;
  onChange: (next: { name?: string; color?: string }) => void;
}

export function StepBrand({ name, color, onChange }: StepBrandProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,260px] gap-7">
      <div className="space-y-5">
        <div>
          <label className="label" htmlFor="bot-name">
            Numele botului
          </label>
          <input
            id="bot-name"
            type="text"
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="ex: Maria"
            maxLength={32}
            className="input"
            autoFocus
          />
          <p className="text-[12px] text-soft mt-1.5">
            Apare la începutul conversațiilor. Maxim 32 caractere.
          </p>
        </div>

        <div>
          <span className="label">Culoarea brandului</span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {COLOR_OPTIONS.map((option) => {
              const selected = color === option.hex;
              return (
                <button
                  key={option.hex}
                  type="button"
                  onClick={() => onChange({ color: option.hex })}
                  aria-label={option.name}
                  className={cn(
                    "h-12 rounded-xl border-2 transition-all relative",
                    selected
                      ? "border-ink shadow-ring-accent"
                      : "border-line-strong hover:border-ink-3",
                  )}
                  style={{ backgroundColor: option.hex }}
                >
                  {selected && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[11px] font-bold">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[12px] text-soft mt-1.5">
            Culoarea bulei de chat și a butoanelor.
          </p>
        </div>
      </div>

      <div className="bg-surface-3 rounded-2xl p-5 border border-line">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3 mb-3">
          Previzualizare
        </div>
        <BotPreview name={name || "Bot"} color={color} />
      </div>
    </div>
  );
}

function BotPreview({ name, color }: { name: string; color: string }) {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-line shadow-card p-3 max-w-[220px] ml-auto">
        <div className="text-[12.5px] text-ink leading-snug">
          Salut! Sunt {name}. Cu ce te pot ajuta azi?
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-cta transition-colors"
          style={{ backgroundColor: color }}
        >
          <MessageCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
