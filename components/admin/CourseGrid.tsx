"use client";

import Link from "next/link";
import { BookOpen, Copy, Pencil, UsersRound } from "lucide-react";
import { Badge, SecondaryButton } from "@/components/ui";

const COURSE_STATES: Record<string, { label: string; color: string }> = {
  draft: { label: "Borrador", color: "#9ca3af" },
  published: { label: "Publicado", color: "#00e5a0" },
  archived: { label: "Archivado", color: "#f59e0b" },
};

export type CourseGridItem = {
  id: string;
  title: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  /** Opcional: cantidad de alumnos inscritos (cuando el API lo provea). */
  alumnosCount?: number | null;
  /** Opcional: progreso promedio 0–100 (cuando el API lo provea). */
  progressAvg?: number | null;
  /** Opcional: cohortes activas con este curso (cuando el API lo provea). */
  cohortesCount?: number | null;
};

type CourseGridProps = {
  courses: CourseGridItem[];
  togglingId?: string | null;
  onTogglePublish: (course: CourseGridItem) => void;
  onDuplicate: (course: CourseGridItem) => void;
  duplicateLoadingId?: string | null;
};

export function CourseGrid({
  courses,
  togglingId,
  onTogglePublish,
  onDuplicate,
  duplicateLoadingId,
}: CourseGridProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-left text-sm" role="grid" aria-label="Cursos">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--bg-soft)]">
            <th className="px-4 py-3 font-semibold text-[var(--ink)]">Nombre</th>
            <th className="px-4 py-3 font-semibold text-[var(--ink)]">Estado</th>
            <th className="px-4 py-3 font-semibold text-[var(--ink)]">Alumnos</th>
            <th className="px-4 py-3 font-semibold text-[var(--ink)]">Progreso prom.</th>
            <th className="px-4 py-3 font-semibold text-[var(--ink)]">Grupos</th>
            <th className="px-4 py-3 font-semibold text-[var(--ink)] text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => {
            const state = COURSE_STATES[c.status] ?? COURSE_STATES.draft;
            return (
              <tr key={c.id} className="border-b border-[var(--line-subtle)] last:border-b-0 hover:bg-[var(--bg-soft)]/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[var(--primary)] flex-shrink-0" aria-hidden />
                    <span className="font-medium text-[var(--ink)]">{c.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={c.status === "published" ? "completado" : c.status === "archived" ? "urgente" : "pendiente"}
                  >
                    {state.label}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[var(--ink-muted)]">
                  {typeof c.alumnosCount === "number" ? c.alumnosCount : "—"}
                </td>
                <td className="px-4 py-3 text-[var(--ink-muted)]">
                  {typeof c.progressAvg === "number" ? `${c.progressAvg}%` : "—"}
                </td>
                <td className="px-4 py-3 text-[var(--ink-muted)]">
                  {typeof c.cohortesCount === "number" ? c.cohortesCount : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <SecondaryButton href={`/admin/cursos/${c.id}`} className="text-sm inline-flex items-center gap-1">
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </SecondaryButton>
                    <SecondaryButton href={`/admin/cohortes?course=${c.id}`} className="text-sm inline-flex items-center gap-1">
                      <UsersRound className="w-3.5 h-3.5" />
                      Grupos
                    </SecondaryButton>
                    <SecondaryButton
                      onClick={() => onDuplicate(c)}
                      disabled={!!duplicateLoadingId || !!togglingId}
                      className="text-sm inline-flex items-center gap-1"
                      title="Duplicar curso (copia en borrador)"
                    >
                      {duplicateLoadingId === c.id ? (
                        "Duplicando…"
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Duplicar
                        </>
                      )}
                    </SecondaryButton>
                    <SecondaryButton
                      onClick={() => onTogglePublish(c)}
                      disabled={togglingId === c.id}
                      className="text-sm"
                    >
                      {c.status === "published" ? "Despublicar" : "Publicar"}
                    </SecondaryButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
