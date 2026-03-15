"use client";

import Link from "next/link";
import { Lock, CheckCircle, ChevronRight, BookOpen } from "lucide-react";
import type { CursoModuleWithLessons } from "@/app/api/curso/route";
import type { ModuleAccessStatus } from "@/lib/services/completion";

interface ModuleCardProps {
  module: CursoModuleWithLessons;
  accessStatus: ModuleAccessStatus;
  courseId: string;
  firstLessonId: string | null;
  /** Razón de bloqueo (ej. "Completa el módulo X para desbloquear") */
  lockReason?: string | null;
}

export function ModuleCard({ module, accessStatus, courseId, firstLessonId, lockReason }: ModuleCardProps) {
  const isLocked = accessStatus === "locked";
  const isCompleted = accessStatus === "completed";
  const firstLesson = module.lessons[0];
  const href = firstLesson && !isLocked ? `/curso/lecciones/${firstLesson.id}` : undefined;

  return (
    <div
      className={`rounded-card border overflow-hidden ${
        isLocked ? "border-[var(--line)] bg-[var(--surface-soft)] opacity-90" : "border-[var(--line-subtle)] bg-[var(--surface)]"
      }`}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-[var(--ink)]">{module.title}</h3>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-sm text-[var(--success)] font-medium">
                <CheckCircle className="w-4 h-4" aria-hidden />
                Completado
              </span>
            )}
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)]">
                <Lock className="w-4 h-4" aria-hidden />
                {lockReason ?? "Completa el módulo anterior para desbloquear"}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {module.lessonCount} lección{module.lessonCount !== 1 ? "es" : ""}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <Link
            href={`/curso/modulos/${module.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[var(--line)] text-[var(--ink)] text-sm font-medium hover:bg-[var(--cream)] transition-colors"
          >
            <BookOpen className="w-4 h-4" aria-hidden />
            Ver módulo
          </Link>
          {href ? (
            <Link
              href={href}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              {isCompleted ? "Ver contenido" : "Comenzar"}
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--line)] text-[var(--text-muted)]">
              <Lock className="w-4 h-4" aria-hidden />
              Bloqueado
            </span>
          )}
        </div>
      </div>
      {module.lessons.length > 0 && (
        <ul className="border-t border-[var(--line)] divide-y divide-[var(--line)]">
          {module.lessons.map((lesson) => {
            const lessonHref = isLocked ? undefined : `/curso/lecciones/${lesson.id}`;
            return (
              <li key={lesson.id}>
                {lessonHref ? (
                  <Link
                    href={lessonHref}
                    className="flex items-center justify-between gap-2 px-4 py-3 text-[var(--text)] hover:bg-[var(--surface-soft)] transition-colors"
                  >
                    <span className="truncate">{lesson.title}</span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0 text-[var(--text-muted)]" aria-hidden />
                  </Link>
                ) : (
                  <span className="flex items-center justify-between gap-2 px-4 py-3 text-[var(--text-muted)]">
                    <span className="truncate">{lesson.title}</span>
                    <Lock className="w-4 h-4 flex-shrink-0" aria-hidden />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
