import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

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
    <div
      className={`card-white p-8 text-center max-w-md mx-auto ${className}`}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div className="mb-4 flex justify-center text-[var(--text-muted)] text-4xl" aria-hidden>
          {icon}
        </div>
      )}
      <h2 className="text-xl font-semibold text-[var(--text)] mb-2">{title}</h2>
      <p className="text-base text-[var(--text-muted)] mb-6">{description}</p>
      {ctaLabel && (
        <>
          {ctaHref ? (
            <Link
              href={ctaHref}
              className="btn-primary inline-flex items-center justify-center min-h-[44px] px-6"
            >
              {ctaLabel}
            </Link>
          ) : onCtaClick ? (
            <button
              type="button"
              onClick={onCtaClick}
              className="btn-primary inline-flex items-center justify-center min-h-[44px] px-6"
            >
              {ctaLabel}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
