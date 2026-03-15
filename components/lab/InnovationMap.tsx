"use client";

import { SurfaceCard } from "@/components/ui";

interface InnovationMapProps {
  onBack: () => void;
}

export function InnovationMap({ onBack }: InnovationMapProps) {
  return (
    <SurfaceCard padding="lg" clickable={false}>
      <p className="text-[var(--ink-muted)]">Mapa mundial de innovaciones (próximamente).</p>
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
