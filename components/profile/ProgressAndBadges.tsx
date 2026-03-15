"use client";

import { Award, Lock } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { BadgeId } from "@/lib/services/profile";

export interface ProgressData {
  lessonsCompleted: number;
  lessonsTotal: number;
  totalMinutesOnPlatform: number;
  streakDays: number;
  certificatePercent: number | null;
  certificateAvailable: boolean;
  totalPoints: number;
  badges: { id: BadgeId; earned: boolean; earnedAt?: string }[];
}

const BADGE_LABELS: Record<BadgeId, string> = {
  first_lesson: "Primera lección",
  streak_3: "Racha de 3 días",
  module_complete: "Módulo completo",
  halfway: "Mitad del camino",
  certificate: "Certificado obtenido",
  learning_team: "Equipo de aprendizaje",
  experto_contribuidor: "Experto Contribuidor",
  estratega: "Estratega",
};

interface ProgressAndBadgesProps {
  data: ProgressData;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} h ${m} min`;
  if (h > 0) return `${h} h`;
  return `${m} min`;
}

export function ProgressAndBadges({ data }: ProgressAndBadgesProps) {
  const {
    lessonsCompleted,
    lessonsTotal,
    totalMinutesOnPlatform,
    streakDays,
    certificatePercent,
    certificateAvailable,
    totalPoints,
    badges,
  } = data;

  return (
    <div className="card-premium p-6">
      <p className="section-label mb-2">Progreso</p>
      <h2 className="heading-section mb-4">Logros y actividad</h2>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--line-subtle)]">
          <p className="text-sm text-[var(--muted)]">Puntos</p>
          <p className="text-xl font-semibold text-[var(--ink)]">{totalPoints}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--line-subtle)]">
          <p className="text-sm text-[var(--muted)]">Lecciones completadas</p>
          <p className="text-xl font-semibold text-[var(--ink)]">
            {lessonsCompleted} / {lessonsTotal}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--line-subtle)]">
          <p className="text-sm text-[var(--muted)]">Tiempo en plataforma</p>
          <p className="text-xl font-semibold text-[var(--ink)]">
            {formatTime(totalMinutesOnPlatform)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--line-subtle)]">
          <p className="text-sm text-[var(--muted)]">Racha actual</p>
          <p className="text-xl font-semibold text-[var(--ink)]">{streakDays} días</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--line-subtle)]">
          <p className="text-sm text-[var(--muted)]">Certificado</p>
          <p className="text-xl font-semibold text-[var(--ink)]">
            {certificateAvailable
              ? "Disponible para descargar"
              : certificatePercent != null
                ? `${certificatePercent}% completado`
                : "—"}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-sm font-medium text-[var(--ink)]">
            {badges.filter((b) => b.earned).length} de {badges.length} badges obtenidos
          </span>
        </div>
        <ProgressBar
          value={badges.filter((b) => b.earned).length}
          max={badges.length}
          aria-label="Progreso de badges"
        />
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {badges.map((b) => (
          <li
            key={b.id}
            className={`flex items-center gap-3 p-3 rounded-xl border ${
              b.earned ? "bg-[var(--success-soft)] border-[var(--success)]/30" : "bg-[var(--surface-soft)] border-[var(--line-subtle)] opacity-75"
            }`}
          >
            {b.earned ? (
              <Award className="w-8 h-8 text-[var(--success)] shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--line)] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-[var(--muted)]" />
              </div>
            )}
            <div>
              <p className="font-medium text-[var(--ink)]">{BADGE_LABELS[b.id]}</p>
              {b.earned && b.earnedAt && (
                <p className="text-xs text-[var(--muted)]">
                  Obtenido {new Date(b.earnedAt).toLocaleDateString("es")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
