"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { getDemoMode } from "@/lib/env";

type QuizMeta = { id: string; title: string; questionCount: number; passingScore: number; timeLimit: number; maxAttempts: number };
type QuestionForPlayer = { id: string; question: string; type: string; options: string[]; correctAnswer: string | string[]; explanation: string; difficulty: string; tags: string[] };

const LayoutWrap = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      flex: 1,
      padding: "24px 32px",
      background: "#e8eaf0",
      minHeight: "100vh",
      fontFamily: "'Raleway', sans-serif",
      maxWidth: 1100,
      margin: "0 auto",
      width: "100%",
    }}
  >
    {children}
  </div>
);

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
      <LayoutWrap>
        <p style={{ fontSize: 14, color: "#8892b0", textAlign: "center", padding: 48 }}>Cargando…</p>
      </LayoutWrap>
    );
  }

  if (phase === "playing" && attemptId && questions.length > 0) {
    return (
      <LayoutWrap>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 24 }}>{quiz?.title ?? "Quiz"}</h1>
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
      </LayoutWrap>
    );
  }

  if (!quiz) {
    return (
      <LayoutWrap>
        <div
          style={{
            background: "#e8eaf0",
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            maxWidth: 480,
            margin: "0 auto",
            boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0a0f8a", marginBottom: 8 }}>Quiz no encontrado</h2>
          <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>No tienes acceso o el quiz no existe.</p>
          <Link
            href="/curso"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
              color: "white",
              fontFamily: "'Raleway', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "5px 5px 14px rgba(10,15,138,0.35)",
            }}
          >
            Volver al curso
          </Link>
        </div>
      </LayoutWrap>
    );
  }

  return (
    <LayoutWrap>
      <div
        style={{
          background: "#e8eaf0",
          borderRadius: 20,
          padding: 32,
          maxWidth: 560,
          margin: "0 auto",
          boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 8 }}>{quiz.title}</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24, fontFamily: "'Source Sans 3', sans-serif" }}>
          {quiz.questionCount} preguntas · Aprobación al {quiz.passingScore}%
          {quiz.timeLimit > 0 && ` · Límite ${quiz.timeLimit} min`}
          {quiz.maxAttempts > 0 && ` · ${attemptsLeft} intentos restantes`}
        </p>
        {canStart ? (
          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            style={{
              padding: "14px 28px",
              borderRadius: 14,
              border: "none",
              cursor: loading ? "wait" : "pointer",
              fontFamily: "'Raleway', sans-serif",
              fontSize: 15,
              fontWeight: 800,
              background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
              color: "white",
              boxShadow: "5px 5px 14px rgba(10,15,138,0.35)",
            }}
          >
            {loading ? "Iniciando…" : "Comenzar quiz"}
          </button>
        ) : (
          <p style={{ fontSize: 13, color: "#8892b0", fontFamily: "'Source Sans 3', sans-serif" }}>
            No puedes iniciar este quiz ahora. Puedes intentarlo de nuevo en 24 h si ya usaste tus intentos.
          </p>
        )}
        <div style={{ marginTop: 20 }}>
          <Link
            href="/curso"
            style={{ fontSize: 13, fontWeight: 600, color: "#1428d4", textDecoration: "none" }}
          >
            ← Volver al curso
          </Link>
        </div>
      </div>
    </LayoutWrap>
  );
}
