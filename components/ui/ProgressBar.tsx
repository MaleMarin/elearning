"use client";

export interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  /** Etiqueta opcional para accesibilidad. */
  "aria-label"?: string;
}

export function ProgressBar({ value, max = 100, className = "", "aria-label": ariaLabel }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));
  return (
    <div
      className={`h-3 rounded-full overflow-hidden bg-[var(--line)] ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
    >
      <div
        className="h-full rounded-full transition-[width] duration-400 ease-out"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, var(--azul) 0%, var(--acento) 100%)",
          boxShadow: "0 0 8px rgba(0, 229, 160, 0.4)",
        }}
      />
    </div>
  );
}
