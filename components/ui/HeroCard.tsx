"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SurfaceCard } from "./SurfaceCard";
import { ProgressBar } from "./ProgressBar";
import { PrimaryButton } from "./Buttons";

export interface HeroCardProps {
  /** Saludo (ej. "Bienvenida/o, María"). */
  greeting: string;
  /** Texto corto debajo del saludo. */
  subtitle: string;
  /** Porcentaje 0–100. */
  progressPct: number;
  /** Título de la siguiente lección. */
  nextLessonTitle: string;
  /** Descripción en 1 línea. */
  nextLessonSummary: string;
  /** URL del CTA principal. */
  ctaHref: string;
  /** Texto del CTA (ej. "Seguir con el curso"). */
  ctaLabel: string;
}

/**
 * Bloque principal del dashboard. Dominante pero compacto. CTA pill grande.
 */
export function HeroCard({
  greeting,
  subtitle,
  progressPct,
  nextLessonTitle,
  nextLessonSummary,
  ctaHref,
  ctaLabel,
}: HeroCardProps) {
  return (
    <SurfaceCard padding="md" size="lg" clickable={false} className="overflow-hidden" aria-labelledby="hero-heading">
      <div className="p-5 sm:p-6">
        <h1 id="hero-heading" className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
          {greeting}
        </h1>
        <p className="text-[var(--muted)] mt-1 text-sm max-w-lg">{subtitle}</p>

        <div className="mt-5 rounded-xl bg-[var(--bg)] border border-[var(--line)] p-4 sm:p-5 shadow-[var(--shadow-card-inset)]">
          <h2 className="text-base font-semibold text-[var(--ink)] mb-3">Continuar donde quedaste</h2>
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[var(--muted)]">Progreso del curso</span>
              <span className="font-semibold text-[var(--ink)]">{progressPct}%</span>
            </div>
            <ProgressBar value={progressPct} aria-label="Progreso del curso" />
          </div>
          <p className="text-[var(--ink)] font-medium text-sm mb-0.5">Siguiente: {nextLessonTitle}</p>
          <p className="text-[var(--muted)] text-xs mb-3">{nextLessonSummary}</p>
          <PrimaryButton href={ctaHref} className="inline-flex gap-2 text-base min-h-[48px]">
            {ctaLabel}
            <ChevronRight className="w-4 h-4" />
          </PrimaryButton>
        </div>
      </div>
    </SurfaceCard>
  );
}
