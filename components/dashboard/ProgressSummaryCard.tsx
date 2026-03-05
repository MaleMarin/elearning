"use client";

import { TrendingUp } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Link from "next/link";

interface ProgressSummaryCardProps {
  lessonsDone: number;
  lessonsTotal: number;
}

export function ProgressSummaryCard({ lessonsDone, lessonsTotal }: ProgressSummaryCardProps) {
  const pct = lessonsTotal > 0 ? Math.round((lessonsDone / lessonsTotal) * 100) : 0;

  return (
    <SurfaceCard padding="md" clickable={false} as="section" aria-labelledby="progress-heading">
      <h2 id="progress-heading" className="text-sm font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
        Progreso
      </h2>
      {lessonsTotal > 0 ? (
        <>
          <p className="text-[var(--ink-muted)] text-sm mb-2">
            {lessonsDone} de {lessonsTotal} lecciones
          </p>
          <ProgressBar value={pct} aria-label="Progreso del curso" className="h-2" />
          <Link
            href="/curso"
            className="mt-3 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
          >
            Ver curso
          </Link>
        </>
      ) : (
        <p className="text-[var(--ink-muted)] text-sm">
          Cuando publiquen el contenido, tu progreso aparecerá aquí.
        </p>
      )}
    </SurfaceCard>
  );
}
