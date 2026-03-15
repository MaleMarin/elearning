"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "offline_banner_dismissed";

/**
 * Banner informativo la primera vez (Brecha 7).
 * "Descargamos las próximas lecciones para que puedas aprender sin internet.
 *  Perfecto para el metro o zonas con mala señal."
 */
export function PrefetchBanner() {
  const [offlineDismissed, setOfflineDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (dismissed) setOfflineDismissed(true);
    } catch {
      // ignore
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setOfflineDismissed(true);
  };

  if (offlineDismissed) return null;

  return (
    <div
      role="region"
      aria-label="Información sobre modo offline"
      className="rounded-xl p-4 bg-[var(--surface)] border border-[var(--line-subtle)] shadow-[4px_4px_8px_rgba(174,183,194,0.35),-4px_-4px_8px_rgba(255,255,255,0.7)] mb-6"
    >
      <p className="text-sm text-[var(--ink)] mb-3">
        Descargamos las próximas lecciones para que puedas aprender sin internet.
        Perfecto para el metro o zonas con mala señal.
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, "true");
          setOfflineDismissed(true);
        }}
        className="text-xs font-medium text-[var(--primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded"
      >
        Entendido
      </button>
    </div>
  );
}
