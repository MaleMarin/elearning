"use client";

import { useState } from "react";
import type { FinalQuizQuestion } from "@/lib/services/evaluation";

interface FinalQuizProps {
  questions: FinalQuizQuestion[];
  onSubmit: (answers: Record<string, number>) => Promise<{ score: number; total: number; passed: boolean }>;
  onSuccess: () => void;
  onFailed?: () => void;
  demo?: boolean;
}

export function FinalQuiz({
  questions,
  onSubmit,
  onSuccess,
  onFailed,
  demo = false,
}: FinalQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);

  const current = questions[step];
  const isLast = step === questions.length - 1;

  const handleNext = async () => {
    if (isLast) {
      setSubmitting(true);
      try {
        const res = await onSubmit(answers);
        setResult(res);
        if (res.passed) onSuccess();
      } finally {
        setSubmitting(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (result !== null) {
    return (
      <div className="card-premium p-6 max-w-lg mx-auto text-center">
        <h2 className="heading-section mb-4">Resultado del quiz</h2>
        <p className="text-2xl font-bold text-[var(--ink)] mb-2">
          Obtuviste {result.score}/{result.total}
        </p>
        {result.passed ? (
          <p className="text-[var(--success)] font-medium mb-4">
            ¡Aprobado! Ya puedes continuar a la encuesta y al certificado.
          </p>
        ) : (
          <p className="text-[var(--muted)] mb-4">
            Puedes repasar el contenido y volver a intentarlo más tarde.
          </p>
        )}
        <button
          type="button"
          onClick={result.passed ? onSuccess : (onFailed ?? (() => {}))}
          className="btn-primary"
        >
          {result.passed ? "Continuar a la encuesta" : "Volver al curso"}
        </button>
      </div>
    );
  }

  if (!current) return null;

  const selected = answers[current.id] ?? -1;
  const progressPct = ((step + 1) / questions.length) * 100;

  return (
    <div className="card-premium p-6 max-w-lg mx-auto">
      <div className="mb-4">
        <div className="h-2 rounded-full bg-[var(--line)] overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-sm text-[var(--muted)] mt-1">
          Pregunta {step + 1} de {questions.length}
        </p>
      </div>
      <h2 className="heading-section mb-4">{current.question}</h2>
      <ul className="space-y-2 mb-6">
        {current.options.map((opt, i) => (
          <li key={i}>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--line)] hover:bg-[var(--surface-soft)] cursor-pointer">
              <input
                type="radio"
                name={current.id}
                checked={selected === i}
                onChange={() => setAnswers((a) => ({ ...a, [current.id]: i }))}
                className="w-5 h-5 text-[var(--primary)]"
              />
              <span className="text-[var(--text)]">{opt}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="px-6 py-3 rounded-full border border-[var(--line)] text-[var(--ink)] min-h-[48px]"
          >
            Atrás
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={selected < 0 || submitting}
          className="btn-primary disabled:opacity-50"
        >
          {submitting ? "Enviando…" : isLast ? "Ver resultado" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}
