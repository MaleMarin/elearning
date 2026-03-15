"use client";

import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="card-premium p-10 w-full">
        <p className="section-label mb-2">Error 404</p>
        <h1 className="heading-hero text-[var(--ink)] mb-3">
          Página no encontrada
        </h1>
        <p className="text-[var(--ink-muted)] text-[1rem] leading-relaxed mb-8 max-w-sm mx-auto">
          La ruta a la que intentas acceder no existe o fue movida. Puedes volver al inicio y seguir desde ahí.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="/inicio"
            className="btn-primary inline-flex items-center gap-2 no-underline cursor-pointer"
            style={{ pointerEvents: "auto" }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.replace("/inicio");
            }}
          >
            <Home className="w-5 h-5" />
            Ir al inicio
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); if (typeof window !== "undefined") window.history.back(); }}
            className="btn-ghost inline-flex items-center gap-2 cursor-pointer"
            style={{ pointerEvents: "auto" }}
          >
            <ArrowLeft className="w-5 h-5" />
            Volver atrás
          </a>
        </div>
      </div>
    </div>
  );
}
