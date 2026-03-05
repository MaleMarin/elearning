"use client";

import Link from "next/link";
import { SurfaceCard } from "./SurfaceCard";
import { PrimaryButton } from "./Buttons";

export interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Estado vacío amigable. No usar textos secos tipo "No hay X."
 * Ejemplo: "Todavía no hay sesiones programadas. Cuando el mentor publique la próxima, aparecerá aquí."
 */
export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <SurfaceCard
      padding="lg"
      size="md"
      clickable={false}
      className={`text-center max-w-md mx-auto ${className}`}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div className="mb-4 flex justify-center text-[var(--muted)] text-4xl" aria-hidden>
          {icon}
        </div>
      )}
      <h2 className="text-xl font-semibold text-[var(--ink)] mb-2">{title}</h2>
      <p className="text-base text-[var(--muted)] mb-6 leading-relaxed">{description}</p>
      {ctaLabel && (
        <>
          {ctaHref ? (
            <PrimaryButton href={ctaHref}>{ctaLabel}</PrimaryButton>
          ) : onCtaClick ? (
            <PrimaryButton onClick={onCtaClick}>{ctaLabel}</PrimaryButton>
          ) : null}
        </>
      )}
    </SurfaceCard>
  );
}
