"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SurfaceCard, PrimaryButton } from "@/components/ui";
import type { CohortChallenge, Team } from "@/lib/types/cohort-challenge";
import { ChevronLeft, Trophy, Award } from "lucide-react";

export default function RetoResultadosPage() {
  const params = useParams();
  const id = params?.id as string;
  const [challenge, setChallenge] = useState<CohortChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/retos/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.challenge) setChallenge(d.challenge);
      })
      .catch(() => setChallenge(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!challenge || challenge.estado !== "completado") return;
    if (countdown <= 0) {
      setRevealed(true);
      return;
    }
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [challenge, countdown]);

  if (loading || !challenge) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      </div>
    );
  }

  if (challenge.estado !== "completado") {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <p className="text-[var(--ink-muted)]">Los resultados aún no están disponibles.</p>
        <Link href={`/reto/${id}`} className="text-[var(--primary)] mt-4 inline-block">
          Volver al reto
        </Link>
      </div>
    );
  }

  const teamsWithScores = challenge.equipos
    .filter((t) => t.scoresClaude != null)
    .sort((a, b) => (b.scoresClaude!.score - a.scoresClaude!.score));
  const winner = challenge.ganador ? challenge.equipos.find((t) => t.id === challenge.ganador) : null;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href={`/reto/${id}`} className="inline-flex items-center gap-2 text-sm text-[var(--ink-muted)] mb-6">
        <ChevronLeft className="w-4 h-4" />
        Volver al reto
      </Link>
      <h1 className="heading-section mb-2">Resultados del reto</h1>
      <p className="text-[var(--ink-muted)] mb-8">{challenge.titulo}</p>

      {!revealed ? (
        <SurfaceCard padding="lg" clickable={false} className="text-center py-16">
          <p className="text-6xl font-bold text-[var(--primary)] mb-4">{countdown}</p>
          <p className="text-[var(--ink-muted)]">Revelando resultados…</p>
        </SurfaceCard>
      ) : (
        <>
          {winner && (
            <SurfaceCard padding="lg" clickable={false} className="mb-8 border-2 border-[var(--primary)]">
              <div className="flex items-center gap-3 text-[var(--primary)] mb-2">
                <Trophy className="w-8 h-8" />
                <h2 className="text-xl font-bold">Equipo ganador</h2>
              </div>
              <p className="text-lg font-semibold text-[var(--ink)]">{winner.nombre}</p>
              <p className="text-sm text-[var(--ink-muted)] mt-1">{challenge.premioDescripcion}</p>
            </SurfaceCard>
          )}

          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Ranking de equipos
          </h2>
          <ul className="space-y-4">
            {teamsWithScores.map((team, index) => (
              <li key={team.id}>
                <SurfaceCard padding="lg" clickable={false}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[var(--ink)]">
                        #{index + 1} {team.nombre}
                        {team.id === challenge.ganador && (
                          <span className="ml-2 text-[var(--primary)]">🏆</span>
                        )}
                      </p>
                      <p className="text-2xl font-bold text-[var(--primary)] mt-1">
                        {team.scoresClaude?.score ?? 0}/100
                      </p>
                      {team.scoresClaude?.retroalimentacion && (
                        <p className="text-sm text-[var(--ink-muted)] mt-3 whitespace-pre-wrap">
                          {team.scoresClaude.retroalimentacion}
                        </p>
                      )}
                    </div>
                  </div>
                </SurfaceCard>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-8">
        <PrimaryButton href="/inicio">Volver al inicio</PrimaryButton>
      </div>
    </div>
  );
}
