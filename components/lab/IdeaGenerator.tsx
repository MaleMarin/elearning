"use client";

import { SurfaceCard } from "@/components/ui";

interface IdeaGeneratorProps {
  onBack: () => void;
}

export function IdeaGenerator({ onBack }: IdeaGeneratorProps) {
  return (
    <SurfaceCard padding="lg" clickable={false}>
      <p className="text-[var(--ink-muted)]">Generador de ideas absurdas (próximamente).</p>
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
