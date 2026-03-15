"use client";

import { Lock } from "lucide-react";

interface ModuleAccessGateProps {
  canSeeExercises: boolean;
  reason: string;
  children: React.ReactNode;
}

/**
 * Envuelve la sección de ejercicios (lecciones, quiz). Si canSeeExercises es false,
 * muestra candado y mensaje en lugar del contenido.
 */
export function ModuleAccessGate({ canSeeExercises, reason, children }: ModuleAccessGateProps) {
  if (canSeeExercises) return <>{children}</>;

  return (
    <div
      className="rounded-[16px] p-8 bg-[var(--neu-bg)] border-none text-center"
      style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--surface-soft)]" style={{ boxShadow: "var(--neu-shadow-in)" }}>
          <Lock className="w-7 h-7 text-[var(--texto-sub)]" aria-hidden />
        </span>
        <p className="font-medium text-[var(--ink)]">{reason}</p>
        <p className="text-sm text-[var(--texto-sub)]">
          Completa el módulo anterior para acceder a las lecciones y al quiz.
        </p>
      </div>
    </div>
  );
}
