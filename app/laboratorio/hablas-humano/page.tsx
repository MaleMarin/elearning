"use client";

import { useState } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { WhatDidDevSay } from "@/components/lab/WhatDidDevSay";
import { TranslateMode } from "@/components/lab/TranslateMode";
import { BingoCard } from "@/components/lab/BingoCard";
import { MythOrReality } from "@/components/lab/MythOrReality";
import { InterpreterMode } from "@/components/lab/InterpreterMode";

type ModoId = "modo1" | "modo2" | "modo3" | "modo4" | "modo5" | null;

export default function HablasHumanoPage() {
  const [modo, setModo] = useState<ModoId>(null);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/laboratorio" className="text-[var(--primary)] hover:underline text-sm mb-6 inline-block">
        ← El Laboratorio
      </Link>
      <div className="flex items-center gap-2 mb-2">
        <Link href="/laboratorio/hablas-humano/glosario" className="text-[var(--primary)] hover:underline text-sm">
          Mi glosario
        </Link>
        <span className="text-[var(--ink-muted)]">·</span>
      </div>
      <h1 className="text-2xl font-bold text-[var(--ink)]">¿Hablas humano?</h1>
      <p className="text-[var(--ink-muted)] mt-1 mb-6">5 modos para traducir el lenguaje tech. 80 términos. Sin calificaciones.</p>

      {modo === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { id: "modo1" as const, icon: "🔤", title: "DEFINIR", desc: "¿Qué significa esta palabra?" },
            { id: "modo2" as const, icon: "📝", title: "USAR", desc: "Usa esta palabra en una oración." },
            { id: "modo3" as const, icon: "🎯", title: "CLASIFICAR", desc: "¿A qué categoría pertenece?" },
            { id: "modo4" as const, icon: "❓", title: "COMPARAR", desc: "¿Cuál es la diferencia entre X e Y?" },
            { id: "modo5" as const, icon: "🤝", title: "APLICAR", desc: "¿En qué situación de gobierno usarías esto?" },
          ].map((m) => (
            <SurfaceCard key={m.id} padding="lg" onClick={() => setModo(m.id)} className="cursor-pointer">
              <span className="text-2xl" aria-hidden>{m.icon}</span>
              <h2 className="text-lg font-semibold text-[var(--ink)] mt-2">{m.title}</h2>
              <p className="text-sm text-[var(--ink-muted)] mt-1">{m.desc}</p>
            </SurfaceCard>
          ))}
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setModo(null)}
            className="text-[var(--primary)] hover:underline text-sm mb-4"
          >
            ← Volver al hub
          </button>
          {modo === "modo1" && <WhatDidDevSay onBack={() => setModo(null)} />}
          {modo === "modo2" && <TranslateMode onBack={() => setModo(null)} />}
          {modo === "modo3" && <BingoCard onBack={() => setModo(null)} />}
          {modo === "modo4" && <MythOrReality onBack={() => setModo(null)} />}
          {modo === "modo5" && <InterpreterMode onBack={() => setModo(null)} />}
        </div>
      )}
    </div>
  );
}
