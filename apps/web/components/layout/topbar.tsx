"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface TopbarProps {
  user: {
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
  team: {
    name: string;
    plan: string;
  };
}

const PLAN_LABEL: Record<string, string> = {
  gratuit: "Gratuit",
  business: "Business",
  premium: "Premium",
  enterprise: "Enterprise",
};

export function Topbar({ user, team }: TopbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth/login");
    router.refresh();
  };

  const initials = (user.fullName || user.email)
    .split(/[\s@]+/)
    .map((s) => s[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  return (
    <header className="h-16 flex items-center justify-between gap-4 px-6 bg-white border-b border-line sticky top-0 z-30">
      {/* Workspace selector (read-only for now) */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-accent-soft border border-accent-ring/30 flex items-center justify-center text-[12px] font-bold text-accent flex-shrink-0">
          {team.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-ink truncate leading-tight">
            {team.name}
          </div>
          <div className="text-[11px] text-soft font-semibold uppercase tracking-[0.06em]">
            {PLAN_LABEL[team.plan] || team.plan}
          </div>
        </div>
      </div>

      {/* User menu */}
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-surface-2 transition-colors"
        >
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center text-[11px] font-bold text-white">
              {initials || "?"}
            </div>
          )}
          <span className="hidden sm:block text-[13px] font-bold text-ink-2">
            {user.fullName || user.email.split("@")[0]}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-soft transition-transform",
              open && "rotate-180",
            )}
            strokeWidth={2.5}
          />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 card shadow-card-lg p-1.5 animate-fade-in z-40">
            <div className="px-3 py-2.5 border-b border-line">
              <div className="text-[13px] font-bold text-ink truncate">
                {user.fullName || "—"}
              </div>
              <div className="text-[12px] text-ink-3 truncate">{user.email}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/settings");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] font-semibold text-ink-2 hover:bg-surface-2 transition-colors"
            >
              <Settings className="h-4 w-4 text-ink-3" strokeWidth={2.25} />
              Setări cont
            </button>
            <button
              type="button"
              onClick={signOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] font-semibold text-danger hover:bg-danger/8 transition-colors"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.25} />
              Deconectează-mă
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
