"use client";

import { useState } from "react";
import type { Recomendacion } from "@/lib/services/checkin";

const ENERGY_OPTIONS: { value: 1 | 2 | 3; label: string; emoji: string }[] = [
  { value: 1, label: "Cansado", emoji: "😴" },
  { value: 2, label: "Regular", emoji: "😐" },
  { value: 3, label: "Con energía", emoji: "⚡" },
];

const FOCUS_OPTIONS: { value: 1 | 2 | 3; label: string; emoji: string }[] = [
  { value: 1, label: "Disperso", emoji: "🌪️" },
  { value: 2, label: "Normal", emoji: "🎯" },
  { value: 3, label: "Muy enfocado", emoji: "🔬" },
];

const TIME_OPTIONS: { value: 5 | 15 | 30 | 60; label: string }[] = [
  { value: 5, label: "5 min" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hora+" },
];

interface CognitiveCheckinProps {
  onDone: (recomendacion: Recomendacion) => void;
  demo?: boolean;
}

export function CognitiveCheckin({ onDone, demo }: CognitiveCheckinProps) {
  const [step, setStep] = useState(0);
  const [energia, setEnergia] = useState<1 | 2 | 3 | null>(null);
  const [foco, setFoco] = useState<1 | 2 | 3 | null>(null);
  const [tiempoDisponible, setTiempoDisponible] = useState<5 | 15 | 30 | 60 | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (energia == null || foco == null || tiempoDisponible == null) return;
    setSaving(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          energia,
          foco,
          tiempoDisponible,
        }),
      });
      const data = await res.json();
      if (res.ok && data.recomendacion) {
        onDone(data.recomendacion);
      }
    } finally {
      setSaving(false);
    }
  };

  const baseClass =
    "rounded-xl px-4 py-3 text-center font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] min-h-[48px] ";
  const inactiveClass =
    "bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-card-out-sm)] hover:shadow-[var(--shadow-card-out)] border border-[var(--line-subtle)]";
  const activeClass =
    "bg-[var(--surface)] text-[var(--primary)] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08)] border-2 border-[var(--primary)]";

  return (
    <div
      className="rounded-2xl p-6 border border-[var(--line-subtle)] bg-[var(--surface-soft)] shadow-[inset_2px_2px_6px_rgba(0,0,0,0.04)]"
      role="region"
      aria-label="Check-in cognitivo"
    >
      <h2 className="text-lg font-semibold text-[var(--ink)] mb-1">¿Cómo estás hoy?</h2>
      <p className="text-sm text-[var(--ink-muted)] mb-4">
        Tres preguntas rápidas para adaptar tu experiencia.
      </p>

      {step === 0 && (
        <>
          <p className="text-sm font-medium text-[var(--ink)] mb-2">
            ¿Cómo está tu energía hoy?
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {ENERGY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEnergia(opt.value)}
                className={`${baseClass} ${energia === opt.value ? activeClass : inactiveClass}`}
                aria-pressed={energia === opt.value}
              >
                <span className="mr-1.5" aria-hidden>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => energia != null && setStep(1)}
            disabled={energia == null}
            className="btn-primary disabled:opacity-50"
          >
            Siguiente
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <p className="text-sm font-medium text-[var(--ink)] mb-2">
            ¿Qué tan concentrado te sientes?
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {FOCUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFoco(opt.value)}
                className={`${baseClass} ${foco === opt.value ? activeClass : inactiveClass}`}
                aria-pressed={foco === opt.value}
              >
                <span className="mr-1.5" aria-hidden>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--ink)] bg-[var(--surface)]"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={() => foco != null && setStep(2)}
              disabled={foco == null}
              className="btn-primary disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <p className="text-sm font-medium text-[var(--ink)] mb-2">
            ¿Cuánto tiempo tienes ahora?
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTiempoDisponible(opt.value)}
                className={`${baseClass} ${tiempoDisponible === opt.value ? activeClass : inactiveClass}`}
                aria-pressed={tiempoDisponible === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--ink)] bg-[var(--surface)]"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Listo"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
