"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { Nudge } from "@/lib/services/nudges";

interface NudgeBannerProps {
  nudge: Nudge;
  onDismiss?: () => void;
}

/**
 * Banner in-app para un nudge (inactividad, módulo casi completo, racha, quiz, compañero).
 */
export function NudgeBanner({ nudge, onDismiss }: NudgeBannerProps) {
  return (
    <div
      className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary-soft)]/50 p-4 flex items-start gap-3"
      role="region"
      aria-label={nudge.title}
    >
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-[var(--ink)]">{nudge.title}</h3>
        <p className="text-sm text-[var(--ink-muted)] mt-0.5">{nudge.message}</p>
        {nudge.ctaHref && nudge.ctaLabel && (
          <Link
            href={nudge.ctaHref}
            className="inline-block mt-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            {nudge.ctaLabel}
          </Link>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-2 rounded-lg hover:bg-[var(--cream)] text-[var(--ink-muted)] shrink-0"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
