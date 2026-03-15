"use client";

import { SurfaceCard } from "@/components/ui";

export interface GradeRow {
  type: "lesson" | "quiz" | "workshop";
  id: string;
  title: string;
  moduleId: string | null;
  moduleTitle?: string | null;
  status: string;
  score?: number | null;
  maxScore?: number | null;
}

interface GradeBookProps {
  rows: GradeRow[];
  columns?: ("module" | "title" | "type" | "status" | "score")[];
  /** Para vista alumno: solo sus datos. Para admin: puede incluir userId. */
  showModule?: boolean;
}

const typeLabel: Record<string, string> = {
  lesson: "Lección",
  quiz: "Quiz",
  workshop: "Taller",
};

/**
 * Tabla de calificaciones: Módulo | Lección/Quiz/Taller | Estado | Nota.
 */
export function GradeBook({ rows, columns = ["module", "title", "type", "status", "score"], showModule = true }: GradeBookProps) {
  return (
    <SurfaceCard padding="none" clickable={false}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--line)]">
            {showModule && columns.includes("module") && (
              <th className="p-3 font-medium text-[var(--ink)]">Módulo</th>
            )}
            <th className="p-3 font-medium text-[var(--ink)]">
              {columns.includes("title") ? "Lección / Quiz / Taller" : "Título"}
            </th>
            {columns.includes("type") && (
              <th className="p-3 font-medium text-[var(--ink)]">Tipo</th>
            )}
            <th className="p-3 font-medium text-[var(--ink)]">Estado</th>
            <th className="p-3 font-medium text-[var(--ink)]">Nota</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.type}-${r.id}`} className="border-b border-[var(--line)] last:border-0">
              {showModule && columns.includes("module") && (
                <td className="p-3 text-[var(--ink-muted)]">{r.moduleTitle ?? "—"}</td>
              )}
              <td className="p-3 text-[var(--ink)]">{r.title}</td>
              {columns.includes("type") && (
                <td className="p-3 text-[var(--ink-muted)]">{typeLabel[r.type] ?? r.type}</td>
              )}
              <td className="p-3">
                {r.status === "completed" ? "Completado" : r.status === "pending" ? "Pendiente" : "No iniciado"}
              </td>
              <td className="p-3">
                {r.score != null ? `${r.score}${r.maxScore != null ? ` / ${r.maxScore}` : ""}` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SurfaceCard>
  );
}
