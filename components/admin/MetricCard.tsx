"use client";

export interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  /** Si trend empieza con + o ↑, se muestra en verde; si con -, en rojo. */
  className?: string;
}

/**
 * Card de métrica para el dashboard admin. Neumórfica (design system).
 */
export function MetricCard({ label, value, trend, className = "" }: MetricCardProps) {
  const trendPositive = trend && (trend.startsWith("+") || trend.startsWith("↑"));
  const trendNegative = trend && trend.startsWith("-");

  return (
    <div
      className={`rounded-[16px] p-4 sm:p-5 ${className}`}
      style={{
        background: "var(--neu-bg)",
        border: "none",
        boxShadow: "var(--neu-shadow-out-sm)",
      }}
    >
      <p className="text-sm font-medium text-[var(--texto-sub)] mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[var(--ink)]">{value}</p>
      {trend && (
        <p
          className={`text-xs font-medium mt-2 ${
            trendPositive ? "text-[var(--acento-dark)]" : trendNegative ? "text-[var(--coral)]" : "text-[var(--texto-sub)]"
          }`}
        >
          {trend}
        </p>
      )}
    </div>
  );
}
