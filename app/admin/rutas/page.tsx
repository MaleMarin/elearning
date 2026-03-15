"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Route, Plus } from "lucide-react";
import { SurfaceCard, PageSection, PrimaryButton, SecondaryButton, EmptyState } from "@/components/ui";
import type { LearningPath } from "@/lib/services/learning-paths";

export default function AdminRutasPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/learning-paths?active=false", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPaths(Array.isArray(d.paths) ? d.paths : []))
      .catch(() => setPaths([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--neu-bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
        <PageSection title="Rutas de aprendizaje" subtitle="Asignación automática por cargo e institución al registrarse.">
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          {loading ? (
            <p className="text-[var(--ink-muted)]">Cargando…</p>
          ) : paths.length === 0 ? (
            <EmptyState
              title="Aún no hay rutas"
              description="Crea rutas para asignar automáticamente cursos según el cargo o institución del alumno."
              ctaLabel="Crear ruta (próximamente)"
              onCtaClick={() => {}}
            />
          ) : (
            <ul className="space-y-3">
              {paths.map((p) => (
                <li key={p.id}>
                  <SurfaceCard padding="lg" clickable={false} className="bg-[var(--neu-bg)] shadow-[var(--neu-shadow-out-sm)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[var(--ink)] flex items-center gap-2">
                          <Route className="w-5 h-5 text-[var(--primary)]" />
                          {p.nombre}
                        </h3>
                        <p className="text-sm text-[var(--ink-muted)] mt-1">{p.descripcion || "Sin descripción"}</p>
                        <p className="text-xs text-[var(--ink-muted)] mt-1">
                          Cargos: {p.cargosTarget.length ? p.cargosTarget.join(", ") : "todos"} · Instituciones: {p.institucionesTarget.length ? p.institucionesTarget.join(", ") : "todas"} · {p.cursos.length} curso(s)
                        </p>
                      </div>
                      <SecondaryButton href={`/admin/rutas/${p.id}`} className="shrink-0">Editar</SecondaryButton>
                    </div>
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
