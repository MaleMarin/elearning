"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: "sm" | "md";
}

export function StarRating({
  value,
  onChange,
  max = 5,
  size = "md",
}: StarRatingProps) {
  const iconSize = size === "sm" ? "w-6 h-6" : "w-8 h-8";

  return (
    <div className="flex gap-1" role="group" aria-label="Valoración">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${iconSize}`}
          aria-label={`${n} de ${max}`}
          aria-pressed={value === n}
        >
          <Star
            className={`${iconSize} transition-colors ${
              n <= value ? "fill-[var(--amber)] text-[var(--amber)]" : "text-[var(--line)]"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
