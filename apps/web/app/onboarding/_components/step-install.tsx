"use client";

import { ExternalLink, Mail } from "lucide-react";
import type { Agent } from "@convia/shared-types";
import {
  InstallCodeBlock,
  buildSnippet,
} from "@/components/agent/install-code-block";

interface StepInstallProps {
  agent: Agent;
}

export function StepInstall({ agent }: StepInstallProps) {
  const snippet = buildSnippet(agent.apiKey);
  const mailtoBody = encodeURIComponent(
    `Salut,\n\nAdaugă codul de mai jos înainte de </body> pe site-ul nostru:\n\n${snippet}\n\nMulțumesc!`,
  );

  return (
    <div className="space-y-5">
      <InstallCodeBlock apiKey={agent.apiKey} />

      <a
        href={`mailto:?subject=${encodeURIComponent(
          "Cod de instalare bot Convia",
        )}&body=${mailtoBody}`}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-accent hover:text-accent-hover"
      >
        <Mail className="h-3.5 w-3.5" strokeWidth={2.5} />
        Trimite developer-ului
      </a>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
        <InstallGuideCard label="WordPress" href="https://convia.ro/docs/wordpress" />
        <InstallGuideCard label="Shopify" href="https://convia.ro/docs/shopify" />
        <InstallGuideCard label="HTML personalizat" href="https://convia.ro/docs/html" />
      </div>
    </div>
  );
}

function InstallGuideCard({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover p-3 flex items-center justify-between gap-2 group"
    >
      <span className="text-[13px] font-bold text-ink">{label}</span>
      <ExternalLink
        className="h-3.5 w-3.5 text-soft group-hover:text-accent transition-colors"
        strokeWidth={2.5}
      />
    </a>
  );
}
