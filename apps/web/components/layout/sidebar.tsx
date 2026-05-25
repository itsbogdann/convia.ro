"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Inbox, LayoutDashboard, Settings, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const NAV: NavItem[] = [
  { label: "Acasă", href: "/dashboard", icon: LayoutDashboard },
  { label: "Boții mei", href: "/agents", icon: Bot },
  { label: "Inbox", href: "/conversations", icon: Inbox },
  { label: "Setări", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-60 flex-col h-screen sticky top-0 bg-white border-r border-line">
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-line">
        <Link href="/dashboard" className="flex items-center" aria-label="Convia">
          <BrandMark size={30} />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-semibold transition-colors",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-ink-3 hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-accent" : "text-ink-3",
                )}
                strokeWidth={2.25}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade pill */}
      <div className="p-3 border-t border-line">
        <Link
          href="/settings/billing"
          className="block p-3 rounded-xl bg-gradient-to-br from-accent-soft to-white border border-accent-ring/40 transition-shadow hover:shadow-card"
        >
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-accent mb-1">
            <Sparkles className="h-3 w-3" strokeWidth={2.5} />
            Upgrade
          </div>
          <div className="text-[12.5px] font-bold text-ink leading-tight">
            Treci pe Business pentru 1.000 conversații/lună
          </div>
        </Link>
      </div>
    </aside>
  );
}
