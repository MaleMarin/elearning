"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { SecondaryButton } from "@/components/ui/Buttons";
import type { PortfolioProject } from "@/lib/types/portfolio";
import { ArrowLeft, Building2, Users } from "lucide-react";

const ESTADO_LABELS: Record<string, string> = {
  idea: "Solo idea",
  en_progreso: "En progreso",
  implementado: "Implementado",
  escalado: "Escalado",
};

export default function PortafolioGaleriaPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [institucion, setInstitucion] = useState("");
  const [modulo, setModulo] = useState("");
  const [estadoProyecto, setEstadoProyecto] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (institucion.trim()) params.set("institucion", institucion.trim());
    if (modulo.trim()) params.set("modulo", modulo.trim());
    if (estadoProyecto) params.set("estadoProyecto", estadoProyecto);
    const q = params.toString();
    fetch(`/api/portafolio/galeria${q ? `?${q}` : ""}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { projects: [] }))
      .then((d) => setProjects(d.projects ?? []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [institucion, modulo, estadoProyecto]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/portafolio" className="inline-flex items-center gap-2 text-sm text-[var(--primary)] mb-4">
          <ArrowLeft className="w-4 h-4" />
          Volver al portafolio
        </Link>
        <p className="section-label mb-1">Galería</p>
        <h1 className="heading-section">Proyectos de egresados</h1>
        <p className="text-[var(--ink-muted)] mt-2">
          Otros como tú ya implementaron. Inspírate con proyectos reales documentados por quienes completaron el programa.
        </p>
      </div>

      <SurfaceCard padding="md" clickable={false} className="mb-8">
        <p className="font-medium text-sm mb-3">Filtrar</p>
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Institución"
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] w-48"
            value={institucion}
            onChange={(e) => setInstitucion(e.target.value)}
          />
          <input
            type="text"
            placeholder="Módulo del programa"
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] w-48"
            value={modulo}
            onChange={(e) => setModulo(e.target.value)}
          />
          <select
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] w-40"
            value={estadoProyecto}
            onChange={(e) => setEstadoProyecto(e.target.value)}
          >
            <option value="">Estado del proyecto</option>
            {Object.entries(ESTADO_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </SurfaceCard>

      {loading ? (
        <p className="text-[var(--ink-muted)]">Cargando galería…</p>
      ) : projects.length === 0 ? (
        <SurfaceCard padding="lg" clickable={false}>
          <p className="text-[var(--ink-muted)]">
            Aún no hay proyectos públicos en la galería. Cuando los egresados marquen su proyecto como público, aparecerán aquí.
          </p>
          <SecondaryButton href="/portafolio" className="mt-4">
            Documentar mi proyecto
          </SecondaryButton>
        </SurfaceCard>
      ) : (
        <ul className="space-y-6">
          {projects.map((p) => (
            <li key={p.id}>
              <SurfaceCard padding="lg" clickable={false}>
                <h2 className="text-lg font-semibold text-[var(--ink)] mb-2">{p.titulo || "Proyecto de transformación"}</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--ink-muted)] mb-3">
                  {p.institucion && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {p.institucion}
                    </span>
                  )}
                  {p.ciudadanosBeneficiados > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {p.ciudadanosBeneficiados} beneficiarios
                    </span>
                  )}
                  <span className="rounded-full bg-[var(--surface-soft)] px-2 py-0.5">
                    {ESTADO_LABELS[p.estadoProyecto] ?? p.estadoProyecto}
                  </span>
                </div>
                <p className="text-sm text-[var(--ink)] mb-2"><strong>Problema:</strong> {p.problema}</p>
                <p className="text-sm text-[var(--ink)] mb-2"><strong>Resultado:</strong> {p.resultado || "—"}</p>
                {p.modulos.length > 0 && (
                  <p className="text-xs text-[var(--ink-muted)]">
                    Módulos: {p.modulos.join(", ")}
                  </p>
                )}
              </SurfaceCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
