"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  KeyRound,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AgentStatus } from "@convia/shared-types";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useBot } from "../_components/bot-context";

const STATUS_OPTIONS: Array<{ value: AgentStatus; label: string; description: string }> = [
  {
    value: AgentStatus.ACTIVE,
    label: "Activ",
    description: "Botul răspunde vizitatorilor.",
  },
  {
    value: AgentStatus.PAUSED,
    label: "Pauză",
    description: "Botul nu mai răspunde, dar configurarea rămâne.",
  },
];

export default function BotSettingsPage() {
  const { teamId, agent } = useBot();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: agent.name,
    description: agent.description ?? "",
    systemPrompt: agent.systemPrompt ?? "",
    status: agent.status,
  });

  const isDirty =
    form.name !== agent.name ||
    form.description !== (agent.description ?? "") ||
    form.systemPrompt !== (agent.systemPrompt ?? "") ||
    form.status !== agent.status;

  const save = useMutation({
    mutationFn: () =>
      api.agents.update(teamId, agent.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        systemPrompt: form.systemPrompt.trim() || null,
        status: form.status,
      }),
    onSuccess: () => {
      toast.success("Setări salvate.");
      queryClient.invalidateQueries({ queryKey: ["agent", teamId, agent.id] });
      queryClient.invalidateQueries({ queryKey: ["agents", teamId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Nu am putut salva.");
    },
  });

  const regenerateKey = useMutation({
    mutationFn: () => api.agents.regenerateKey(teamId, agent.id),
    onSuccess: () => {
      toast.success("Cheie API regenerată. Reinstalează codul pe site.");
      queryClient.invalidateQueries({ queryKey: ["agent", teamId, agent.id] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Nu am putut regenera.");
    },
  });

  const remove = useMutation({
    mutationFn: () => api.agents.remove(teamId, agent.id),
    onSuccess: () => {
      toast.success("Bot șters.");
      router.push("/agents");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Nu am putut șterge.");
    },
  });

  const onDelete = () => {
    const confirmed = confirm(
      `Ștergi botul "${agent.name}"? Toate conversațiile și sursele dispar definitiv. Acțiunea nu poate fi refăcută.`,
    );
    if (confirmed) remove.mutate();
  };

  const onRegenerateKey = () => {
    const confirmed = confirm(
      "Regenerezi cheia API? Codul curent de pe site va înceta să mai funcționeze imediat.",
    );
    if (confirmed) regenerateKey.mutate();
  };

  return (
    <div className="max-w-3xl space-y-6">
      <section className="card p-6 lg:p-7 space-y-5">
        <div>
          <h2 className="text-h5 font-gilroy text-ink mb-1">Informații generale</h2>
          <p className="text-[13px] text-ink-3">Numele și descrierea botului.</p>
        </div>

        <div>
          <label className="label" htmlFor="bot-name">
            Nume bot
          </label>
          <input
            id="bot-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
            maxLength={80}
          />
        </div>

        <div>
          <label className="label" htmlFor="bot-description">
            Descriere internă
          </label>
          <input
            id="bot-description"
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="ex: Asistent pentru clienții magazinului online"
            maxLength={500}
            className="input"
          />
          <p className="text-[12px] text-soft mt-1.5">
            Vizibil doar pentru echipa ta. Nu apare în chat.
          </p>
        </div>
      </section>

      <section className="card p-6 lg:p-7 space-y-5">
        <div>
          <h2 className="text-h5 font-gilroy text-ink mb-1">
            Instrucțiuni pentru bot
          </h2>
          <p className="text-[13px] text-ink-3">
            Cum răspunde, ce ton folosește, ce reguli respectă.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="system-prompt">
            Prompt sistem
          </label>
          <textarea
            id="system-prompt"
            value={form.systemPrompt}
            onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
            rows={10}
            maxLength={8000}
            className="input !h-auto resize-y py-3 leading-relaxed font-mono text-[13px]"
          />
          <p className="text-[12px] text-soft mt-1.5">
            Botul citește instrucțiunile la fiecare conversație. Fii specific.
          </p>
        </div>
      </section>

      <section className="card p-6 lg:p-7 space-y-5">
        <div>
          <h2 className="text-h5 font-gilroy text-ink mb-1">Status</h2>
          <p className="text-[13px] text-ink-3">
            Botul răspunde sau nu vizitatorilor.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {STATUS_OPTIONS.map((opt) => {
            const selected = form.status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, status: opt.value })}
                className={cn(
                  "text-left rounded-xl border-2 p-4 transition-all",
                  selected
                    ? "border-accent bg-accent-soft"
                    : "border-line-strong hover:border-ink-3",
                )}
              >
                <div className="text-[14px] font-bold text-ink mb-1">
                  {opt.label}
                </div>
                <div className="text-[12.5px] text-ink-3 leading-snug">
                  {opt.description}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-end gap-2 sticky bottom-4">
        <button
          type="button"
          onClick={() =>
            setForm({
              name: agent.name,
              description: agent.description ?? "",
              systemPrompt: agent.systemPrompt ?? "",
              status: agent.status,
            })
          }
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

      <section className="card p-6 lg:p-7 space-y-5">
        <div>
          <h2 className="text-h5 font-gilroy text-ink mb-1">
            Cheie API & instalare
          </h2>
          <p className="text-[13px] text-ink-3">
            Folosită de codul instalat pe site-ul tău.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-3 rounded-xl border border-line p-3">
          <KeyRound className="h-4 w-4 text-ink-3 flex-shrink-0" strokeWidth={2.25} />
          <code className="text-[12.5px] font-mono text-ink truncate flex-1">
            {agent.apiKey}
          </code>
          <button
            type="button"
            onClick={onRegenerateKey}
            disabled={regenerateKey.isPending}
            className="btn-secondary btn-sm flex-shrink-0"
          >
            {regenerateKey.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Regenerează
          </button>
        </div>
      </section>

      <section className="card p-6 lg:p-7 border-danger/30">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-danger" strokeWidth={2.25} />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-ink mb-1">Șterge botul</h3>
            <p className="text-[13px] text-ink-3 mb-4 leading-relaxed">
              Ștergerea e definitivă. Conversațiile, sursele și statisticile dispar
              împreună cu botul. Pe site-ul tău codul nu va mai răspunde.
            </p>
            <button
              type="button"
              onClick={onDelete}
              disabled={remove.isPending}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-danger/10 text-danger text-[14px] font-bold border border-danger/30 hover:bg-danger hover:text-white transition-colors disabled:opacity-50"
            >
              {remove.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Șterge definitiv
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
