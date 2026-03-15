"use client";

import type { RubricCriterion } from "@/lib/services/workshop";

interface RubricDisplayProps {
  rubric: RubricCriterion[];
  /** Si es true, muestra como referencia (solo lectura). */
  readOnly?: boolean;
}

/**
 * Muestra los criterios de la rúbrica con puntaje máximo por criterio.
 */
export function RubricDisplay({ rubric, readOnly }: RubricDisplayProps) {
  if (!rubric?.length) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-[var(--ink)]">Criterios de evaluación</h3>
      <ul className="space-y-2">
        {rubric.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-4 py-2 border-b border-[var(--line)] last:border-0">
            <span className="text-[var(--ink)]">{c.label}</span>
            <span className="text-sm text-[var(--ink-muted)]">Máx. {c.maxScore} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
