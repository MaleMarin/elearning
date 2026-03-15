"use client";

import { useState } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { TriviaGame } from "@/components/lab/TriviaGame";
import { PolicyGuess } from "@/components/lab/PolicyGuess";
import { MythBuster } from "@/components/lab/MythBuster";

type GameId = "trivia" | "adivina" | "mitos" | null;

export default function ZonaJuegosPage() {
  const [game, setGame] = useState<GameId>(null);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/laboratorio" className="text-[var(--primary)] hover:underline text-sm mb-6 inline-block">
        ← El Laboratorio
      </Link>
      <h1 className="text-2xl font-bold text-[var(--ink)]">Zona Juegos</h1>
      <p className="text-[var(--ink-muted)] mt-1 mb-6">Trivia, adivina la política, mitos y verdades. Sin calificaciones.</p>

      {game === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SurfaceCard padding="lg" onClick={() => setGame("trivia")} className="cursor-pointer">
            <span className="text-2xl" aria-hidden>🎯</span>
            <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">¿Quién innova más?</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">Trivia semanal de 5 preguntas sobre innovación pública.</p>
          </SurfaceCard>
          <SurfaceCard padding="lg" onClick={() => setGame("adivina")} className="cursor-pointer">
            <span className="text-2xl" aria-hidden>🌍</span>
            <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">Adivina la política pública</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">Pistas progresivas: ¿de qué país y año?</p>
          </SurfaceCard>
          <SurfaceCard padding="lg" onClick={() => setGame("mitos")} className="cursor-pointer">
            <span className="text-2xl" aria-hidden>✅</span>
            <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">Mitos y verdades</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">10 afirmaciones sobre tecnología e innovación pública.</p>
          </SurfaceCard>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setGame(null)}
            className="text-[var(--primary)] hover:underline text-sm mb-4"
          >
            ← Volver a la zona
          </button>
          {game === "trivia" && <TriviaGame onBack={() => setGame(null)} />}
          {game === "adivina" && <PolicyGuess onBack={() => setGame(null)} />}
          {game === "mitos" && <MythBuster onBack={() => setGame(null)} />}
        </div>
      )}
    </div>
  );
}
