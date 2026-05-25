"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Library,
  MessageSquare,
  Palette,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BotTab {
  label: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

export function BotTabs({ agentId }: { agentId: string }) {
  const pathname = usePathname();
  const base = `/agents/${agentId}`;

  const tabs: BotTab[] = [
    { label: "Prezentare", href: base, icon: LayoutDashboard },
    { label: "Bază de cunoștințe", href: `${base}/knowledge`, icon: Library },
    { label: "Conversații", href: `${base}/conversations`, icon: MessageSquare },
    { label: "Aspect", href: `${base}/appearance`, icon: Palette },
    {
      label: "Analitică",
      href: `${base}/analytics`,
      icon: BarChart3,
      comingSoon: true,
    },
    { label: "Setări", href: `${base}/settings`, icon: Settings },
  ];

  return (
    <div className="border-b border-line -mx-6 px-6 mb-7">
      <nav className="flex items-center gap-1 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.href === base
              ? pathname === base
              : pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative inline-flex items-center gap-1.5 px-3 py-3 text-[13.5px] font-bold transition-colors whitespace-nowrap",
                active
                  ? "text-accent"
                  : "text-ink-3 hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2.25} />
              {tab.label}
              {tab.comingSoon && (
                <span className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-ink-3 bg-surface-3 border border-line-strong px-1 py-0.5 rounded-md">
                  Curând
                </span>
              )}
              {active && (
                <span className="absolute inset-x-2 bottom-[-1px] h-[2px] bg-accent rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
