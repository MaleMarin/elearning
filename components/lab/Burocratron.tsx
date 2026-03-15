"use client";

import { SurfaceCard } from "@/components/ui";

interface BurocratronProps {
  onBack: () => void;
}

export function Burocratron({ onBack }: BurocratronProps) {
  return (
    <SurfaceCard padding="lg" clickable={false}>
      <p className="text-[var(--ink-muted)]">El Burocrátron 3000 (próximamente).</p>
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
