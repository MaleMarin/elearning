"use client";

import { SurfaceCard } from "@/components/ui";

interface RedesignChallengeProps {
  onBack: () => void;
}

export function RedesignChallenge({ onBack }: RedesignChallengeProps) {
  return (
    <SurfaceCard padding="lg" clickable={false}>
      <p className="text-[var(--ink-muted)]">Rediseña este trámite (próximamente).</p>
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
