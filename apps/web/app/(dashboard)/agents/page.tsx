"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bot,
  Loader2,
  MessageSquare,
  Plus,
} from "lucide-react";
import { AgentStatus, type Agent } from "@convia/shared-types";
import { api } from "@/lib/api/client";
import { useActiveTeam } from "@/lib/stores/active-team";
import { cn, formatRelativeTime } from "@/lib/utils";

export default function AgentsPage() {
  const activeTeamId = useActiveTeam((s) => s.activeTeamId);
  const setActiveTeam = useActiveTeam((s) => s.setActiveTeam);

  const meQuery = useQuery({
    queryKey: ["auth.me"],
    queryFn: () => api.auth.me(),
  });

  const teamId = useMemo(() => {
    if (activeTeamId) return activeTeamId;
    return meQuery.data?.teams[0]?.team.id ?? null;
  }, [activeTeamId, meQuery.data]);

  useEffect(() => {
    if (!activeTeamId && teamId) setActiveTeam(teamId);
  }, [activeTeamId, teamId, setActiveTeam]);

  const agentsQuery = useQuery({
    queryKey: ["agents", teamId],
    queryFn: () => api.agents.list(teamId!),
    enabled: Boolean(teamId),
  });

  const isLoading = meQuery.isLoading || agentsQuery.isLoading || !teamId;
  const agents = agentsQuery.data ?? [];

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-gilroy text-ink">Boții mei</h1>
          <p className="mt-1.5 text-[14.5px] text-ink-3">
            Toți chatboții pe care i-ai creat. Creează unul nou sau gestionează-i pe
            cei existenți.
          </p>
        </div>
        {agents.length > 0 && (
          <Link href="/onboarding" className="btn-primary">
            <Plus className="h-4 w-4" />
            Bot nou
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[320px]">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : agents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
        <Bot className="h-6 w-6 text-accent" strokeWidth={2.25} />
      </div>
      <h2 className="text-h4 font-gilroy text-ink mb-2">Niciun bot încă</h2>
      <p className="text-[14px] text-ink-3 max-w-md mx-auto mb-6">
        Construiește primul tău chatbot AI în 5 minute. Setup ghidat în 5 pași simpli.
      </p>
      <Link href="/onboarding" className="btn-primary">
        Creează primul bot
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const primaryColor = agent.appearance?.primaryColor || "#1D4ED8";

  return (
    <Link
      href={`/agents/${agent.id}`}
      className="card card-hover p-5 flex flex-col gap-4 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-cta"
            style={{ backgroundColor: primaryColor }}
          >
            <Bot className="h-5 w-5 text-white" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-ink leading-tight truncate">
              {agent.name}
            </div>
            <div className="text-[12.5px] text-ink-3 mt-0.5">
              Actualizat {formatRelativeTime(agent.updatedAt)}
            </div>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      <p className="text-[13px] text-ink-3 leading-relaxed line-clamp-2 min-h-[2.5rem]">
        {agent.description ||
          (agent.appearance?.welcomeMessage ??
            "Botul tău AI, pregătit pentru conversații.")}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-line text-[12.5px] text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.25} />
          0 conversații
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-accent group-hover:translate-x-0.5 transition-transform">
          Deschide
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
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
