"use client";

import { Globe, Info } from "lucide-react";

interface StepKnowledgeProps {
  websiteUrl: string;
  onChange: (url: string) => void;
}

export function StepKnowledge({ websiteUrl, onChange }: StepKnowledgeProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="label" htmlFor="website-url">
          Adresa site-ului
        </label>
        <div className="relative">
          <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3 pointer-events-none" />
          <input
            id="website-url"
            type="url"
            value={websiteUrl}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://firma-ta.ro"
            className="input pl-10"
            autoFocus
          />
        </div>
        <p className="text-[12px] text-soft mt-1.5">
          Citim conținutul automat în 2-3 minute. Botul îl folosește pentru
          răspunsuri precise.
        </p>
      </div>

      <div className="bg-accent-soft border border-accent-ring/40 rounded-xl p-4 flex gap-3">
        <Info
          className="h-4 w-4 text-accent flex-shrink-0 mt-0.5"
          strokeWidth={2.25}
        />
        <div className="text-[12.5px] text-ink-2 leading-relaxed">
          <span className="font-bold">Pasul ăsta e opțional.</span> Poți adăuga
          oricând site-uri, PDF-uri sau documente Word direct din dashboard.
        </div>
      </div>
    </div>
  );
}

export function validateUrl(url: string): boolean {
  if (!url.trim()) return false;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return Boolean(u.hostname && u.hostname.includes("."));
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}
