"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { ChevronLeft } from "lucide-react";

const CRITERIOS_DEFAULT = ["Viabilidad", "Impacto", "Creatividad", "Factibilidad presupuestal"];

export default function AdminCohortRetoNuevoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [criterios, setCriterios] = useState(CRITERIOS_DEFAULT.join("\n"));
  const [premioDescripcion, setPremioDescripcion] = useState("Badge Estratega de Cohorte + mención en el certificado");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const criteriosEvaluacion = criterios.split("\n").map((s) => s.trim()).filter(Boolean);
      if (criteriosEvaluacion.length === 0) criteriosEvaluacion.push("Viabilidad", "Impacto");
      const res = await fetch(`/api/admin/cohorts/${id}/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fechaInicio: fechaInicio || new Date().toISOString().slice(0, 10),
          fechaFin: fechaFin || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          criteriosEvaluacion,
          premioDescripcion: premioDescripcion.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear");
      router.push(`/admin/cohortes/${id}/retos`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear reto");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href={`/admin/cohortes/${id}/retos`} className="inline-flex items-center gap-2 text-sm text-[var(--ink-muted)] mb-6">
        <ChevronLeft className="w-4 h-4" />
        Volver a retos
      </Link>
      <h1 className="heading-section mb-8">Nuevo reto de cohorte</h1>
      <SurfaceCard padding="lg" clickable={false}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Título</label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[var(--ink)]"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Problema real de política pública"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Descripción del problema</label>
            <textarea
              required
              rows={5}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[var(--ink)] resize-y"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el problema que la cohorte debe resolver en equipo..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Fecha inicio</label>
              <input
                type="date"
                required
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[var(--ink)]"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Fecha fin (recomendado: 2 semanas)</label>
              <input
                type="date"
                required
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[var(--ink)]"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Criterios de evaluación (uno por línea)</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[var(--ink)] resize-y"
              value={criterios}
              onChange={(e) => setCriterios(e.target.value)}
              placeholder="Viabilidad\nImpacto\nCreatividad"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Premio</label>
            <input
              type="text"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[var(--ink)]"
              value={premioDescripcion}
              onChange={(e) => setPremioDescripcion(e.target.value)}
              placeholder="Badge + mención en el certificado"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <SecondaryButton type="button" onClick={() => router.push(`/admin/cohortes/${id}/retos`)}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? "Creando…" : "Crear reto"}
            </PrimaryButton>
          </div>
        </form>
      </SurfaceCard>
    </div>
  );
}
