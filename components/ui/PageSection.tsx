"use client";

export interface PageSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  /** Id para accesibilidad (aria-labelledby). */
  id?: string;
}

export function PageSection({ title, subtitle, children, className = "", id }: PageSectionProps) {
  return (
    <section className={`space-y-6 ${className}`} aria-labelledby={id ? `${id}-title` : undefined} id={id}>
      <div>
        <h2
          id={id ? `${id}-title` : undefined}
          className="text-xl sm:text-2xl font-semibold text-[var(--ink)] tracking-tight"
        >
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-[var(--muted)] text-base">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
