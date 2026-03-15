"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard, PrimaryButton } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { ChevronLeft, Award, Leaf, BookOpen } from "lucide-react";

type Competencia = {
  id: string;
  nombre: string;
  descripcion: string;
  nivel: string;
  area: string;
  fuenteOficial: string;
  indicadores: string[];
};

export default function AdminCompetenciasPage() {
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchCompetencias = () => {
    fetch("/api/admin/competencias", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCompetencias(data.competencias ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompetencias();
  }, []);

  const handleSeed = () => {
    setError(null);
    setSeeding(true);
    fetch("/api/admin/competencias/seed", { method: "POST", credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        fetchCompetencias();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setSeeding(false));
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium mb-6">
          <ChevronLeft className="w-4 h-4" /> Volver
        </Link>
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-2 flex items-center gap-2">
          <Award className="w-7 h-7 text-[var(--primary)]" /> Competencias SPC
        </h1>
        <p className="text-[var(--ink-muted)] mb-6">
          Catálogo del Servicio Profesional de Carrera. Asigna competencias a lecciones al editar cada lección en Cursos.
        </p>

        {error && <Alert message={error} variant="error" className="mb-4" />}

        <SurfaceCard padding="lg" clickable={false} className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--ink)] flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[var(--primary)]" /> Catálogo
              </h2>
              <p className="text-sm text-[var(--ink-muted)]">
                Si la lista está vacía, ejecuta el seed para cargar las 8 competencias oficiales.
              </p>
            </div>
            <PrimaryButton onClick={handleSeed} disabled={seeding}>
              {seeding ? "Ejecutando…" : "Ejecutar seed"}
            </PrimaryButton>
          </div>
        </SurfaceCard>

        {loading ? (
          <p className="text-[var(--ink-muted)]">Cargando…</p>
        ) : competencias.length === 0 ? (
          <SurfaceCard padding="lg" clickable={false}>
            <p className="text-[var(--ink-muted)] text-center py-8">
              No hay competencias. Usa el botón &quot;Ejecutar seed&quot; arriba para cargar el catálogo SPC.
            </p>
          </SurfaceCard>
        ) : (
          <ul className="space-y-3">
            {competencias.map((c) => (
              <li key={c.id}>
                <SurfaceCard padding="lg" clickable={false}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-[var(--ink)]">{c.nombre}</h3>
                      <p className="text-sm text-[var(--ink-muted)] mt-1">{c.descripcion}</p>
                      <p className="text-xs text-[var(--ink-muted)] mt-2">
                        Área: {c.area} · Nivel: {c.nivel}
                      </p>
                    </div>
                  </div>
                </SurfaceCard>
              </li>
            ))}
          </ul>
        )}

        <SurfaceCard padding="lg" clickable={false} className="mt-8">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--primary)]" /> Asignar a lecciones
          </h2>
          <p className="text-sm text-[var(--ink-muted)] mb-4">
            En cada lección puedes vincular una o más competencias SPC (al editar la lección en Cursos).
          </p>
          <PrimaryButton href="/admin/cursos" className="w-fit">
            Ir a Cursos
          </PrimaryButton>
        </SurfaceCard>
      </div>
    </div>
  );
}
