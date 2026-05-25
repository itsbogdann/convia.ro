import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";

interface MeResponse {
  profile: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  teams: Array<{
    team: { id: string; name: string; plan: string };
    role: string;
  }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9002/api";

async function fetchMe(token: string): Promise<MeResponse | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.data as MeResponse;
  } catch {
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect("/auth/login");
  }

  const me = await fetchMe(session.access_token);

  // No teams yet → straight to onboarding
  if (!me || me.teams.length === 0) {
    redirect("/onboarding");
  }

  const activeTeam = me.teams[0].team;

  return (
    <div className="flex min-h-screen bg-surface-2">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={{
            fullName: me.profile.fullName,
            email: me.profile.email,
            avatarUrl: me.profile.avatarUrl,
          }}
          team={{ name: activeTeam.name, plan: activeTeam.plan }}
        />
        <main className="flex-1 px-6 py-8 max-w-container w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
