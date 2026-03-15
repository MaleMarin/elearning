"use client";

import { SurfaceCard } from "@/components/ui";

interface InterpreterModeProps {
  onBack: () => void;
}

export function InterpreterMode({ onBack }: InterpreterModeProps) {
  return (
    <SurfaceCard padding="lg" clickable={false}>
      <p className="text-[var(--ink-muted)]">El Intérprete — Modo 5 (próximamente).</p>
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
