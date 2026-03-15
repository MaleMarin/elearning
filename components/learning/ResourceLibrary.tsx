"use client";

import { useState, useEffect } from "react";
import { ExternalLink, FileText, Video, Building2, CheckCircle } from "lucide-react";

type ResourceType = "pdf" | "link" | "video" | "link_org";

interface ResourceItem {
  id: string;
  title: string;
  type: ResourceType;
  url: string | null;
  storage_path?: string | null;
  description: string | null;
  viewed: boolean;
}

interface ResourceLibraryProps {
  moduleId: string;
  onMarkViewed?: (resourceId: string) => void;
}

export function ResourceLibrary({ moduleId, onMarkViewed }: ResourceLibraryProps) {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [viewedCount, setViewedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ResourceType | "all">("all");

  useEffect(() => {
    if (!moduleId) return;
    fetch(`/api/curso/modulos/${moduleId}/recursos`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setResources(d.resources ?? []);
        setTotal(d.total ?? 0);
        setViewedCount(d.viewedCount ?? 0);
      })
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [moduleId]);

  const markViewed = async (resourceId: string) => {
    try {
      await fetch(`/api/curso/modulos/${moduleId}/recursos/${resourceId}/view`, {
        method: "POST",
        credentials: "include",
      });
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, viewed: true } : r))
      );
      setViewedCount((c) => c + 1);
      onMarkViewed?.(resourceId);
    } catch {
      // ignore
    }
  };

  const filtered =
    filter === "all"
      ? resources
      : resources.filter((r) => r.type === filter);

  const typeLabel: Record<ResourceType, string> = {
    pdf: "PDF",
    link: "Enlace",
    video: "Video",
    link_org: "Organismo",
  };

  if (loading) {
    return <p className="text-[var(--ink-muted)]">Cargando recursos…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--ink)]">
          {viewedCount} de {total} recursos revisados
        </p>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ResourceType | "all")}
          className="px-3 py-2 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm"
        >
          <option value="all">Todos</option>
          <option value="video">Videos</option>
          <option value="link">Enlaces</option>
          <option value="link_org">Organismos</option>
          <option value="pdf">PDFs</option>
        </select>
      </div>
      <ul className="space-y-3">
        {filtered.map((r) => (
          <li
            key={r.id}
            className="flex items-start gap-3 p-4 rounded-xl border border-[var(--line)] bg-white hover:bg-[var(--cream)]/30 transition-colors"
          >
            <span className="shrink-0 mt-0.5 text-[var(--ink-muted)]">
              {r.type === "video" && <Video className="w-5 h-5" />}
              {r.type === "pdf" && <FileText className="w-5 h-5" />}
              {(r.type === "link" || r.type === "link_org") && <Building2 className="w-5 h-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--ink)]">{r.title}</p>
              {r.description && (
                <p className="text-sm text-[var(--ink-muted)] mt-0.5">{r.description}</p>
              )}
              <span className="text-xs text-[var(--ink-muted)]">{typeLabel[r.type]}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {r.viewed && (
                <span className="flex items-center gap-1 text-sm text-[var(--success)]">
                  <CheckCircle className="w-4 h-4" aria-hidden />
                  Revisado
                </span>
              )}
              {r.url && (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => !r.viewed && markViewed(r.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[var(--line)] bg-white text-[var(--primary)] text-sm hover:bg-[var(--cream)]"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden />
                  Abrir
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="text-[var(--ink-muted)] text-center py-8">
          No hay recursos en esta categoría.
        </p>
      )}
    </div>
  );
}
