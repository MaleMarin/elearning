"use client";

import { SurfaceCard } from "@/components/ui";
import type { SpacedReview } from "@/lib/services/spacedRepetition";
import { BookOpen } from "lucide-react";

interface SpacedReviewPromptProps {
  reviews: SpacedReview[];
  onStartReview?: (review: SpacedReview) => void;
  onDismiss?: () => void;
}

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Banner proactivo: "Hace X días viste [lección]. Te hago hasta 3 preguntas de repaso."
 * Máximo 3 repasos por sesión.
 */
export function SpacedReviewPrompt({ reviews, onStartReview, onDismiss }: SpacedReviewPromptProps) {
  if (!reviews.length) return null;

  const first = reviews[0];
  const days = first.nextReviewDate ? daysAgo(first.nextReviewDate) : 0;
  const label = days <= 1 ? "Ayer o hoy" : `Hace ${days} días`;
  const title = first.lessonTitle ?? "una lección";

  return (
    <SurfaceCard padding="md" clickable={false} className="border-[var(--primary)]/30 bg-[var(--primary-soft)]/30">
      <div className="flex flex-wrap items-start gap-3">
        <BookOpen className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--ink)]">
            {label} viste <strong>{title}</strong>.
          </p>
          <p className="text-sm text-[var(--ink-muted)] mt-0.5">
            Te sugerimos hasta {Math.min(3, reviews.length)} preguntas rápidas de repaso.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {onStartReview && (
              <button
                type="button"
                onClick={() => onStartReview(first)}
                className="btn-primary text-sm"
              >
                Hacer repaso ahora
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                Más tarde
              </button>
            )}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
