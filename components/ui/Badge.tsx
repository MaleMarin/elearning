"use client";

export type BadgeVariant = "en-curso" | "completado" | "pendiente" | "urgente";

const variantClasses: Record<BadgeVariant, string> = {
  "en-curso": "bg-[var(--primary-soft)] text-[var(--primary)]",
  completado: "bg-[var(--success-soft)] text-[var(--success)]",
  pendiente: "bg-[var(--surface-soft)] text-[var(--muted)]",
  urgente: "bg-[var(--coral-soft)] text-[var(--coral)]",
};

export interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
