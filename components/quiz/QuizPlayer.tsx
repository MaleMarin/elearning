"use client";

import { useState, useEffect } from "react";
import { QuestionCard } from "./QuestionCard";
import { QuizResults } from "./QuizResults";

type QuestionForPlayer = {
  id: string;
  question: string;
  type: string;
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: string;
  tags: string[];
};

interface QuizPlayerProps {
  quizId: string;
  attemptId: string;
  questions: QuestionForPlayer[];
  timeLimitMinutes: number;
  passingScore: number;
  showExplanations: boolean;
  onSubmit: (answers: Record<string, string | number>) => Promise<{ score: number; passed: boolean; questions: { id: string; question: string; correctAnswer: unknown; explanation?: string; userAnswer?: unknown }[] }>;
  onContinue: () => void;
  onRetry?: () => void;
  demo?: boolean;
}

export function QuizPlayer({
  quizId,
  attemptId,
  questions,
  timeLimitMinutes,
  passingScore,
  showExplanations,
  onSubmit,
  onContinue,
  onRetry,
  demo,
}: QuizPlayerProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; questions: { id: string; question: string; correctAnswer: unknown; explanation?: string; userAnswer?: unknown }[] } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitMinutes > 0 ? timeLimitMinutes * 60 : 0);

  useEffect(() => {
    if (timeLimitMinutes <= 0 || result) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timeLimitMinutes, result]);

  const current = questions[step];
  const selected = current ? answers[current.id] ?? null : null;

  const handleNext = async () => {
    if (!current) return;
    if (step < questions.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    try {
      const res = await onSubmit(answers);
      setResult({ score: res.score, passed: res.passed, questions: res.questions ?? [] });
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <QuizResults
        score={result.score}
        passed={result.passed}
        passingScore={passingScore}
        questions={result.questions}
        showExplanations={showExplanations}
        onRetry={onRetry}
        onContinue={onContinue}
      />
    );
  }

  if (!current) return null;

  const canNext = selected !== null && selected !== "";
  const isLast = step === questions.length - 1;

  return (
    <div className="space-y-4">
      {timeLimitMinutes > 0 && (
        <div className="flex justify-center">
          <span className="px-4 py-2 rounded-full bg-[var(--surface-soft)] text-[var(--ink)] font-mono">
            {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
      )}
      <QuestionCard
        question={current as import("@/lib/services/quiz").Question}
        step={step}
        total={questions.length}
        selected={selected}
        onSelect={(value) => setAnswers((a) => ({ ...a, [current.id]: value }))}
        disabled={submitting}
      />
      <div className="flex justify-end gap-3 max-w-lg mx-auto">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="px-6 py-3 rounded-full border border-[var(--line)] text-[var(--ink)]"
          >
            Atrás
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={!canNext || submitting}
          className="btn-primary disabled:opacity-50"
        >
          {submitting ? "Enviando…" : isLast ? "Ver resultado" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}
