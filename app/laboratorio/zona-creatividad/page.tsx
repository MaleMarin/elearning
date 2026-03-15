"use client";

import { useState } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { IdeaGenerator } from "@/components/lab/IdeaGenerator";
import { RedesignChallenge } from "@/components/lab/RedesignChallenge";

type ActivityId = "ideas" | "rediseno" | null;

export default function ZonaCreatividadPage() {
  const [activity, setActivity] = useState<ActivityId>(null);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/laboratorio" className="text-[var(--primary)] hover:underline text-sm mb-6 inline-block">
        El Laboratorio
      </Link>
      <h1 className="text-2xl font-bold text-[var(--ink)]">Zona Creatividad</h1>
      <p className="text-[var(--ink-muted)] mt-1 mb-6">Generador de ideas absurdas y rediseño de trámites. Sin calificaciones.</p>

      {activity === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SurfaceCard padding="lg" onClick={() => setActivity("ideas")} className="cursor-pointer">
            <span className="text-2xl" aria-hidden>💡</span>
            <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">Generador de Ideas Absurdas</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">Problema, restricción y recurso inesperado. 3 minutos para una solución.</p>
          </SurfaceCard>
          <SurfaceCard padding="lg" onClick={() => setActivity("rediseno")} className="cursor-pointer">
            <span className="text-2xl" aria-hidden>🔄</span>
            <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">Rediseña esto</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">Propón cómo rediseñar un trámite burocrático real.</p>
          </SurfaceCard>
        </div>
      ) : (
        <div>
          <button type="button" onClick={() => setActivity(null)} className="text-[var(--primary)] hover:underline text-sm mb-4">
            Volver a la zona
          </button>
          {activity === "ideas" && <IdeaGenerator onBack={() => setActivity(null)} />}
          {activity === "rediseno" && <RedesignChallenge onBack={() => setActivity(null)} />}
        </div>
      )}
    </div>
  );
}
