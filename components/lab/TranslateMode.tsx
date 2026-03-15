"use client";

import { SurfaceCard } from "@/components/ui";

interface TranslateModeProps {
  onBack: () => void;
}

export function TranslateMode({ onBack }: TranslateModeProps) {
  return (
    <SurfaceCard padding="lg" clickable={false}>
      <p className="text-[var(--ink-muted)]">Traduce esto — Modo 2 (próximamente).</p>
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
