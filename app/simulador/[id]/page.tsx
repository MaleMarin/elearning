"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import {
  SIMULATION_QUESTIONS,
  MIN_WORDS_PER_ANSWER,
} from "@/lib/types/simulador";
import { VoiceInput } from "@/components/ui/VoiceInput";
import type { Simulation } from "@/lib/types/simulador";
import type { SimulationEvaluation } from "@/lib/types/simulador";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type Step = "briefing" | "decisions" | "evaluating" | "results";

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export default function SimuladorIdPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("briefing");
  const [briefingSecondsLeft, setBriefingSecondsLeft] = useState(120);
  const [answers, setAnswers] = useState<string[]>(() =>
    SIMULATION_QUESTIONS.map(() => "")
  );
  const [evaluation, setEvaluation] = useState<SimulationEvaluation | null>(null);
  const [cohortAverage, setCohortAverage] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/simulador/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setSimulation(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (step !== "briefing" || briefingSecondsLeft <= 0) return;
    const t = setInterval(() => {
      setBriefingSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step, briefingSecondsLeft]);

  const canSubmit = answers.every((a) => countWords(a) >= MIN_WORDS_PER_ANSWER);

  const handleSubmit = useCallback(async () => {
    if (!simulation || !canSubmit) return;
    setStep("evaluating");
    setSubmitError(null);
    try {
      const res = await fetch("/api/simulador/evaluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          simulationId: simulation.id,
          answers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al evaluar");
      setEvaluation(data.evaluation);
      setCohortAverage(data.cohortAverage ?? null);
      setStep("results");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Error al evaluar");
      setStep("decisions");
    }
  }, [simulation, answers, canSubmit]);

  if (loading || !simulation) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      </div>
    );
  }

  const minLeft = Math.floor(briefingSecondsLeft / 60);
  const secLeft = briefingSecondsLeft % 60;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 min-h-[60vh]" style={{ background: "var(--neu-bg, #f0f2f5)" }}>
      <Link
        href="/simulador"
        className="text-[var(--primary)] hover:underline text-sm mb-6 inline-block"
      >
        ← Simulador
      </Link>

      {step === "briefing" && (
        <div
          className="rounded-2xl p-8 text-[var(--ink)] border-2 border-[var(--line)]"
          style={{
            background: "linear-gradient(180deg, #1a1d24 0%, #252930 100%)",
            boxShadow: "inset 0 0 0 1px rgba(0,229,160,0.15)",
          }}
        >
          <div className="flex justify-center mb-6">
            <span
              className="text-sm font-bold tracking-widest px-4 py-2 rounded-lg"
              style={{ background: "rgba(0,229,160,0.2)", color: "#00e5a0" }}
            >
              CONFIDENCIAL
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mb-4">{simulation.titulo}</h1>
          <p className="text-[var(--ink-muted)] whitespace-pre-line mb-4">
            {simulation.contexto}
          </p>
          <ul className="space-y-2 text-sm text-[var(--ink-muted)] mb-6">
            <li><strong className="text-[var(--ink)]">Presupuesto:</strong> {simulation.presupuesto}</li>
            <li><strong className="text-[var(--ink)]">Tiempo:</strong> {simulation.tiempo}</li>
            <li><strong className="text-[var(--ink)]">Equipo:</strong> {simulation.equipo}</li>
          </ul>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--muted)]">
              Lee el escenario. Tienes 2 minutos.
            </p>
            <div className="text-2xl font-mono tabular-nums text-[var(--acento)]">
              {minLeft}:{secLeft.toString().padStart(2, "0")}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStep("decisions")}
            className="mt-6 w-full py-3 rounded-xl font-semibold text-white bg-[var(--primary)] hover:opacity-90 transition-opacity"
          >
            Continuar a las decisiones
          </button>
        </div>
      )}

      {step === "decisions" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[var(--ink)]">{simulation.titulo}</h1>
          <p className="text-[var(--ink-muted)]">
            Responde cada pregunta con al menos {MIN_WORDS_PER_ANSWER} palabras.
          </p>
          {SIMULATION_QUESTIONS.map((q, i) => (
            <SurfaceCard key={i} padding="lg" clickable={false}>
              <label className="block">
                <span className="font-medium text-[var(--ink)]">
                  {i + 1}. {q}
                </span>
                <div className="mt-2">
                  <VoiceInput
                    value={answers[i]}
                    onChange={(val) => {
                      const next = [...answers];
                      next[i] = val;
                      setAnswers(next);
                    }}
                    rows={4}
                    placeholder="Escribe o graba tu respuesta..."
                    aria-label={`Respuesta ${i + 1}`}
                  />
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {countWords(answers[i])} / {MIN_WORDS_PER_ANSWER} palabras
                  {countWords(answers[i]) >= MIN_WORDS_PER_ANSWER && " ✓"}
                </p>
              </label>
            </SurfaceCard>
          ))}
          {submitError && (
            <p className="text-sm text-[var(--error)]" role="alert">
              {submitError}
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar para evaluación
          </button>
        </div>
      )}

      {step === "evaluating" && (
        <div className="py-16 text-center">
          <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--ink-muted)]">Claude está evaluando tus decisiones…</p>
          <p className="text-sm text-[var(--muted)] mt-2">Unos 30 segundos</p>
        </div>
      )}

      {step === "results" && evaluation && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Resultados</h1>

          <div className="flex justify-center">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white"
              style={{ background: "var(--primary)" }}
            >
              {evaluation.scoreTotal}
            </div>
          </div>
          {cohortAverage != null && (
            <p className="text-center text-[var(--ink-muted)] text-sm">
              Promedio de tu grupo (anónimo): {cohortAverage} pts
            </p>
          )}

          {evaluation.scoreTotal > 75 && (
            <SurfaceCard padding="md" className="border-[var(--success)]/40 bg-[var(--success-soft)]">
              <p className="text-sm font-semibold text-[var(--success)]">
                ¡Badge desbloqueado: Estratega!
              </p>
            </SurfaceCard>
          )}

          {Object.keys(evaluation.scoresPorCriterio).length > 0 && (
            <SurfaceCard padding="lg" clickable={false}>
              <h2 className="font-semibold text-[var(--ink)] mb-4">Por criterio</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={Object.entries(evaluation.scoresPorCriterio).map(([criterio, score]) => ({
                      criterio: criterio.length > 12 ? criterio.slice(0, 12) + "…" : criterio,
                      score,
                      fullMark: 100,
                    }))}
                  >
                    <PolarGrid stroke="var(--line)" />
                    <PolarAngleAxis dataKey="criterio" tick={{ fill: "var(--ink-muted)", fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "var(--muted)" }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="var(--primary)"
                      fill="var(--primary)"
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </SurfaceCard>
          )}

          <SurfaceCard padding="lg" clickable={false}>
            <h2 className="font-semibold text-[var(--ink)] mb-2">Retroalimentación</h2>
            <p className="text-[var(--ink)] whitespace-pre-line text-sm">
              {evaluation.retroalimentacion}
            </p>
          </SurfaceCard>

          <SurfaceCard padding="md" className="border-[var(--success)]/30 bg-[var(--success-soft)]/50">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[var(--success)] uppercase tracking-wide">
                  Decisión clave que tomaste bien
                </p>
                <p className="text-[var(--ink)] text-sm mt-1">{evaluation.decisionClave}</p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard padding="md" className="border-[var(--error)]/30 bg-[var(--surface-soft)]">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-[var(--error)] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[var(--error)] uppercase tracking-wide">
                  Error crítico a trabajar
                </p>
                <p className="text-[var(--ink)] text-sm mt-1">{evaluation.errorCritico}</p>
              </div>
            </div>
          </SurfaceCard>

          <div className="flex gap-3">
            <Link
              href="/simulador"
              className="flex-1 py-3 rounded-xl font-semibold text-center border border-[var(--line)] text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-soft)]"
            >
              Ver más simulaciones
            </Link>
            <Link
              href="/laboratorio"
              className="flex-1 py-3 rounded-xl font-semibold text-center text-white bg-[var(--primary)]"
            >
              Volver al Laboratorio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
