"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  Library,
  MessageSquare,
  Palette,
  Users,
} from "lucide-react";
import { InstallCodeBlock } from "@/components/agent/install-code-block";
import { useBot } from "./_components/bot-context";

export default function AgentOverviewPage() {
  const { agent } = useBot();

  return (
    <div className="space-y-7">
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
        <div className="mb-5">
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
            href={`/agents/${agent.id}/knowledge`}
          />
          <NextStepCard
            icon={Palette}
            title="Personalizează aspectul"
            description="Mesaj de bun venit, culoare, poziție pe pagină."
            href={`/agents/${agent.id}/appearance`}
          />
          <NextStepCard
            icon={MessageSquare}
            title="Vezi conversațiile"
            description="Toate mesajele clienților, într-un singur loc."
            href={`/agents/${agent.id}/conversations`}
          />
        </div>
      </section>
    </div>
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
