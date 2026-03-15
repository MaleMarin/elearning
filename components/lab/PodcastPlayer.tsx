"use client";

import { SurfaceCard } from "@/components/ui";

interface PodcastPlayerProps {
  onBack: () => void;
}

export function PodcastPlayer({ onBack }: PodcastPlayerProps) {
  return (
    <SurfaceCard padding="lg" clickable={false}>
      <p className="text-[var(--ink-muted)]">Podcast del mes (próximamente).</p>
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
