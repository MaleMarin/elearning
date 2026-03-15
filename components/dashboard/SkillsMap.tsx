"use client";

import type { ModuleSkill, SkillState } from "@/lib/services/adaptivePath";

interface SkillsMapProps {
  skills: ModuleSkill[];
  /** Opcional: al hacer clic en un módulo. */
  onModuleClick?: (moduleId: string) => void;
}

const stateStyles: Record<SkillState, { bg: string; label: string }> = {
  developed: { bg: "bg-[var(--success)]", label: "Desarrollada" },
  in_progress: { bg: "bg-amber-400", label: "En progreso" },
  pending: { bg: "bg-[var(--line)]", label: "Pendiente" },
};

/**
 * Mapa visual de competencias por módulo: barras o indicadores verde / amarillo / gris.
 */
export function SkillsMap({ skills, onModuleClick }: SkillsMapProps) {
  if (skills.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[var(--ink)]">Competencias por módulo</h3>
      <div className="flex flex-wrap gap-2" role="list" aria-label="Estado por módulo">
        {skills.map((s) => {
          const style = stateStyles[s.state];
          return (
            <button
              key={s.moduleId}
              type="button"
              onClick={() => onModuleClick?.(s.moduleId)}
              className={`
                inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--line)] bg-white
                hover:bg-[var(--cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
                ${onModuleClick ? "cursor-pointer" : "cursor-default"}
              `}
              aria-label={`${s.title}: ${style.label}`}
            >
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${style.bg}`}
                aria-hidden
              />
              <span className="text-sm text-[var(--ink)] truncate max-w-[140px]">{s.title}</span>
              <span className="text-xs text-[var(--ink-muted)]">
                {s.completedLessons}/{s.totalLessons}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-[var(--ink-muted)]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--success)]" /> Desarrollada
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> En progreso
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--line)]" /> Pendiente
        </span>
      </div>
    </div>
  );
}
