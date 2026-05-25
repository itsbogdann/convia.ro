"use client";

import { Check, Facebook, Globe, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelOption {
  id: string;
  label: string;
  description: string;
  icon: typeof Globe;
  available: boolean;
}

const OPTIONS: ChannelOption[] = [
  {
    id: "web",
    label: "Site web",
    description: "Buton de chat în colțul site-ului tău.",
    icon: Globe,
    available: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp Business",
    description: "Răspunde clienților direct pe WhatsApp.",
    icon: MessageCircle,
    available: false,
  },
  {
    id: "messenger",
    label: "Facebook Messenger",
    description: "Conectează botul la pagina ta de Facebook.",
    icon: Facebook,
    available: false,
  },
];

export function StepChannels() {
  return (
    <div className="space-y-2.5">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <div
            key={option.id}
            className={cn(
              "rounded-xl border-2 p-4 flex items-start gap-3 transition-all",
              option.available
                ? "border-accent bg-accent-soft"
                : "border-line bg-surface-3 opacity-70",
            )}
          >
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                option.available
                  ? "bg-accent text-white"
                  : "bg-white text-ink-3",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-[14.5px] font-bold text-ink leading-tight">
                  {option.label}
                </div>
                {!option.available && (
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-ink-3 bg-white border border-line-strong px-1.5 py-0.5 rounded-md">
                    În curând
                  </span>
                )}
              </div>
              <div className="text-[12.5px] text-ink-3 mt-1 leading-snug">
                {option.description}
              </div>
            </div>
            {option.available && (
              <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </div>
            )}
          </div>
        );
      })}

      <p className="text-[12px] text-soft pt-2">
        Botul tău e gata pentru site web. Vei putea activa WhatsApp și
        Messenger când lansăm canalele suplimentare.
      </p>
    </div>
  );
}
