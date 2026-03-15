"use client";

import { SurfaceCard } from "@/components/ui";

interface PhraseWallProps {
  onBack: () => void;
}

export function PhraseWall({ onBack }: PhraseWallProps) {
  return (
    <SurfaceCard padding="lg" clickable={false}>
      <p className="text-[var(--ink-muted)]">Muro de frases (próximamente).</p>
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
