"use client";

/**
 * Toggle neumórfico para feature flags. Label + descripción + estado on/off.
 */
export interface FeatureToggleProps {
  id: string;
  label: string;
  desc: string;
  value: boolean;
  onChange: (id: string, value: boolean) => void;
  disabled?: boolean;
}

export function FeatureToggle({ id, label, desc, value, onChange, disabled }: FeatureToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 px-4 rounded-2xl bg-[var(--neu-bg)] shadow-[var(--neu-shadow-out-sm)]">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[var(--ink)]">{label}</p>
        <p className="text-sm text-[var(--ink-muted)] mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={value ? `${label} activado` : `${label} desactivado`}
        disabled={disabled}
        onClick={() => onChange(id, !value)}
        className={`
          relative inline-flex h-8 w-14 shrink-0 rounded-full transition-all duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acento)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--neu-bg)]
          disabled:opacity-50
          ${value
            ? "bg-[var(--acento)] shadow-[var(--neu-shadow-in-sm)]"
            : "bg-[var(--neu-bg)] shadow-[var(--neu-shadow-in)]"
          }
        `}
        style={{
          boxShadow: value
            ? "inset 2px 2px 6px rgba(174,183,194,0.5), inset -2px -2px 6px rgba(255,255,255,0.82)"
            : "var(--neu-shadow-in)",
        }}
      >
        <span
          className={`
            pointer-events-none inline-block h-7 w-7 rounded-full mt-0.5 transition-transform duration-200
            ${value ? "translate-x-7 bg-white" : "translate-x-0.5 bg-[var(--neu-bg)]"}
          `}
          style={{
            boxShadow: value ? "var(--neu-shadow-out-sm)" : "var(--neu-shadow-in-sm)",
          }}
        />
      </button>
    </div>
  );
}
