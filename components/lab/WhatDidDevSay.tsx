"use client";

import { SurfaceCard } from "@/components/ui";

interface WhatDidDevSayProps {
  onBack: () => void;
}

export function WhatDidDevSay({ onBack }: WhatDidDevSayProps) {
  return (
    <SurfaceCard padding="lg" clickable={false}>
      <p className="text-[var(--ink-muted)]">¿Qué dijo el informático? — Modo 1 (próximamente).</p>
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
