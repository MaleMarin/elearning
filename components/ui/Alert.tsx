"use client";

export type AlertVariant = "error" | "warning" | "info";

const variantStyles: Record<AlertVariant, string> = {
  error:
    "bg-[var(--coral-soft)] border-[var(--coral)]/25 text-[var(--ink)]",
  warning:
    "bg-[var(--amber-soft)] border-[var(--amber)]/25 text-[var(--ink)]",
  info:
    "bg-[var(--primary-soft)] border-[var(--primary)]/25 text-[var(--ink)]",
};

export interface AlertProps {
  title?: string;
  message: string;
  variant?: AlertVariant;
  className?: string;
}

/**
 * Alert para errores de login, sesión vencida, etc. Estilo premium, no banner chillón.
 */
export function Alert({ title, message, variant = "error", className = "" }: AlertProps) {
  return (
    <div
      role="alert"
      className={`
        px-4 py-3 rounded-[20px] border text-sm
        shadow-[var(--shadow-card-inset)]
        ${variantStyles[variant]} ${className}
      `}
    >
      {title && <p className="font-semibold mb-1">{title}</p>}
      <p className="text-[var(--ink)]">{message}</p>
    </div>
  );
}
