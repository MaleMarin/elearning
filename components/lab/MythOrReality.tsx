"use client";

import { SurfaceCard } from "@/components/ui";

interface MythOrRealityProps {
  onBack: () => void;
}

export function MythOrReality({ onBack }: MythOrRealityProps) {
  return (
    <SurfaceCard padding="lg" clickable={false}>
      <p className="text-[var(--ink-muted)]">¿Mito o realidad tech? — Modo 4 (próximamente).</p>
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
