"use client";

import { SurfaceCard } from "@/components/ui";

interface SecretArchiveProps {
  onBack: () => void;
}

export function SecretArchive({ onBack }: SecretArchiveProps) {
  return (
    <SurfaceCard padding="lg" clickable={false}>
      <p className="text-[var(--ink-muted)]">El Archivo Secreto (próximamente).</p>
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
