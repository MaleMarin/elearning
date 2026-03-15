"use client";

import { useMemo, useState } from "react";
import { SurfaceCard } from "@/components/ui";
import { HABLAS_HUMANO_TERMS } from "@/lib/data/hablas-humano-terms";

export function GlossaryView() {
  const [filter, setFilter] = useState<string>("");
  const categorias = useMemo(() => {
    const set = new Set(HABLAS_HUMANO_TERMS.map((t) => t.categoria));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    if (!filter) return HABLAS_HUMANO_TERMS;
    return HABLAS_HUMANO_TERMS.filter(
      (t) =>
        t.categoria === filter ||
        t.term.toLowerCase().includes(filter.toLowerCase()) ||
        t.definicion.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--ink-muted)]">
        {HABLAS_HUMANO_TERMS.length} términos para practicar en los 5 modos: DEFINIR, USAR, CLASIFICAR, COMPARAR, APLICAR.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Buscar término..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm w-full max-w-xs"
          aria-label="Buscar término"
        />
        {categorias.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter((f) => (f === c ? "" : c))}
            className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
            style={{
              background: filter === c ? "var(--primary)" : "var(--neu-bg)",
              color: filter === c ? "white" : "var(--ink-muted)",
              boxShadow: filter === c ? undefined : "var(--neu-shadow-out-sm)",
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {filtered.map((t) => (
          <li key={t.id}>
            <SurfaceCard padding="md" clickable={false}>
              <h3 className="font-semibold text-[var(--ink)]">{t.term}</h3>
              <p className="text-sm text-[var(--ink-muted)] mt-1">{t.definicion}</p>
              <span
                className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
              >
                {t.categoria}
              </span>
            </SurfaceCard>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="text-sm text-[var(--ink-muted)]">No hay términos que coincidan con la búsqueda.</p>
      )}
    </div>
  );
}
