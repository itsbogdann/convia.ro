"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

const WIDGET_URL =
  process.env.NEXT_PUBLIC_WIDGET_URL || "https://widget.convia.ro/embed.js";

export function buildSnippet(apiKey: string): string {
  return `<script
  src="${WIDGET_URL}"
  data-convia-key="${apiKey}"
  async
></script>`;
}

interface InstallCodeBlockProps {
  apiKey: string;
}

export function InstallCodeBlock({ apiKey }: InstallCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const snippet = buildSnippet(apiKey);

  const onCopy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="rounded-xl border border-line-strong overflow-hidden">
      <div className="flex items-center justify-between bg-surface-3 px-4 py-2.5 border-b border-line-strong">
        <span className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-3">
          Cod de instalare
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-accent hover:text-accent-hover transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
              Copiat!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" strokeWidth={2.5} />
              Copiază
            </>
          )}
        </button>
      </div>
      <pre className="bg-white px-4 py-3.5 text-[12.5px] font-mono text-ink overflow-x-auto leading-relaxed">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
