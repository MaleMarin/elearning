"use client";

interface NPSSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
}

const NPS_LABELS: Record<number, string> = {
  0: "Muy improbable",
  10: "Muy probable",
};

export function NPSSelector({ value, onChange }: NPSSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 justify-between">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${
              value === i
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface-soft)] text-[var(--ink)] hover:bg-[var(--line)]"
            }`}
            aria-label={`${i}`}
            aria-pressed={value === i}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-[var(--muted)]">
        <span>{NPS_LABELS[0]}</span>
        <span>{NPS_LABELS[10]}</span>
      </div>
      {value !== null && (
        <p className="text-sm text-[var(--muted)]">
          {value <= 6 ? "Detractor" : value <= 8 ? "Pasivo" : "Promotor"}
        </p>
      )}
    </div>
  );
}
