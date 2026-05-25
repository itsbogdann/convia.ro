"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Library,
  Loader2,
  MessageSquare,
  Palette,
  Users,
} from "lucide-react";
import { AgentStatus, type Agent } from "@convia/shared-types";
import { api, ApiError } from "@/lib/api/client";
import { useActiveTeam } from "@/lib/stores/active-team";
import { InstallCodeBlock } from "@/components/agent/install-code-block";
import { cn } from "@/lib/utils";

export default function AgentOverviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const agentId = params.id;

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

  const agentQuery = useQuery({
    queryKey: ["agent", teamId, agentId],
    queryFn: () => api.agents.get(teamId!, agentId),
    enabled: Boolean(teamId && agentId),
  });

  if (meQuery.isLoading || agentQuery.isLoading || !teamId) {
    return (
      <div className="flex items-center justify-center h-[480px]">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (agentQuery.isError) {
    const isNotFound =
      agentQuery.error instanceof ApiError && agentQuery.error.status === 404;
    return (
      <div className="card p-10 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-danger" strokeWidth={2.25} />
        </div>
        <h2 className="text-h4 font-gilroy text-ink mb-2">
          {isNotFound ? "Botul nu a fost găsit" : "Eroare la încărcare"}
        </h2>
        <p className="text-[14px] text-ink-3 max-w-md mx-auto mb-6">
          {isNotFound
            ? "Botul ăsta nu există sau nu ai acces la el."
            : "Ceva n-a mers cum trebuie. Încearcă din nou."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/agents")}
          className="btn-primary"
        >
          Înapoi la boții mei
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const agent = agentQuery.data!;

  return <AgentOverview agent={agent} />;
}

function AgentOverview({ agent }: { agent: Agent }) {
  const primaryColor = agent.appearance?.primaryColor || "#1D4ED8";

  return (
    <div className="space-y-7">
      <AgentHeader agent={agent} primaryColor={primaryColor} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={MessageSquare}
          label="Conversații azi"
          value="0"
          hint="Nicio conversație încă"
        />
        <StatCard
          icon={Activity}
          label="Mesaje totale"
          value="0"
          hint="După prima conversație"
        />
        <StatCard
          icon={Users}
          label="Vizitatori unici"
          value="0"
          hint="Săptămâna asta"
        />
      </div>

      <section className="card p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="section-label mb-1.5">
              <Bot className="h-3 w-3" strokeWidth={2.5} />
              Instalare pe site
            </div>
            <h2 className="text-h4 font-gilroy text-ink">
              Adaugă botul pe site-ul tău
            </h2>
            <p className="text-[14px] text-ink-3 mt-1.5 max-w-xl leading-relaxed">
              Copiază codul și pune-l înainte de tag-ul{" "}
              <code className="font-mono text-[13px] bg-surface-3 px-1.5 py-0.5 rounded">
                &lt;/body&gt;
              </code>{" "}
              pe orice pagină unde vrei să apară.
            </p>
          </div>
        </div>
        <InstallCodeBlock apiKey={agent.apiKey} />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-h4 font-gilroy text-ink">Următorii pași</h2>
          <p className="text-[14px] text-ink-3 mt-1">
            Personalizează botul ca să dea răspunsuri și mai bune.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NextStepCard
            icon={Library}
            title="Adaugă conținut"
            description="Site-uri, PDF-uri, documente. Botul învață din ele."
            href="/knowledge-base"
          />
          <NextStepCard
            icon={Palette}
            title="Personalizează aspectul"
            description="Mesaj de bun venit, culoare, poziție pe pagină."
            href={`/agents/${agent.id}/settings`}
          />
          <NextStepCard
            icon={MessageSquare}
            title="Vezi conversațiile"
            description="Toate mesajele clienților, într-un singur loc."
            href="/conversations"
          />
        </div>
      </section>
    </div>
  );
}

function AgentHeader({
  agent,
  primaryColor,
}: {
  agent: Agent;
  primaryColor: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-cta flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          <Bot className="h-6 w-6 text-white" strokeWidth={2.25} />
        </div>
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-h2 font-gilroy text-ink leading-none">
              {agent.name}
            </h1>
            <StatusBadge status={agent.status} />
          </div>
          <p className="text-[14px] text-ink-3">
            {agent.description ||
              "Botul tău e activ și gata să răspundă vizitatorilor."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/agents/${agent.id}/settings`}
          className="btn-secondary btn-sm"
        >
          Setări
        </Link>
        <Link href={`/conversations?agent=${agent.id}`} className="btn-primary btn-sm">
          <MessageSquare className="h-3.5 w-3.5" />
          Conversații
        </Link>
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
        "inline-flex items-center text-[11px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-md border",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Bot;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-ink-3 mb-3">
        <Icon className="h-4 w-4" strokeWidth={2.25} />
        <span className="text-[12px] font-bold uppercase tracking-[0.06em]">
          {label}
        </span>
      </div>
      <div className="text-h2 font-gilroy text-ink leading-none mb-1.5">
        {value}
      </div>
      <div className="text-[12.5px] text-soft">{hint}</div>
    </div>
  );
}

function NextStepCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: typeof Bot;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="card card-hover p-5 group">
      <div className="h-10 w-10 rounded-xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-accent" strokeWidth={2.25} />
      </div>
      <div className="flex items-center gap-1.5 text-[14.5px] font-bold text-ink mb-1.5">
        {title}
        <ArrowRight className="h-3.5 w-3.5 text-soft group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="text-[12.5px] text-ink-3 leading-relaxed">{description}</div>
    </Link>
  );
}
