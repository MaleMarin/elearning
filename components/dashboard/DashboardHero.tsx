"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PrimaryButton } from "@/components/ui/Buttons";

export interface DashboardHeroProps {
  userName: string;
  progressPct: number;
  nextLessonTitle: string | null;
  nextLessonSummary: string | null;
  nextLessonHref: string | null;
}

/**
 * Hero compacto: "Continuar donde quedaste" con progreso real o empty state.
 */
export function DashboardHero({
  userName,
  progressPct,
  nextLessonTitle,
  nextLessonSummary,
  nextLessonHref,
}: DashboardHeroProps) {
  const hasNextLesson = nextLessonTitle && nextLessonHref;

  return (
    <SurfaceCard padding="md" size="lg" clickable={false} className="overflow-hidden" aria-labelledby="hero-heading">
      <div className="p-5 sm:p-6">
        <h1 id="hero-heading" className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
          Hola, {userName}
        </h1>
        <p className="text-[var(--muted)] mt-1 text-sm max-w-lg">
          Retoma tu curso y revisa lo que sigue. Tu próxima acción está debajo.
        </p>

        <div className="mt-5 rounded-xl bg-[var(--bg)] border border-[var(--line)] p-4 sm:p-5 shadow-[var(--shadow-card-inset)]">
          <h2 className="text-base font-semibold text-[var(--ink)] mb-3">Continuar donde quedaste</h2>
          {hasNextLesson ? (
            <>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--muted)]">Progreso del curso</span>
                  <span className="font-semibold text-[var(--ink)]">{Math.min(100, progressPct)}%</span>
                </div>
                <ProgressBar value={Math.min(100, progressPct)} aria-label="Progreso del curso" />
              </div>
              <p className="text-[var(--ink)] font-medium text-sm mb-0.5">Siguiente: {nextLessonTitle}</p>
              {nextLessonSummary && (
                <p className="text-[var(--muted)] text-xs mb-3">{nextLessonSummary}</p>
              )}
              <PrimaryButton href={nextLessonHref} className="inline-flex gap-2 text-base min-h-[48px]">
                Seguir con el curso
                <ChevronRight className="w-4 h-4" />
              </PrimaryButton>
            </>
          ) : (
            <div className="py-2">
              <p className="text-[var(--ink-muted)] text-sm mb-4">
                Tu contenido aparecerá aquí cuando el equipo publique el curso.
              </p>
              <PrimaryButton href="/curso" className="inline-flex gap-2 min-h-[44px] w-full sm:w-auto justify-center">
                Ir a curso
                <ChevronRight className="w-4 h-4" />
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}
