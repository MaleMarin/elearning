"use client";

import { ChevronRight } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PrimaryButton } from "@/components/ui/Buttons";

export interface DashboardHeroProps {
  /** Saludo: "Bienvenida/o, {nombre}" o "Hola, {nombre}". */
  userName: string;
  /** Si true, usar "Bienvenida/o"; si false, "Hola". */
  useBienvenida?: boolean;
  /** Porcentaje 0–100. No inventar: si no hay progreso real, pasar 0 y progressLabel. */
  progressPct: number;
  /** Cuando no hay progreso (p. ej. 0), mostrar este texto en lugar de "0%". */
  progressLabel?: string;
  nextLessonTitle: string | null;
  nextLessonSummary: string | null;
  nextLessonHref: string | null;
  /** Texto del CTA principal (p. ej. "Continuar"). */
  nextLabel?: string;
  /** Si se proporciona, el CTA es botón que llama esto (p. ej. para analytics + navegación). */
  onContinueClick?: () => void;
}

/**
 * Hero compacto (Nielsen: visibilidad de estado). Saludo + siguiente acción + CTA claro.
 * Solo UI Kit: SurfaceCard, ProgressBar, PrimaryButton.
 */
export function DashboardHero({
  userName,
  useBienvenida = true,
  progressPct,
  progressLabel,
  nextLessonTitle,
  nextLessonSummary,
  nextLessonHref,
  nextLabel = "Continuar",
  onContinueClick,
}: DashboardHeroProps) {
  const hasNextLesson = nextLessonTitle && nextLessonHref;
  const greeting = useBienvenida ? `Bienvenida/o, ${userName}` : `Hola, ${userName}`;
  const progressText =
    progressLabel ?? (progressPct > 0 ? `${Math.min(100, progressPct)}%` : "Listo para comenzar");

  return (
    <SurfaceCard padding="md" size="lg" clickable={false} className="overflow-hidden" aria-labelledby="hero-heading">
      <div className="p-4 sm:p-5">
        <h1 id="hero-heading" className="text-xl font-bold text-[var(--ink)] tracking-tight">
          {greeting}
        </h1>
        <p className="text-[var(--muted)] mt-0.5 text-sm" role="doc-subtitle">
          Tu próxima acción está abajo.
        </p>

        <SurfaceCard variant="soft" padding="md" size="md" clickable={false} className="mt-4">
          <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
            Siguiente acción
          </h2>
          {hasNextLesson ? (
            <>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--muted)]">Progreso</span>
                  <span className="font-semibold text-[var(--ink)]" aria-live="polite">{progressText}</span>
                </div>
                <ProgressBar value={Math.min(100, progressPct)} max={100} aria-label="Progreso del curso" />
              </div>
              <p className="text-[var(--ink)] font-medium text-sm mb-0.5">{nextLessonTitle}</p>
              {nextLessonSummary && (
                <p className="text-[var(--muted)] text-xs mb-3 line-clamp-2">{nextLessonSummary}</p>
              )}
              {onContinueClick ? (
                <PrimaryButton onClick={onContinueClick} className="inline-flex gap-2 min-h-[48px]">
                  {nextLabel}
                  <ChevronRight className="w-4 h-4" aria-hidden />
                </PrimaryButton>
              ) : (
                <PrimaryButton href={nextLessonHref} className="inline-flex gap-2 min-h-[48px]">
                  {nextLabel}
                  <ChevronRight className="w-4 h-4" aria-hidden />
                </PrimaryButton>
              )}
            </>
          ) : (
            <div className="py-1">
              <p className="text-[var(--muted)] text-sm mb-3">
                Aún no hay lecciones publicadas. Cuando estén listas, las verás aquí.
              </p>
              <PrimaryButton href="/curso" className="inline-flex gap-2 min-h-[48px] justify-center w-full sm:w-auto">
                Ver curso
                <ChevronRight className="w-4 h-4" aria-hidden />
              </PrimaryButton>
            </div>
          )}
        </SurfaceCard>
      </div>
    </SurfaceCard>
  );
}
