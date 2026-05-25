"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Globe,
  Library,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DocumentSourceType,
  DocumentStatus,
  type KnowledgeDocument,
} from "@convia/shared-types";
import { api } from "@/lib/api/client";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useBot } from "../_components/bot-context";

export default function BotKnowledgePage() {
  const { teamId, agent } = useBot();
  const [showAdd, setShowAdd] = useState(false);

  const docsQuery = useQuery({
    queryKey: ["kb-docs", teamId, agent.id],
    queryFn: () => api.knowledgeBase.documents.list(teamId, agent.id),
    refetchInterval: (q) => {
      const docs = q.state.data;
      const stillIndexing = docs?.some(
        (d) =>
          d.status === DocumentStatus.PENDING ||
          d.status === DocumentStatus.PROCESSING,
      );
      return stillIndexing ? 4000 : false;
    },
  });

  const documents = docsQuery.data ?? [];
  const isLoading = docsQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-h4 font-gilroy text-ink">Bază de cunoștințe</h2>
          <p className="text-[13.5px] text-ink-3 mt-1 max-w-xl">
            Site-uri, fișiere și texte din care botul învață. Indexarea durează
            1-3 minute per sursă.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Adaugă sursă
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[280px]">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState onAdd={() => setShowAdd(true)} />
      ) : (
        <DocumentList documents={documents} />
      )}

      {showAdd && (
        <AddSourceModal
          teamId={teamId}
          agentId={agent.id}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-accent-soft border border-accent-ring/40 flex items-center justify-center mb-4">
        <Library className="h-6 w-6 text-accent" strokeWidth={2.25} />
      </div>
      <h3 className="text-h5 font-gilroy text-ink mb-2">
        Nicio sursă adăugată încă
      </h3>
      <p className="text-[14px] text-ink-3 max-w-md mx-auto mb-6 leading-relaxed">
        Adaugă site-ul tău, un PDF sau un text. Botul citește conținutul și
        răspunde precis pe baza lui.
      </p>
      <button type="button" onClick={onAdd} className="btn-primary">
        <Plus className="h-4 w-4" />
        Adaugă prima sursă
      </button>
    </div>
  );
}

function DocumentList({ documents }: { documents: KnowledgeDocument[] }) {
  return (
    <div className="card divide-y divide-line overflow-hidden">
      {documents.map((doc) => (
        <DocumentRow key={doc.id} document={doc} />
      ))}
    </div>
  );
}

function DocumentRow({ document }: { document: KnowledgeDocument }) {
  const { teamId, agent } = useBot();
  const queryClient = useQueryClient();

  const reindex = useMutation({
    mutationFn: () =>
      api.knowledgeBase.documents.reindex(teamId, agent.id, document.id),
    onSuccess: () => {
      toast.success("Re-indexare pornită.");
      queryClient.invalidateQueries({ queryKey: ["kb-docs", teamId, agent.id] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Nu am putut re-indexa.");
    },
  });

  const remove = useMutation({
    mutationFn: () =>
      api.knowledgeBase.documents.remove(teamId, agent.id, document.id),
    onSuccess: () => {
      toast.success("Sursă ștearsă.");
      queryClient.invalidateQueries({ queryKey: ["kb-docs", teamId, agent.id] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Nu am putut șterge.");
    },
  });

  const onDelete = () => {
    if (confirm(`Ștergi "${document.name}"? Acțiunea e definitivă.`)) {
      remove.mutate();
    }
  };

  const Icon = sourceIcon(document.sourceType);

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-surface-2 transition-colors">
      <div className="h-10 w-10 rounded-xl bg-surface-3 border border-line flex items-center justify-center flex-shrink-0">
        <Icon className="h-4.5 w-4.5 text-ink-3" strokeWidth={2.25} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="text-[14px] font-bold text-ink truncate">
            {document.name}
          </div>
          <StatusPill status={document.status} />
        </div>
        <div className="text-[12px] text-ink-3 flex items-center gap-3 flex-wrap">
          <span>{sourceLabel(document.sourceType)}</span>
          <span>·</span>
          <span>{document.chunkCount} fragmente</span>
          <span>·</span>
          <span>Actualizat {formatRelativeTime(document.updatedAt)}</span>
          {document.errorMessage && (
            <>
              <span>·</span>
              <span
                className="text-danger truncate max-w-[260px]"
                title={document.errorMessage}
              >
                {document.errorMessage}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => reindex.mutate()}
          disabled={
            reindex.isPending ||
            document.status === DocumentStatus.PROCESSING ||
            document.status === DocumentStatus.PENDING
          }
          className="btn-ghost btn-sm"
          title="Re-indexează"
        >
          {reindex.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={remove.isPending}
          className="btn-ghost btn-sm hover:text-danger"
          title="Șterge"
        >
          {remove.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: DocumentStatus }) {
  const map: Record<
    DocumentStatus,
    { label: string; className: string; icon?: typeof Loader2 }
  > = {
    [DocumentStatus.PENDING]: {
      label: "În așteptare",
      className: "bg-warning/10 text-warning border-warning/20",
      icon: Loader2,
    },
    [DocumentStatus.PROCESSING]: {
      label: "Indexează",
      className: "bg-accent/10 text-accent border-accent/20",
      icon: Loader2,
    },
    [DocumentStatus.COMPLETED]: {
      label: "Gata",
      className: "bg-success/10 text-success border-success/20",
      icon: CheckCircle2,
    },
    [DocumentStatus.FAILED]: {
      label: "Eroare",
      className: "bg-danger/10 text-danger border-danger/20",
      icon: AlertCircle,
    },
  };
  const config = map[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-md border",
        config.className,
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-3 w-3",
            (status === DocumentStatus.PENDING ||
              status === DocumentStatus.PROCESSING) &&
              "animate-spin",
          )}
          strokeWidth={2.5}
        />
      )}
      {config.label}
    </span>
  );
}

function sourceIcon(type: DocumentSourceType) {
  if (type === DocumentSourceType.URL) return Globe;
  return FileText;
}

function sourceLabel(type: DocumentSourceType): string {
  switch (type) {
    case DocumentSourceType.URL:
      return "Pagină web";
    case DocumentSourceType.PDF:
      return "PDF";
    case DocumentSourceType.DOCX:
      return "Word";
    case DocumentSourceType.XLSX:
      return "Excel";
    case DocumentSourceType.CSV:
      return "CSV";
    case DocumentSourceType.TXT:
      return "Text";
    case DocumentSourceType.MD:
      return "Markdown";
    case DocumentSourceType.RAW_TEXT:
      return "Text introdus";
    default:
      return "Sursă";
  }
}

// ─── Add source modal ─────────────────────────────────────────────────

type AddTab = "url" | "text";

function AddSourceModal({
  teamId,
  agentId,
  onClose,
}: {
  teamId: string;
  agentId: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<AddTab>("url");
  const [url, setUrl] = useState("");
  const [textName, setTextName] = useState("");
  const [textContent, setTextContent] = useState("");
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (input: {
      name: string;
      sourceType: DocumentSourceType;
      sourceUrl?: string;
      content?: string;
    }) => api.knowledgeBase.documents.create(teamId, agentId, input),
    onSuccess: () => {
      toast.success("Sursă adăugată. Indexarea pornește acum.");
      queryClient.invalidateQueries({ queryKey: ["kb-docs", teamId, agentId] });
      onClose();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Nu am putut adăuga.");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "url") {
      const normalized = url.trim();
      if (!normalized) return;
      const finalUrl = normalized.startsWith("http")
        ? normalized
        : `https://${normalized}`;
      create.mutate({
        name: finalUrl,
        sourceType: DocumentSourceType.URL,
        sourceUrl: finalUrl,
      });
    } else {
      if (!textName.trim() || textContent.trim().length < 20) return;
      create.mutate({
        name: textName.trim(),
        sourceType: DocumentSourceType.RAW_TEXT,
        content: textContent,
      });
    }
  };

  const canSubmit =
    tab === "url"
      ? url.trim().length > 3
      : textName.trim().length >= 2 && textContent.trim().length >= 20;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-card-lg border border-line w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-line">
          <div>
            <h3 className="text-h4 font-gilroy text-ink">Adaugă sursă nouă</h3>
            <p className="text-[13px] text-ink-3 mt-1">
              Botul tău va învăța din ea în câteva minute.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-3 hover:text-ink"
            aria-label="Închide"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="inline-flex p-1 bg-surface-3 rounded-xl gap-1 text-[13px] font-bold">
            <TabButton active={tab === "url"} onClick={() => setTab("url")}>
              <Globe className="h-3.5 w-3.5" />
              Site web
            </TabButton>
            <TabButton active={tab === "text"} onClick={() => setTab("text")}>
              <FileText className="h-3.5 w-3.5" />
              Text
            </TabButton>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {tab === "url" ? (
            <div>
              <label className="label" htmlFor="kb-url">
                Adresa paginii web
              </label>
              <input
                id="kb-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://firma-ta.ro/despre-noi"
                className="input"
                autoFocus
              />
              <p className="text-[12px] text-soft mt-1.5">
                Pentru moment doar o pagină per sursă. Adaugă mai multe pagini ca
                surse separate.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="label" htmlFor="kb-text-name">
                  Nume
                </label>
                <input
                  id="kb-text-name"
                  type="text"
                  value={textName}
                  onChange={(e) => setTextName(e.target.value)}
                  placeholder="ex: Politica de retur"
                  className="input"
                  maxLength={200}
                  autoFocus
                />
              </div>
              <div>
                <label className="label" htmlFor="kb-text-content">
                  Conținut
                </label>
                <textarea
                  id="kb-text-content"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Lipește aici textul..."
                  rows={9}
                  className="input !h-auto resize-y py-3 leading-relaxed"
                />
                <p className="text-[12px] text-soft mt-1.5">
                  Minimum 20 caractere · Maxim 500.000.
                </p>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-line -mx-6 px-6 -mb-6 pb-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              disabled={create.isPending}
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={!canSubmit || create.isPending}
              className="btn-primary"
            >
              {create.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Se adaugă...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Adaugă sursă
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 h-8 rounded-lg transition-all",
        active
          ? "bg-white text-ink shadow-card"
          : "text-ink-3 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
