"use client";

import { useState } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { Burocratron } from "@/components/lab/Burocratron";
import { PhraseWall } from "@/components/lab/PhraseWall";

type ActivityId = "burocratron" | "frases" | null;

export default function ZonaHumorPage() {
  const [activity, setActivity] = useState<ActivityId>(null);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/laboratorio" className="text-[var(--primary)] hover:underline text-sm mb-6 inline-block">
        El Laboratorio
      </Link>
      <h1 className="text-2xl font-bold text-[var(--ink)]">Zona Humor</h1>
      <p className="text-[var(--ink-muted)] mt-1 mb-6">Burocrátron 3000 y muro de frases. Sin calificaciones.</p>

      {activity === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SurfaceCard padding="lg" onClick={() => setActivity("burocratron")} className="cursor-pointer">
            <span className="text-2xl" aria-hidden>🤖</span>
            <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">El Burocrátron 3000</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">Roleplay con un funcionario kafkiano. Encuentra la salida creativa.</p>
          </SurfaceCard>
          <SurfaceCard padding="lg" onClick={() => setActivity("frases")} className="cursor-pointer">
            <span className="text-2xl" aria-hidden>💬</span>
            <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">Muro de frases</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">Comparte la frase que más te impactó del programa.</p>
          </SurfaceCard>
        </div>
      ) : (
        <div>
          <button type="button" onClick={() => setActivity(null)} className="text-[var(--primary)] hover:underline text-sm mb-4">
            Volver a la zona
          </button>
          {activity === "burocratron" && <Burocratron onBack={() => setActivity(null)} />}
          {activity === "frases" && <PhraseWall onBack={() => setActivity(null)} />}
        </div>
      )}
    </div>
  );
}
