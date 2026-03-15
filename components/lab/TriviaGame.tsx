"use client";

import { useState, useEffect, useCallback } from "react";
import { SurfaceCard, ProgressBar, PrimaryButton } from "@/components/ui";

interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface TriviaGameProps {
  onBack: () => void;
}

const TIMER_SECONDS = 20;

export function TriviaGame({ onBack }: TriviaGameProps) {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [ranking, setRanking] = useState<{ userId: string; score: number; displayName?: string }[]>([]);
  const [weekId, setWeekId] = useState<string | null>(null);

  const currentQuestion = questions[index] ?? null;

  useEffect(() => {
    fetch("/api/lab/trivia", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.questions?.length) {
          setQuestions(data.questions);
          setWeekId(data.weekId ?? null);
        } else {
          setError("No hay preguntas esta semana. Vuelve el lunes.");
        }
      })
      .catch(() => setError("Error al cargar la trivia."))
      .finally(() => setLoading(false));
  }, []);

  const advance = useCallback(() => {
    const add = selected === currentQuestion?.correctIndex ? 1 : 0;
    const newScore = score + add;
    setScore(newScore);
    if (index + 1 >= questions.length) {
      setFinished(true);
      fetch("/api/lab/trivia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: newScore }),
        credentials: "include",
      }).catch(() => {});
      fetch("/api/lab/trivia/ranking", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d?.ranking && setRanking(d.ranking))
        .catch(() => {});
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setShowResult(false);
      setTimeLeft(TIMER_SECONDS);
    }
  }, [index, questions.length, score, selected, currentQuestion?.correctIndex]);

  useEffect(() => {
    if (!currentQuestion || showResult || finished) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          setShowResult(true);
          setSelected(null);
          setTimeout(() => advance(), 2500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [currentQuestion, showResult, finished, advance]);

  const handleChoose = (optionIndex: number) => {
    if (showResult || selected !== null) return;
    setSelected(optionIndex);
    setShowResult(true);
    setTimeout(() => advance(), 2500);
  };

  if (loading) {
    return (
      <SurfaceCard padding="lg" clickable={false}>
        <p className="text-[var(--ink-muted)]">Cargando trivia…</p>
        <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4">
          ← Volver
        </button>
      </SurfaceCard>
    );
  }

  if (error || questions.length === 0) {
    return (
      <SurfaceCard padding="lg" clickable={false}>
        <p className="text-[var(--ink-muted)]">{error || "No hay preguntas disponibles."}</p>
        <PrimaryButton onClick={onBack} className="mt-4">
          ← Volver
        </PrimaryButton>
      </SurfaceCard>
    );
  }

  if (finished) {
    return (
      <SurfaceCard padding="lg" clickable={false}>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Resultado</h2>
        <p className="text-[var(--ink-muted)] mt-1">Obtuviste {score} de {questions.length} aciertos.</p>
        {ranking.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[var(--ink)] mb-2">Ranking semanal (tu cohorte)</h3>
            <ul className="space-y-1 text-sm">
              {ranking.slice(0, 10).map((r, i) => (
                <li key={r.userId} className="flex justify-between">
                  <span className="text-[var(--ink)]">
                    {i + 1}. {r.displayName ?? "Anónimo"}
                  </span>
                  <span className="font-medium">{r.score}/5</span>
                </li>
              ))}
            </ul>
            {ranking[0] && (
              <p className="text-xs text-[var(--primary)] mt-2">🏆 Innovador de la semana: quien tenga 5/5 y haya completado primero.</p>
            )}
          </div>
        )}
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
          Pregunta {index + 1} de {questions.length}
        </span>
        <span className="text-sm font-medium text-[var(--ink)]">{score} aciertos</span>
      </div>
      <ProgressBar value={timeLeft} max={TIMER_SECONDS} aria-label="Tiempo restante" className="mb-4" />
      <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">{currentQuestion?.question}</h2>
      <ul className="space-y-2">
        {currentQuestion?.options.map((opt, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => handleChoose(i)}
              disabled={showResult}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors min-h-[48px] ${
                showResult
                  ? i === currentQuestion.correctIndex
                    ? "border-green-500 bg-green-50 text-green-900"
                    : selected === i
                      ? "border-red-400 bg-red-50 text-red-900"
                      : "border-[var(--line)] bg-[var(--surface-soft)]"
                  : "border-[var(--line)] bg-[var(--surface-soft)] hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
              }`}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
      {showResult && currentQuestion && (
        <div className="mt-4 p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)]">
          <p className="text-sm text-[var(--ink)]">{currentQuestion.explanation}</p>
        </div>
      )}
      <button type="button" onClick={onBack} className="text-[var(--primary)] hover:underline mt-4 text-sm">
        ← Volver
      </button>
    </SurfaceCard>
  );
}
