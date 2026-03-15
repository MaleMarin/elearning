"use client";

import { useState } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { InnovationMap } from "@/components/lab/InnovationMap";
import { SecretArchive } from "@/components/lab/SecretArchive";
import { PodcastPlayer } from "@/components/lab/PodcastPlayer";

type ActivityId = "mapa" | "archivo" | "podcast" | null;

export default function ZonaExploracionPage() {
  const [activity, setActivity] = useState<ActivityId>(null);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/laboratorio" className="text-[var(--primary)] hover:underline text-sm mb-6 inline-block">
        El Laboratorio
      </Link>
      <h1 className="text-2xl font-bold text-[var(--ink)]">Zona Exploración</h1>
      <p className="text-[var(--ink-muted)] mt-1 mb-6">Mapa de innovaciones, archivo secreto y podcast del mes. Sin calificaciones.</p>

      {activity === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SurfaceCard padding="lg" onClick={() => setActivity("mapa")} className="cursor-pointer">
            <span className="text-2xl" aria-hidden>🗺️</span>
            <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">Mapa mundial de innovaciones</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">Casos de innovación pública por país.</p>
          </SurfaceCard>
          <SurfaceCard padding="lg" onClick={() => setActivity("archivo")} className="cursor-pointer">
            <span className="text-2xl" aria-hidden>📁</span>
            <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">El Archivo Secreto</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">Documentos reales del sector público desclasificados cada semana.</p>
          </SurfaceCard>
          <SurfaceCard padding="lg" onClick={() => setActivity("podcast")} className="cursor-pointer">
            <span className="text-2xl" aria-hidden>🎧</span>
            <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">Podcast del mes</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">Episodio curado sobre innovación pública o gobierno digital.</p>
          </SurfaceCard>
        </div>
      ) : (
        <div>
          <button type="button" onClick={() => setActivity(null)} className="text-[var(--primary)] hover:underline text-sm mb-4">
            Volver a la zona
          </button>
          {activity === "mapa" && <InnovationMap onBack={() => setActivity(null)} />}
          {activity === "archivo" && <SecretArchive onBack={() => setActivity(null)} />}
          {activity === "podcast" && <PodcastPlayer onBack={() => setActivity(null)} />}
        </div>
      )}
    </div>
  );
}
