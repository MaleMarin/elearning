"use client";

import Link from "next/link";
import { Award, CheckSquare } from "lucide-react";
import { PrimaryButton } from "@/components/ui";

export interface ModuleLandingProps {
  module: {
    title: string;
    description: string | null;
    objectives?: string[];
    rewardLabel?: string | null;
  };
  lessons: { id: string; title: string; order_index: number }[];
  firstLessonId?: string | null;
  canSeeExercises: boolean;
}

/**
 * Landing page por módulo: resumen, objetivos, actividades y recompensa.
 * Heurística Nielsen 1: visibilidad del estado del sistema; ADDIE: presentación clara del módulo.
 */
export function ModuleLanding({
  module: mod,
  lessons,
  firstLessonId,
  canSeeExercises,
}: ModuleLandingProps) {
  return (
    <div className="space-y-8">
        {mod.description && (
          <section aria-labelledby="landing-resumen">
            <h2 id="landing-resumen" className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-2">
              Resumen
            </h2>
            <div
              className="rounded-2xl p-5 bg-[var(--neu-bg)] text-[var(--ink)]"
              style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
            >
              <p className="text-[var(--ink)] leading-relaxed whitespace-pre-line">{mod.description}</p>
            </div>
          </section>
        )}

        {(mod.objectives?.length ?? 0) > 0 && (
          <section aria-labelledby="landing-objetivos">
            <h2 id="landing-objetivos" className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-2">
              Objetivos
            </h2>
            <ul className="rounded-2xl p-5 bg-[var(--neu-bg)] space-y-2 list-none pl-0" style={{ boxShadow: "var(--neu-shadow-out-sm)" }}>
              {mod.objectives!.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-[var(--ink)]">
                  <span className="text-[var(--acento)] mt-0.5" aria-hidden>✓</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {lessons.length > 0 && (
          <section aria-labelledby="landing-actividades">
            <h2 id="landing-actividades" className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-2 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" aria-hidden />
              Actividades
            </h2>
            <ul className="rounded-2xl p-5 bg-[var(--neu-bg)] space-y-2 list-none pl-0" style={{ boxShadow: "var(--neu-shadow-out-sm)" }}>
              {lessons.map((l, i) => (
                <li key={l.id} className="text-[var(--ink)]">
                  <span className="font-medium text-[var(--ink-muted)]">{i + 1}.</span> {l.title}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="landing-recompensa">
          <h2 id="landing-recompensa" className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-2 flex items-center gap-2">
            <Award className="w-4 h-4" aria-hidden />
            Recompensa
          </h2>
          <div
            className="rounded-2xl p-5 bg-[var(--neu-bg)] border-none"
            style={{ boxShadow: "var(--neu-glow-acento)" }}
          >
            <p className="text-[var(--ink)]">
              {mod.rewardLabel?.trim()
                ? mod.rewardLabel
                : "Al completar este módulo obtendrás la insignia correspondiente y podrás avanzar al siguiente."}
            </p>
          </div>
        </section>

        {canSeeExercises && firstLessonId && (
          <div className="pt-2">
            <PrimaryButton href={`/curso/lecciones/${firstLessonId}`} className="inline-flex items-center gap-2 min-h-[48px]">
              Comenzar primera lección
            </PrimaryButton>
          </div>
        )}
      </div>
  );
}
