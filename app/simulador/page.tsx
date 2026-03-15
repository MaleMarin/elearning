"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Simulation } from "@/lib/types/simulador";
import { FileText, Clock, TrendingUp } from "lucide-react";

const DIFICULTAD_LABEL: Record<string, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export default function SimuladorPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/simulador", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setSimulations(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      </div>
    );
  }

  if (!simulations.length) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <EmptyState
          title="Simulador de Política Pública"
          description="No hay simulaciones disponibles. Vuelve más tarde."
          ctaLabel="Ir al Laboratorio"
          ctaHref="/laboratorio"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 min-h-[60vh]" style={{ background: "var(--neu-bg, #f0f2f5)" }}>
      <Link
        href="/laboratorio"
        className="text-[var(--primary)] hover:underline text-sm mb-6 inline-block"
      >
        ← El Laboratorio
      </Link>
      <h1 className="text-2xl font-bold text-[var(--ink)] mb-2">
        Simulador de Política Pública
      </h1>
      <p className="text-[var(--ink-muted)] mb-8">
        Toma decisiones reales de gobierno. Claude evalúa con criterios expertos.
      </p>
      <div className="grid gap-4 sm:grid-cols-1">
        {simulations.map((sim) => (
          <Link key={sim.id} href={`/simulador/${sim.id}`} className="block">
          <SurfaceCard padding="lg" className="h-full flex flex-col transition-all duration-200 hover:-translate-y-0.5" style={{ boxShadow: "var(--neu-shadow-out-sm, 4px 4px 10px rgba(174,183,194,0.6), -4px -4px 10px rgba(255,255,255,0.9))" }}>
              <div className="flex items-start justify-between gap-2">
                <FileText className="w-6 h-6 text-[var(--primary)] shrink-0" aria-hidden />
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--surface-soft)] text-[var(--muted)]">
                  {DIFICULTAD_LABEL[sim.dificultad] ?? sim.dificultad}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">{sim.titulo}</h2>
              <p className="text-sm text-[var(--ink-muted)] mt-1 line-clamp-2">{sim.contexto}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-[var(--muted)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {sim.duracionMinutos} min
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {sim.criterios.length} criterios
                </span>
              </div>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
