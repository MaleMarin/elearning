"use client";

import { useState, useEffect } from "react";
import type { ResourceType } from "@/lib/services/resources";
import { Plus, Trash2, ExternalLink, FileText, Video, Link as LinkIcon } from "lucide-react";

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "pdf", label: "PDF descargable" },
  { value: "link", label: "Enlace externo" },
  { value: "video", label: "Video YouTube" },
  { value: "link_org", label: "Organismo (OCDE, BID, CEPAL…)" },
];

interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  url: string | null;
  storage_path?: string | null;
  description: string | null;
  order: number;
}

interface ResourceManagerProps {
  moduleId: string;
  onError?: (message: string) => void;
}

export function ResourceManager({ moduleId, onError }: ResourceManagerProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ResourceType>("link");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!moduleId) return;
    fetch(`/api/admin/modules/${moduleId}/resources`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setResources(Array.isArray(d.resources) ? d.resources : []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [moduleId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          type,
          url: url.trim() || null,
          description: description.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al agregar");
      setResources((prev) => [...prev, { ...data, description: description.trim() || null }]);
      setTitle("");
      setUrl("");
      setDescription("");
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Error");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}/resources/${resourceId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Error");
    }
  };

  if (loading) return <p className="text-sm text-[var(--ink-muted)]">Cargando recursos…</p>;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-[var(--ink)]">Recursos del módulo</h4>
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 items-end p-4 rounded-xl border border-[var(--line)] bg-[var(--cream)]/30">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título *"
          required
          className="min-w-[180px] px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] text-sm"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          className="px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] text-sm"
        >
          {RESOURCE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL (o subir PDF después)"
          className="min-w-[200px] px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] text-sm"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          className="min-w-[160px] px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] text-sm"
        />
        <button type="submit" disabled={adding} className="btn-primary text-sm disabled:opacity-50 flex items-center gap-1">
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </form>
      <ul className="space-y-2">
        {resources.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-2 p-3 rounded-xl border border-[var(--line)] bg-white"
          >
            <div className="flex items-center gap-2 min-w-0">
              {r.type === "video" && <Video className="w-4 h-4 shrink-0 text-[var(--ink-muted)]" />}
              {r.type === "pdf" && <FileText className="w-4 h-4 shrink-0 text-[var(--ink-muted)]" />}
              {(r.type === "link" || r.type === "link_org") && <LinkIcon className="w-4 h-4 shrink-0 text-[var(--ink-muted)]" />}
              <div className="min-w-0">
                <p className="font-medium text-[var(--ink)] truncate">{r.title}</p>
                {r.description && <p className="text-xs text-[var(--ink-muted)] truncate">{r.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {r.url && (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-[var(--primary)] hover:bg-[var(--cream)]"
                  aria-label="Abrir enlace"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                type="button"
                onClick={() => handleDelete(r.id)}
                className="p-1.5 rounded-lg text-[var(--error)] hover:bg-red-50"
                aria-label="Eliminar recurso"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {resources.length === 0 && (
        <p className="text-sm text-[var(--ink-muted)]">Aún no hay recursos. Agrega PDFs, enlaces o videos.</p>
      )}
    </div>
  );
}
