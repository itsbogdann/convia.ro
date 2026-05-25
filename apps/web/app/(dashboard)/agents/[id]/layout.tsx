"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api/client";
import { useActiveTeam } from "@/lib/stores/active-team";
import { BotProvider } from "./_components/bot-context";
import { BotHeader } from "./_components/bot-header";
import { BotTabs } from "./_components/bot-tabs";

export default function BotLayout({ children }: { children: ReactNode }) {
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

  return (
    <BotProvider teamId={teamId} agent={agent}>
      <div className="space-y-6">
        <BotHeader agent={agent} />
        <BotTabs agentId={agent.id} />
        <div>{children}</div>
      </div>
    </BotProvider>
  );
}
