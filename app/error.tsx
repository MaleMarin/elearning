"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="card-premium p-10 w-full">
        <p className="section-label mb-2">Error</p>
        <h1 className="heading-hero text-[var(--ink)] mb-3">
          Algo salió mal
        </h1>
        <p className="text-[var(--ink-muted)] text-[1rem] leading-relaxed mb-8 max-w-sm mx-auto">
          Hemos registrado el error. Puedes intentar de nuevo o volver al inicio.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
            Reintentar
          </button>
          <a
            href="/inicio"
            className="btn-ghost inline-flex items-center gap-2 no-underline cursor-pointer"
          >
            <Home className="w-5 h-5" />
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
