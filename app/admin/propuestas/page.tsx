"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard, PrimaryButton, SecondaryButton, Badge } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import type { ContenidoGenerado } from "@/lib/types/lessonProposal";
import { ChevronLeft, Check, X, Edit } from "lucide-react";

type Propuesta = {
  id: string;
  titulo: string;
  descripcion: string;
  autorNombre: string;
  autorInstitucion: string;
  moduleIdSugerido: string;
  estado: string;
  feedbackAdmin: string;
  contenidoGenerado: ContenidoGenerado | null;
  createdAt: string;
};

export default function AdminPropuestasPage() {
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"enviada" | "todas">("enviada");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchPropuestas = () => {
    setLoading(true);
    const q = filter === "enviada" ? "?estado=enviada" : "";
    fetch(`/api/admin/propuestas${q}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPropuestas(data.propuestas ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPropuestas();
  }, [filter]);

  const handleApprove = (id: string) => {
    setError(null);
    setApprovingId(id);
    fetch(`/api/admin/propuestas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "aprobar" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPropuestas((prev) => prev.filter((p) => p.id !== id));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al aprobar"))
      .finally(() => setApprovingId(null));
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId) return;
    setError(null);
    setRejectSubmitting(true);
    fetch(`/api/admin/propuestas/${rejectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "rechazar", feedbackAdmin: rejectFeedback.trim() }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPropuestas((prev) => prev.filter((p) => p.id !== rejectId));
        setRejectId(null);
        setRejectFeedback("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al rechazar"))
      .finally(() => setRejectSubmitting(false));
  };

  const estadoBadge = (estado: string) => {
    if (estado === "aprobada") return <Badge variant="completado">Aprobada</Badge>;
    if (estado === "rechazada") return <Badge variant="pendiente">Rechazada</Badge>;
    if (estado === "enviada") return <Badge variant="en-curso">Enviada</Badge>;
    return <Badge variant="pendiente">{estado}</Badge>;
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-[var(--ink)] mb-2">Propuestas de lecciones (UGC)</h1>
        <p className="text-[var(--ink-muted)] mb-6">
          Revisa las propuestas enviadas por la comunidad. Aprobar crea la lección con badge &quot;Comunidad&quot; y otorga al autor el badge &quot;Experto Contribuidor&quot;.
        </p>

        {error && <Alert message={error} variant="error" className="mb-4" />}

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setFilter("enviada")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === "enviada" ? "bg-[var(--primary)] text-white" : "bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]"}`}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => setFilter("todas")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === "todas" ? "bg-[var(--primary)] text-white" : "bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]"}`}
          >
            Todas
          </button>
        </div>

        {loading ? (
          <p className="text-[var(--ink-muted)]">Cargando propuestas…</p>
        ) : propuestas.length === 0 ? (
          <SurfaceCard padding="lg" clickable={false}>
            <p className="text-[var(--ink-muted)] text-center py-8">No hay propuestas con el filtro seleccionado.</p>
          </SurfaceCard>
        ) : (
          <div className="space-y-6">
            {propuestas.map((p) => (
              <SurfaceCard key={p.id} padding="lg" clickable={false}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--ink)]">{p.titulo}</h3>
                    <p className="text-sm text-[var(--ink-muted)] mt-1">
                      {p.autorNombre}
                      {p.autorInstitucion && ` · ${p.autorInstitucion}`}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-1">Módulo sugerido: {p.moduleIdSugerido}</p>
                    <div className="mt-2">{estadoBadge(p.estado)}</div>
                  </div>
                </div>

                {p.descripcion && (
                  <p className="mt-3 text-sm text-[var(--ink)]">{p.descripcion}</p>
                )}

                {p.contenidoGenerado && (
                  <div className="mt-4 p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--line-subtle)] space-y-2">
                    <h4 className="text-sm font-semibold text-[var(--ink)]">Contenido generado</h4>
                    <p className="text-sm"><strong>Objetivo:</strong> {p.contenidoGenerado.objetivo}</p>
                    <p className="text-sm line-clamp-2"><strong>Introducción:</strong> {p.contenidoGenerado.introduccion}</p>
                    <p className="text-xs text-[var(--muted)]">
                      Quiz: {p.contenidoGenerado.quiz?.length ?? 0} preguntas
                    </p>
                  </div>
                )}

                {p.feedbackAdmin && (
                  <p className="mt-3 text-sm text-[var(--muted)]"><strong>Feedback:</strong> {p.feedbackAdmin}</p>
                )}

                {p.estado === "enviada" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <PrimaryButton
                      type="button"
                      onClick={() => handleApprove(p.id)}
                      disabled={approvingId === p.id}
                    >
                      <Check className="w-4 h-4" /> {approvingId === p.id ? "Aprobando…" : "Aprobar"}
                    </PrimaryButton>
                    <SecondaryButton type="button" onClick={() => { setRejectId(p.id); setRejectFeedback(""); }}>
                      <X className="w-4 h-4" /> Rechazar con feedback
                    </SecondaryButton>
                    <SecondaryButton
                      type="button"
                      title="Aprobar creando la lección; el contenido se toma de la propuesta. Para cambiar el texto, edita la propuesta antes de aprobar."
                    >
                      <Edit className="w-4 h-4" /> Editar y aprobar (próximamente)
                    </SecondaryButton>
                  </div>
                )}
              </SurfaceCard>
            ))}
          </div>
        )}

        {rejectId && (
          <SurfaceCard padding="lg" clickable={false} className="mt-6 border-2 border-[var(--coral)]">
            <h4 className="font-semibold text-[var(--ink)] mb-2">Rechazar propuesta</h4>
            <form onSubmit={handleReject}>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Feedback para el autor (opcional)</label>
              <textarea
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] mb-3"
                placeholder="Indica por qué se rechaza o qué podría mejorar..."
              />
              <div className="flex gap-2">
                <PrimaryButton type="submit" disabled={rejectSubmitting} className="bg-[var(--coral)] hover:bg-[var(--coral-hover)]">
                  {rejectSubmitting ? "Enviando…" : "Rechazar"}
                </PrimaryButton>
                <SecondaryButton type="button" onClick={() => { setRejectId(null); setRejectFeedback(""); }}>
                  Cancelar
                </SecondaryButton>
              </div>
            </form>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
