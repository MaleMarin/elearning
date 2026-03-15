"use client";

import { useState, useEffect } from "react";
import { SurfaceCard, PrimaryButton } from "@/components/ui";

interface MythItem {
  id: string;
  afirmacion: string;
  tipo: "mito" | "verdad";
  explicacion: string;
}

interface MythBusterProps {
  onBack: () => void;
}

export function MythBuster({ onBack }: MythBusterProps) {
  const [myths, setMyths] = useState<MythItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<"mito" | "verdad" | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch("/api/lab/myths", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.myths?.length) setMyths(d.myths);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const current = myths[index] ?? null;
  const isCorrect = current && answer !== null && answer === current.tipo;

  const handleAnswer = (choice: "mito" | "verdad") => {
    if (answer !== null) return;
    setAnswer(choice);
    if (current && choice === current.tipo) setScore((s) => s + 1);
  };

  const next = () => {
    setAnswer(null);
    setIndex((i) => i + 1);
  };

  if (loading && myths.length === 0) {
    return (
      <SurfaceCard padding="lg" clickable={false}>
        <p className="text-[var(--ink-muted)]">Cargando mitos y verdades…</p>
        <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
          ← Volver
        </button>
      </SurfaceCard>
    );
  }

  if (myths.length === 0) {
    return (
      <SurfaceCard padding="lg" clickable={false}>
        <p className="text-[var(--ink-muted)]">No hay afirmaciones disponibles.</p>
        <PrimaryButton onClick={onBack} className="mt-4">
          ← Volver
        </PrimaryButton>
      </SurfaceCard>
    );
  }

  if (index >= myths.length) {
    return (
      <SurfaceCard padding="lg" clickable={false}>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Resultado</h2>
        <p className="text-[var(--ink-muted)] mt-1">
          Acertaste {score} de {myths.length}. Sin calificaciones — solo para reflexionar.
        </p>
        <PrimaryButton onClick={onBack} className="mt-6">
          ← Volver a la zona
        </PrimaryButton>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard padding="lg" clickable={false}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-[var(--ink-muted)]">
          {index + 1} de {myths.length}
        </span>
        <span className="text-sm font-medium text-[var(--ink)]">{score} aciertos</span>
      </div>
      <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">¿Mito o verdad?</h2>
      <p className="text-[var(--ink)] mb-6">"{current?.afirmacion}"</p>
      {answer === null ? (
        <div className="flex gap-3">
          <PrimaryButton
            onClick={() => handleAnswer("mito")}
            className="flex-1"
          >
            Mito
          </PrimaryButton>
          <PrimaryButton
            onClick={() => handleAnswer("verdad")}
            className="flex-1"
          >
            Verdad
          </PrimaryButton>
        </div>
      ) : (
        <div>
          <div
            className={`p-4 rounded-xl border-2 ${
              isCorrect ? "border-green-500 bg-green-50" : "border-amber-500 bg-amber-50"
            }`}
          >
            <p className="text-sm font-medium">
              {isCorrect ? "✓ Correcto" : "No"} — Es {current?.tipo === "mito" ? "un mito" : "verdad"}.
            </p>
            <p className="text-sm text-[var(--ink)] mt-2">{current?.explicacion}</p>
          </div>
          <PrimaryButton onClick={next} className="mt-4 w-full">
            Siguiente
          </PrimaryButton>
        </div>
      )}
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4 text-sm">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
