"use client";

export type ToastVariant = "default" | "success" | "error";

const variantStyles: Record<ToastVariant, string> = {
  default: "bg-[var(--surface)] border-[var(--line)] text-[var(--ink)]",
  success: "bg-[var(--success-soft)] border-[var(--success)]/30 text-[var(--ink)]",
  error: "bg-[var(--coral-soft)] border-[var(--coral)]/30 text-[var(--ink)]",
};

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Toast no invasivo. Aparece abajo o arriba según el contenedor.
 */
export function Toast({ message, variant = "default", onDismiss, className = "" }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        flex items-center justify-between gap-4 px-4 py-3 rounded-xl border shadow-[var(--shadow-card)]
        ${variantStyles[variant]} ${className}
      `}
    >
      <span className="text-sm font-medium">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-lg hover:bg-[var(--overlay-light)] text-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          aria-label="Cerrar"
        >
          ×
        </button>
      )}
    </div>
  );
}
