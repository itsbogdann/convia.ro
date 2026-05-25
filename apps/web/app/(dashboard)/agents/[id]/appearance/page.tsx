"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { WidgetPosition, type AgentAppearance } from "@convia/shared-types";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useBot } from "../_components/bot-context";

const COLOR_OPTIONS: Array<{ name: string; hex: string }> = [
  { name: "Albastru", hex: "#1D4ED8" },
  { name: "Verde", hex: "#059669" },
  { name: "Mov", hex: "#7C3AED" },
  { name: "Roșu", hex: "#E11D48" },
  { name: "Portocaliu", hex: "#EA580C" },
  { name: "Gri închis", hex: "#475569" },
];

const POSITION_OPTIONS: Array<{ value: WidgetPosition; label: string }> = [
  { value: WidgetPosition.BOTTOM_RIGHT, label: "Jos-dreapta" },
  { value: WidgetPosition.BOTTOM_LEFT, label: "Jos-stânga" },
  { value: WidgetPosition.TOP_RIGHT, label: "Sus-dreapta" },
  { value: WidgetPosition.TOP_LEFT, label: "Sus-stânga" },
];

export default function BotAppearancePage() {
  const { teamId, agent } = useBot();
  const queryClient = useQueryClient();

  const [appearance, setAppearance] = useState<AgentAppearance>(agent.appearance);

  const isDirty =
    JSON.stringify(appearance) !== JSON.stringify(agent.appearance);

  const save = useMutation({
    mutationFn: () =>
      api.agents.update(teamId, agent.id, { appearance }),
    onSuccess: () => {
      toast.success("Aspect salvat.");
      queryClient.invalidateQueries({ queryKey: ["agent", teamId, agent.id] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Nu am putut salva.");
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8">
      <div className="space-y-6">
        <section className="card p-6 lg:p-7 space-y-5">
          <div>
            <h2 className="text-h5 font-gilroy text-ink mb-1">Brand</h2>
            <p className="text-[13px] text-ink-3">
              Cum arată botul tău în chat.
            </p>
          </div>

          <div>
            <span className="label">Culoare principală</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {COLOR_OPTIONS.map((opt) => {
                const selected = appearance.primaryColor === opt.hex;
                return (
                  <button
                    key={opt.hex}
                    type="button"
                    onClick={() =>
                      setAppearance({ ...appearance, primaryColor: opt.hex })
                    }
                    className={cn(
                      "h-12 rounded-xl border-2 transition-all relative",
                      selected
                        ? "border-ink shadow-ring-accent"
                        : "border-line-strong hover:border-ink-3",
                    )}
                    style={{ backgroundColor: opt.hex }}
                    aria-label={opt.name}
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
          </div>

          <div>
            <label className="label" htmlFor="chat-title">
              Titlul ferestrei de chat
            </label>
            <input
              id="chat-title"
              type="text"
              value={appearance.chatTitle}
              onChange={(e) =>
                setAppearance({ ...appearance, chatTitle: e.target.value })
              }
              className="input"
              maxLength={50}
            />
          </div>
        </section>

        <section className="card p-6 lg:p-7 space-y-5">
          <div>
            <h2 className="text-h5 font-gilroy text-ink mb-1">Mesaje</h2>
            <p className="text-[13px] text-ink-3">
              Ce vede vizitatorul când deschide chat-ul.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="welcome">
              Mesaj de bun venit
            </label>
            <textarea
              id="welcome"
              value={appearance.welcomeMessage}
              onChange={(e) =>
                setAppearance({ ...appearance, welcomeMessage: e.target.value })
              }
              rows={3}
              maxLength={300}
              className="input !h-auto resize-y py-3 leading-relaxed"
            />
            <p className="text-[12px] text-soft mt-1.5">
              Primul mesaj pe care îl trimite botul.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="placeholder">
              Placeholder în câmpul de input
            </label>
            <input
              id="placeholder"
              type="text"
              value={appearance.inputPlaceholder}
              onChange={(e) =>
                setAppearance({
                  ...appearance,
                  inputPlaceholder: e.target.value,
                })
              }
              maxLength={80}
              className="input"
            />
          </div>
        </section>

        <section className="card p-6 lg:p-7 space-y-5">
          <div>
            <h2 className="text-h5 font-gilroy text-ink mb-1">Poziție</h2>
            <p className="text-[13px] text-ink-3">
              Unde apare butonul pe pagină.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {POSITION_OPTIONS.map((opt) => {
              const selected = appearance.position === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setAppearance({ ...appearance, position: opt.value })
                  }
                  className={cn(
                    "rounded-xl border-2 px-3 py-2.5 text-[13px] font-bold transition-all",
                    selected
                      ? "border-accent bg-accent-soft text-ink"
                      : "border-line-strong text-ink-3 hover:border-ink-3",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex items-center justify-end gap-2 sticky bottom-4">
          <button
            type="button"
            onClick={() => setAppearance(agent.appearance)}
            disabled={!isDirty || save.isPending}
            className="btn-ghost"
          >
            Resetează
          </button>
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={!isDirty || save.isPending}
            className="btn-primary"
          >
            {save.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Se salvează...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvează modificările
              </>
            )}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3 mb-3">
            Previzualizare
          </div>
          <Preview appearance={appearance} />
        </div>
      </aside>
    </div>
  );
}

function Preview({ appearance }: { appearance: AgentAppearance }) {
  return (
    <div className="bg-surface-3 rounded-xl p-5 min-h-[260px] flex flex-col justify-end gap-3">
      <div className="bg-white rounded-2xl border border-line shadow-card p-3 max-w-[240px] mr-auto">
        <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-3 mb-1.5">
          {appearance.chatTitle || "Asistent"}
        </div>
        <div className="text-[12.5px] text-ink leading-snug">
          {appearance.welcomeMessage || "Salut! Cu ce te ajut?"}
        </div>
      </div>

      <div
        className={cn(
          "flex items-center pt-2",
          appearance.position.endsWith("right") ? "justify-end" : "justify-start",
        )}
      >
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-cta transition-colors"
          style={{ backgroundColor: appearance.primaryColor }}
        >
          <MessageCircle className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
