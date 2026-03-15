"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Search, X } from "lucide-react";
import { SurfaceCard, SecondaryButton } from "@/components/ui";

type CoAuthor = { id: string; full_name?: string; email?: string | null };

interface CoAuthorManagerProps {
  courseId: string;
  coAuthors: string[];
  coAuthorDetails?: CoAuthor[];
  onUpdate: (coAuthors: string[]) => Promise<void>;
  canManage?: boolean;
}

export function CoAuthorManager({ courseId, coAuthors, coAuthorDetails = [], onUpdate, canManage = true }: CoAuthorManagerProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CoAuthor[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const coAuthorsWithNames: CoAuthor[] = coAuthorDetails.length > 0
    ? coAuthorDetails
    : coAuthors.map((id) => ({ id, full_name: id.slice(0, 8) + "…", email: null }));

  useEffect(() => {
    if (!search || search.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      setSearching(true);
      fetch(`/api/admin/users/search?q=${encodeURIComponent(search)}`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => setResults((d.users ?? []).filter((u: CoAuthor) => !coAuthors.includes(u.id))))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, coAuthors]);

  const handleAdd = async (user: CoAuthor) => {
    if (saving || coAuthors.includes(user.id)) return;
    setSaving(true);
    try {
      await onUpdate([...coAuthors, user.id]);
      setSearch("");
      setResults([]);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (saving || !canManage) return;
    setSaving(true);
    try {
      await onUpdate(coAuthors.filter((x) => x !== id));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SurfaceCard padding="lg" clickable={false} className="bg-[var(--neu-bg)] shadow-[var(--neu-shadow-out-sm)]">
      <h3 className="text-lg font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
        <Users className="w-5 h-5 text-[var(--primary)]" />
        Equipo editorial
      </h3>
      <p className="text-sm text-[var(--ink-muted)] mb-4">
        Los co-autores pueden editar módulos y lecciones. Solo el administrador puede publicar o eliminar el curso.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--neu-bg)] border-none shadow-[var(--neu-shadow-in)] text-[var(--ink)] text-sm"
          />
        </div>
      </div>
      {search.length >= 2 && (
        <ul className="mb-4 space-y-1 rounded-xl bg-[var(--neu-bg)] shadow-[var(--neu-shadow-in-sm)] p-2 max-h-40 overflow-y-auto">
          {searching ? (
            <li className="text-sm text-[var(--ink-muted)]">Buscando…</li>
          ) : results.length === 0 ? (
            <li className="text-sm text-[var(--ink-muted)]">Sin resultados o ya agregado</li>
          ) : (
            results.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg hover:bg-white/50">
                <span className="text-sm text-[var(--ink)]">{u.full_name} {u.email && <span className="text-[var(--ink-muted)]">({u.email})</span>}</span>
                <button type="button" onClick={() => handleAdd(u)} className="text-sm font-medium text-[var(--primary)] hover:underline" disabled={saving}>
                  Agregar
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      <ul className="space-y-2">
        {coAuthorsWithNames.length === 0 ? (
          <li className="text-sm text-[var(--ink-muted)]">Aún no hay co-autores. Busca y agrega usuarios.</li>
        ) : (
          coAuthorsWithNames.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-[var(--neu-bg)] shadow-[var(--neu-shadow-in-sm)]">
              <span className="text-sm text-[var(--ink)]">{u.full_name ?? u.id} {u.email && <span className="text-[var(--ink-muted)] text-xs">({u.email})</span>}</span>
              {canManage && (
                <button type="button" onClick={() => handleRemove(u.id)} className="p-1 rounded text-[var(--ink-muted)] hover:bg-red-100 hover:text-red-600" aria-label="Quitar acceso">
                  <X className="w-4 h-4" />
                </button>
              )}
            </li>
          ))
        )}
      </ul>
    </SurfaceCard>
  );
}
