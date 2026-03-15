"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Lightbulb } from "lucide-react";
import { SurfaceCard, PageSection } from "@/components/ui";

type Need = { id: string; text: string; createdAt: string; userId?: string };

export default function AdminNecesidadesPage() {
  const [items, setItems] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/learning-needs", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.needs) ? d.needs : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const byText = items.reduce((acc, i) => {
    const t = i.text.toLowerCase().trim();
    if (!acc[t]) acc[t] = [];
    acc[t].push(i);
    return acc;
  }, {} as Record<string, Need[]>);
  const grouped = Object.entries(byText).map(([text, list]) => ({ text, count: list.length, id: list[0].id })).sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-[var(--neu-bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
        <PageSection title="Necesidades de aprendizaje" subtitle="Respuestas a «¿Qué más quieres aprender?» agrupadas por frecuencia.">
          {loading ? (
            <p className="text-[var(--ink-muted)]">Cargando…</p>
          ) : grouped.length === 0 ? (
            <p className="text-[var(--ink-muted)]">Aún no hay sugerencias.</p>
          ) : (
            <ul className="space-y-2">
              {grouped.map((g) => (
                <li key={g.id}>
                  <SurfaceCard padding="md" clickable={false} className="flex items-center justify-between gap-4">
                    <span className="text-[var(--ink)]">{g.text}</span>
                    <span className="text-sm font-semibold text-[var(--primary)]">{g.count} alumno(s)</span>
                  </SurfaceCard>
                </li>
              ))}
            </ul>
          )}
        </PageSection>
      </div>
    </div>
  );
}
