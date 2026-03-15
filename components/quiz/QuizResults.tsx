"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface QuizResultsProps {
  score: number;
  passed: boolean;
  passingScore: number;
  questions: { id: string; question: string; correctAnswer: unknown; explanation?: string; userAnswer?: unknown }[];
  showExplanations: boolean;
  onRetry?: () => void;
  onContinue?: () => void;
}

export function QuizResults({
  score,
  passed,
  passingScore,
  questions,
  showExplanations,
  onRetry,
  onContinue,
}: QuizResultsProps) {
  const confettiFired = useRef(false);
  useEffect(() => {
    if (passed && !confettiFired.current && typeof window !== "undefined") {
      confettiFired.current = true;
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    }
  }, [passed]);

  const correctLabel = Array.isArray(passingScore) ? "" : `${passingScore}% mínimo para aprobar`;

  return (
    <div className="card-premium p-6 max-w-lg mx-auto text-center">
      <h2 className="heading-section mb-4">Resultado del quiz</h2>
      <p className="text-3xl font-bold text-[var(--ink)] mb-1">{score}%</p>
      {passed ? (
        <p className="text-[var(--success)] font-medium mb-4">¡Aprobado!</p>
      ) : (
        <p className="text-[var(--text-muted)] mb-2">No alcanzaste el {passingScore}% requerido.</p>
      )}
      {showExplanations && questions.length > 0 && (
        <div className="mt-6 text-left space-y-4 border-t border-[var(--line)] pt-4">
          <h3 className="font-semibold text-[var(--ink)]">Respuestas correctas</h3>
          {questions.map((q) => (
            <div key={q.id} className="p-3 rounded-xl bg-[var(--surface-soft)]">
              <p className="text-[var(--ink)] font-medium">{q.question}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Correcta: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(", ") : String(q.correctAnswer)}
                {q.userAnswer !== undefined && (
                  <span className="ml-2">· Tu respuesta: {String(q.userAnswer)}</span>
                )}
              </p>
              {q.explanation && <p className="text-sm text-[var(--ink)] mt-2">{q.explanation}</p>}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3 justify-center mt-6">
        {!passed && onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary">
            Puedes intentarlo de nuevo
          </button>
        )}
        {onContinue && (
          <button type="button" onClick={onContinue} className="btn-primary">
            {passed ? "Continuar" : "Volver al curso"}
          </button>
        )}
      </div>
    </div>
  );
}
