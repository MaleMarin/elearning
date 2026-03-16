"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SurfaceCard, SecondaryButton, PrimaryButton, EmptyState } from "@/components/ui";
import type { CohortChallenge } from "@/lib/types/cohort-challenge";
import { ChevronLeft, Plus, Trophy, Loader2 } from "lucide-react";

const ESTADO_LABELS: Record<string, string> = {
  proximo: "Próximo",
  activo: "Activo",
  evaluando: "Evaluando",
  completado: "Completado",
};

export default function AdminCohortRetosPage() {
  const params = useParams();
  const id = params?.id as string;
  const [challenges, setChallenges] = useState<CohortChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState<string | null>(null);

  const fetchChallenges = useCallback(() => {
    if (!id) return;
    fetch(`/api/admin/cohorts/${id}/challenges`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { challenges: [] }))
      .then((d) => setChallenges(d.challenges ?? []))
      .catch(() => setChallenges([]));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/cohorts/${id}/challenges`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { challenges: [] }))
      .then((d) => setChallenges(d.challenges ?? []))
      .catch(() => setChallenges([]))
      .finally(() => setLoading(false));
  }, [id]);

  const setEstado = async (challengeId: string, estado: string) => {
    setUpdating(challengeId);
    try {
      const res = await fetch(`/api/admin/cohorts/${id}/challenges/${challengeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estado }),
      });
      if (res.ok) fetchChallenges();
    } finally {
      setUpdating(null);
    }
  };

  const runEvaluar = async (challengeId: string) => {
    setEvaluating(challengeId);
    try {
      const res = await fetch("/api/retos/evaluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cohortId: id, challengeId }),
      });
      if (res.ok) fetchChallenges();
    } finally {
      setEvaluating(null);
    }
  };

  const [declarando, setDeclarando] = useState<string | null>(null);
  const handleDeclararGanador = async (retoId: string, teamId: string) => {
    setDeclarando(retoId);
    try {
      const res = await fetch(`/api/admin/cohorts/${id}/challenges/${retoId}/ganador`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ teamId }),
      });
      if (res.ok) fetchChallenges();
    } finally {
      setDeclarando(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/admin/cohortes" className="inline-flex items-center gap-2 text-sm text-[var(--ink-muted)] mb-6">
        <ChevronLeft className="w-4 h-4" />
        Volver a grupos
      </Link>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-section">Retos del grupo</h1>
        <PrimaryButton href={`/admin/cohortes/${id}/retos/nuevo`}>
          <Plus className="w-4 h-4" />
          Nuevo reto
        </PrimaryButton>
      </div>
      {loading ? (
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      ) : challenges.length === 0 ? (
        <EmptyState
          title="Sin retos"
          description="Crea el primer reto colaborativo para este grupo."
          ctaLabel="Crear reto"
          ctaHref={`/admin/cohortes/${id}/retos/nuevo`}
        />
      ) : (
        <ul className="space-y-4">
          {challenges.map((c) => (
            <li key={c.id}>
              <SurfaceCard padding="md" clickable={false}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-[var(--ink)]">{c.titulo}</h2>
                    <p className="text-sm text-[var(--ink-muted)] mt-1 line-clamp-2">{c.descripcion}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-soft)]">
                        {ESTADO_LABELS[c.estado] ?? c.estado}
                      </span>
                      <span className="text-xs text-[var(--ink-muted)]">
                        {c.equipos.length} equipo(s)
                      </span>
                      {c.ganador && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--success)]/20 text-[var(--success)]">
                          Ganador declarado
                        </span>
                      )}
                    </div>
                    {c.equipos.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-[var(--ink-muted)]">Equipos participantes</p>
                        <ul className="space-y-1">
                          {c.equipos.map((eq) => (
                            <li key={eq.id} className="flex items-center justify-between text-sm">
                              <span className="text-[var(--ink)]">{eq.nombre}</span>
                              {eq.propuesta ? (
                                <span className="text-[var(--ink-muted)] text-xs">Entregado</span>
                              ) : (
                                <span className="text-[var(--ink-muted)] text-xs">Sin entregar</span>
                              )}
                              {c.ganador === eq.id ? (
                                <span className="text-xs font-semibold text-[var(--success)]">Ganador</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDeclararGanador(c.id, eq.id)}
                                  disabled={declarando === c.id}
                                  className="text-xs px-2 py-1 rounded bg-[var(--primary)]/15 text-[var(--primary)] hover:bg-[var(--primary)]/25 disabled:opacity-50"
                                >
                                  {declarando === c.id ? "…" : "Declarar ganador"}
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {c.estado === "proximo" && (
                        <SecondaryButton
                          type="button"
                          onClick={() => setEstado(c.id, "activo")}
                          disabled={updating === c.id}
                        >
                          {updating === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activar"}
                        </SecondaryButton>
                      )}
                      {c.estado === "activo" && (
                        <SecondaryButton
                          type="button"
                          onClick={() => setEstado(c.id, "evaluando")}
                          disabled={updating === c.id}
                        >
                          {updating === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cerrar y evaluar"}
                        </SecondaryButton>
                      )}
                      {(c.estado === "evaluando" || c.estado === "activo") && (
                        <PrimaryButton
                          type="button"
                          onClick={() => runEvaluar(c.id)}
                          disabled={evaluating === c.id}
                        >
                          {evaluating === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ejecutar evaluación Claude"}
                        </PrimaryButton>
                      )}
                      {c.estado === "completado" && (
                        <SecondaryButton href={`/reto/${c.id}/resultados`}>Ver resultados</SecondaryButton>
                      )}
                    </div>
                  </div>
                  <SecondaryButton href={`/reto/${c.id}`}>Ver</SecondaryButton>
                </div>
              </SurfaceCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
