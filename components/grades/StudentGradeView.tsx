"use client";

import { SurfaceCard, PrimaryButton } from "@/components/ui";
import { GradeBook, type GradeRow } from "./GradeBook";
import { Download } from "lucide-react";

interface StudentGradeViewProps {
  items: GradeRow[];
  finalGrade: number | null;
  progressPercent: number;
  courseTitle?: string | null;
  onPrintOrPdf?: () => void;
}

/**
 * Vista del libro de calificaciones para el alumno: resumen, barras por módulo, tabla y opción de descargar PDF.
 */
export function StudentGradeView({
  items,
  finalGrade,
  progressPercent,
  courseTitle,
  onPrintOrPdf,
}: StudentGradeViewProps) {
  const byModule = new Map<string, { completed: number; total: number; title?: string }>();
  for (const i of items) {
    const key = i.moduleId ?? "_";
    const title = i.moduleTitle ?? (i.moduleId ?? "General");
    if (!byModule.has(key)) byModule.set(key, { completed: 0, total: 0, title });
    const m = byModule.get(key)!;
    m.total++;
    if (i.status === "completed") m.completed++;
    if (i.moduleTitle) m.title = i.moduleTitle;
  }

  return (
    <div className="space-y-6">
      <SurfaceCard padding="md" className="flex flex-wrap gap-6">
        <div>
          <p className="text-sm text-[var(--ink-muted)]">Nota final (ponderada)</p>
          <p className="text-3xl font-bold text-[var(--primary)]">{finalGrade ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--ink-muted)]">Progreso lecciones</p>
          <p className="text-3xl font-bold text-[var(--ink)]">{Math.round(progressPercent)}%</p>
        </div>
      </SurfaceCard>

      {byModule.size > 0 && (
        <SurfaceCard padding="md" clickable={false}>
          <h3 className="text-sm font-semibold text-[var(--ink)] mb-3">Progreso por módulo</h3>
          <div className="space-y-2">
            {Array.from(byModule.entries()).map(([key, m]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--ink)]">{m.title ?? key}</span>
                  <span className="text-[var(--ink-muted)]">{m.completed} / {m.total}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--line)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] transition-all"
                    style={{ width: m.total ? `${(m.completed / m.total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      )}

      <GradeBook rows={items} showModule />

      {onPrintOrPdf && (
        <PrimaryButton
          type="button"
          onClick={onPrintOrPdf}
          className="inline-flex gap-2"
        >
          <Download className="w-4 h-4" />
          Descargar reporte (PDF)
        </PrimaryButton>
      )}
    </div>
  );
}
