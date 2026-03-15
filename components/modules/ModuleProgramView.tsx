"use client";

import { CheckCircle, Lock, Circle } from "lucide-react";

export interface ModuleProgramItem {
  id: string;
  order: number;
  title: string;
  description: string | null;
  bibCount: number;
  podcastCount: number;
  videoCount: number;
  estimatedDuration?: string;
  status: "locked" | "available" | "completed";
}

interface ModuleProgramViewProps {
  modules: ModuleProgramItem[];
  onModuleClick?: (moduleId: string) => void;
  className?: string;
}

function getStatusBadge(status: ModuleProgramItem["status"]) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 text-sm text-[var(--acento-dark)] font-medium">
          <CheckCircle className="w-4 h-4" aria-hidden />
          Completado
        </span>
      );
    case "locked":
      return (
        <span className="inline-flex items-center gap-1 text-sm text-[var(--texto-sub)]">
          <Lock className="w-4 h-4" aria-hidden />
          Bloqueado
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-sm text-[var(--azul)] font-medium">
          <Circle className="w-4 h-4" aria-hidden />
          Disponible
        </span>
      );
  }
}

export function ModuleProgramView({ modules, onModuleClick, className = "" }: ModuleProgramViewProps) {
  return (
    <section
      className={`space-y-4 ${className}`}
      aria-label="Programa completo del curso"
    >
      <h2 className="text-lg font-semibold text-[var(--azul)]">
        Programa completo
      </h2>
      <p className="text-sm text-[var(--texto-sub)]">
        Índice de todos los módulos y su contenido teórico. Los ejercicios y quizzes se desbloquean según tu progreso.
      </p>
      <div className="space-y-3">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="rounded-[16px] p-4 bg-[var(--neu-bg)] border-none"
            style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-[var(--texto-sub)]">
                  Módulo {mod.order}
                </span>
                <h3 className="font-semibold text-[var(--ink)] mt-0.5">{mod.title}</h3>
                {mod.description && (
                  <p className="text-sm text-[var(--texto-sub)] mt-1 line-clamp-2">{mod.description}</p>
                )}
              </div>
              <div className="flex-shrink-0">{getStatusBadge(mod.status)}</div>
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-[var(--texto-sub)]">
              <span>{mod.bibCount} lecturas</span>
              <span>{mod.podcastCount} podcasts</span>
              <span>{mod.videoCount} videos</span>
              {mod.estimatedDuration && <span>{mod.estimatedDuration}</span>}
            </div>
            {onModuleClick && (
              <button
                type="button"
                onClick={() => onModuleClick(mod.id)}
                className="mt-3 text-sm font-medium text-[var(--azul)] hover:text-[var(--azul-mid)]"
              >
                Ver módulo →
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
