"use client";

import { useState, useEffect } from "react";
import { SurfaceCard, PrimaryButton } from "@/components/ui";
import { pointsForCluesUsed } from "@/lib/services/lab-policy";

interface PolicyCase {
  id: string;
  pistas: string[];
  pais: string;
  anio: string;
  nombre: string;
  resultado: string;
}

interface PolicyGuessProps {
  onBack: () => void;
}

export function PolicyGuess({ onBack }: PolicyGuessProps) {
  const [caseData, setCaseData] = useState<PolicyCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [clueIndex, setClueIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/lab/policy-guess", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.pistas?.length) setCaseData(d);
        else setCaseData(null);
      })
      .catch(() => setCaseData(null))
      .finally(() => setLoading(false));
  }, []);

  const showNextClue = () => {
    if (!caseData || clueIndex >= caseData.pistas.length) return;
    setClueIndex((i) => i + 1);
  };

  const handleReveal = () => {
    if (!caseData) return;
    setRevealed(true);
    const cluesUsed = Math.min(clueIndex + 1, 5);
    setPoints(pointsForCluesUsed(cluesUsed));
  };

  const playAgain = () => {
    setCaseData(null);
    setLoading(true);
    setClueIndex(0);
    setGuess("");
    setRevealed(false);
    setPoints(null);
    fetch("/api/lab/policy-guess", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.pistas?.length) setCaseData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  if (loading && !caseData) {
    return (
      <SurfaceCard padding="lg" clickable={false}>
        <p className="text-[var(--ink-muted)]">Cargando caso…</p>
        <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
          ← Volver
        </button>
      </SurfaceCard>
    );
  }

  if (!caseData) {
    return (
      <SurfaceCard padding="lg" clickable={false}>
        <p className="text-[var(--ink-muted)]">No se pudo cargar un caso. Intenta de nuevo.</p>
        <PrimaryButton onClick={onBack} className="mt-4">
          ← Volver
        </PrimaryButton>
      </SurfaceCard>
    );
  }

  if (revealed) {
    return (
      <SurfaceCard padding="lg" clickable={false}>
        <h2 className="text-lg font-semibold text-[var(--ink)]">Respuesta</h2>
        <p className="text-[var(--ink)] mt-2">
          <strong>{caseData.nombre}</strong> — {caseData.pais} ({caseData.anio})
        </p>
        <p className="text-sm text-[var(--ink-muted)] mt-2">{caseData.resultado}</p>
        {points !== null && (
          <p className="mt-4 text-[var(--primary)] font-medium">
            Puntos por esta ronda: {points} (menos pistas = más puntos: 10 / 7 / 5 / 2 / 1)
          </p>
        )}
        <div className="flex gap-3 mt-6">
          <PrimaryButton onClick={playAgain}>Otro caso</PrimaryButton>
          <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline">
            Volver a la zona
          </button>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard padding="lg" clickable={false}>
      <h2 className="text-lg font-semibold text-[var(--ink)] mb-2">Adivina la política pública</h2>
      <p className="text-sm text-[var(--ink-muted)] mb-4">
        Pistas progresivas. Menos pistas usadas = más puntos (10, 7, 5, 2, 1).
      </p>
      <div className="space-y-3">
        {caseData.pistas.slice(0, clueIndex + 1).map((p, i) => (
          <div key={i} className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)]">
            <span className="text-xs text-[var(--ink-muted)]">Pista {i + 1}</span>
            <p className="text-[var(--ink)] mt-1">{p}</p>
          </div>
        ))}
      </div>
      {clueIndex < caseData.pistas.length - 1 ? (
        <PrimaryButton onClick={showNextClue} className="mt-4">
          Ver siguiente pista
        </PrimaryButton>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-[var(--ink-muted)] mb-2">¿De qué país y año? (opcional escribir antes de revelar)</p>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Ej: Chile, 2020"
            className="input-base w-full min-h-[48px] mb-3"
          />
          <PrimaryButton onClick={handleReveal}>Revelar respuesta</PrimaryButton>
        </div>
      )}
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4 text-sm block">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
