"use client";

import { SurfaceCard } from "@/components/ui";

interface BingoCardProps {
  onBack: () => void;
}

export function BingoCard({ onBack }: BingoCardProps) {
  return (
    <SurfaceCard padding="lg" clickable={false}>
      <p className="text-[var(--ink-muted)]">Bingo de la reunión — Modo 3 (próximamente).</p>
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
