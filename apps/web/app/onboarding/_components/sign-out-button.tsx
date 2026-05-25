"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useActiveTeam } from "@/lib/stores/active-team";

export function SignOutButton() {
  const router = useRouter();
  const clearActiveTeam = useActiveTeam((s) => s.clear);

  const onSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearActiveTeam();
    router.replace("/auth/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onSignOut}
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-ink transition-colors"
    >
      <LogOut className="h-3.5 w-3.5" />
      Ieși din cont
    </button>
  );
}
