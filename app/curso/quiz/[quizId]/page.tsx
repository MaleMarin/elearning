"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { SurfaceCard, EmptyState } from "@/components/ui";
import { getDemoMode } from "@/lib/env";

type QuizMeta = { id: string; title: string; questionCount: number; passingScore: number; timeLimit: number; maxAttempts: number };
type QuestionForPlayer = { id: string; question: string; type: string; options: string[]; correctAnswer: string | string[]; explanation: string; difficulty: string; tags: string[] };

export default function CursoQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = String(params?.quizId ?? "");
  const [phase, setPhase] = useState<"info" | "playing" | "done">("info");
  const [quiz, setQuiz] = useState<QuizMeta | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionForPlayer[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState(0);
  const [canStart, setCanStart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLimit, setTimeLimit] = useState(0);
  const [passingScore, setPassingScore] = useState(60);
  const [showExplanations, setShowExplanations] = useState(true);

  useEffect(() => {
    if (!quizId) {
      setLoading(false);
      return;
    }
    fetch(`/api/curso/quiz/${quizId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.quiz) {
          setQuiz(data.quiz);
          setAttemptsLeft(data.attemptsLeft ?? 0);
          setCanStart(data.canStart ?? false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleStart = () => {
    setLoading(true);
    fetch(`/api/curso/quiz/${quizId}/start`, { method: "POST", credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setCanStart(false);
          return;
        }
        setAttemptId(data.attemptId);
        setQuestions(data.questions ?? []);
        setTimeLimit(data.quiz?.timeLimit ?? 0);
        setPassingScore(data.quiz?.passingScore ?? 60);
        setShowExplanations(data.quiz?.showExplanations !== false);
        setPhase("playing");
      })
      .catch(() => setCanStart(false))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (answers: Record<string, string | number>) => {
    if (!attemptId) return { score: 0, passed: false, questions: [] };
    const res = await fetch(`/api/curso/quiz/attempt/${attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return { score: data.score, passed: data.passed, questions: data.questions ?? [] };
  };

  if (loading && phase === "info") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-[var(--text-muted)]">Cargando…</p>
      </div>
    );
  }

  if (phase === "playing" && attemptId && questions.length > 0) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="heading-hero text-[var(--ink)] mb-6">{quiz?.title ?? "Quiz"}</h1>
        <QuizPlayer
          quizId={quizId}
          attemptId={attemptId}
          questions={questions}
          timeLimitMinutes={timeLimit}
          passingScore={passingScore}
          showExplanations={showExplanations}
          onSubmit={handleSubmit}
          onContinue={() => router.push("/curso")}
          onRetry={canStart ? () => { setPhase("info"); setAttemptId(null); setQuestions([]); } : undefined}
          demo={getDemoMode()}
        />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <EmptyState title="Quiz no encontrado" description="No tienes acceso o el quiz no existe." ctaLabel="Volver al curso" ctaHref="/curso" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <SurfaceCard padding="lg" clickable={false}>
        <h1 className="heading-hero text-[var(--ink)] mb-2">{quiz.title}</h1>
        <p className="text-[var(--text-muted)] mb-4">
          {quiz.questionCount} preguntas · Aprobación al {quiz.passingScore}%
          {quiz.timeLimit > 0 && ` · Límite ${quiz.timeLimit} min`}
          {quiz.maxAttempts > 0 && ` · ${attemptsLeft} intentos restantes`}
        </p>
        {canStart ? (
          <button type="button" onClick={handleStart} disabled={loading} className="btn-primary">
            {loading ? "Iniciando…" : "Comenzar quiz"}
          </button>
        ) : (
          <p className="text-[var(--text-muted)]">
            No puedes iniciar este quiz ahora. Puedes intentarlo de nuevo en 24 h si ya usaste tus intentos.
          </p>
        )}
        <div className="mt-4">
          <Link href="/curso" className="text-[var(--primary)] hover:underline">Volver al curso</Link>
        </div>
      </SurfaceCard>
    </div>
  );
}
