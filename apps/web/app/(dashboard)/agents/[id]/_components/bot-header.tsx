"use client";

import Link from "next/link";
import { AgentStatus, type Agent } from "@convia/shared-types";
import { ArrowLeft, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function BotHeader({ agent }: { agent: Agent }) {
  const primaryColor = agent.appearance?.primaryColor || "#1D4ED8";

  return (
    <div className="space-y-5">
      <Link
        href="/agents"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Înapoi la boții mei
      </Link>

      <div className="flex items-center gap-4">
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-cta flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          <Bot className="h-5 w-5 text-white" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-0.5">
            <h1 className="text-h3 font-gilroy text-ink leading-none truncate">
              {agent.name}
            </h1>
            <StatusBadge status={agent.status} />
          </div>
          <p className="text-[13.5px] text-ink-3 truncate">
            {agent.description ||
              agent.appearance?.welcomeMessage ||
              "Botul tău AI."}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AgentStatus }) {
  const map: Record<AgentStatus, { label: string; className: string }> = {
    [AgentStatus.ACTIVE]: {
      label: "Activ",
      className: "bg-success/10 text-success border-success/20",
    },
    [AgentStatus.DRAFT]: {
      label: "Ciornă",
      className: "bg-warning/10 text-warning border-warning/20",
    },
    [AgentStatus.PAUSED]: {
      label: "Pauză",
      className: "bg-ink-3/10 text-ink-3 border-ink-3/20",
    },
    [AgentStatus.ARCHIVED]: {
      label: "Arhivat",
      className: "bg-ink-3/10 text-ink-3 border-ink-3/20",
    },
  };
  const config = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10.5px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-md border flex-shrink-0",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
