"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FinalQuiz } from "@/components/evaluation/FinalQuiz";
import { ClosingSurvey } from "@/components/evaluation/ClosingSurvey";
import type { FinalQuizQuestion } from "@/lib/services/evaluation";
import { getDemoMode } from "@/lib/env";

type Step = "celebration" | "quiz" | "survey" | "done";

export default function EvaluacionFinalPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("celebration");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<FinalQuizQuestion[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const [surveyDone, setSurveyDone] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [progressRes, statusRes, questionsRes] = await Promise.all([
        fetch("/api/profile/progress", { credentials: "include" }),
        fetch("/api/evaluation/status", { credentials: "include" }),
        fetch("/api/evaluation/quiz-questions", { credentials: "include" }),
      ]);
      if (cancelled) return;
      const progress = progressRes.ok ? await progressRes.json() : null;
      const status = statusRes.ok ? await statusRes.json() : null;
      const qData = questionsRes.ok ? await questionsRes.json() : null;

      const completed = progress?.certificateAvailable ?? false;
      if (!completed && !getDemoMode()) {
        setLoading(false);
        router.replace("/curso");
        return;
      }
      if (qData?.questions?.length) setQuestions(qData.questions);
      if (status?.quizCompleted) {
        setQuizDone(true);
        setQuizPassed(true);
        if (status?.closingSurveyCompleted) {
          setSurveyDone(true);
          setStep("done");
        } else {
          setStep("survey");
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [router]);

  const handleCelebrationNext = () => {
    if (quizDone) {
      if (surveyDone) setStep("done");
      else setStep("survey");
    } else {
      setStep("quiz");
    }
  };

  const handleQuizSuccess = () => {
    setQuizDone(true);
    setQuizPassed(true);
    setStep("survey");
  };

  const handleSurveySuccess = () => {
    setSurveyDone(true);
    setStep("done");
  };

  if (loading && step === "celebration" && !quizDone) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-[var(--text-muted)]">Cargando…</p>
      </div>
    );
  }

  if (step === "celebration") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="card-premium p-8 text-center">
          <p className="text-5xl mb-4" aria-hidden>🎉</p>
          <h1 className="heading-hero text-[var(--ink)] mb-2">¡Completaste el programa!</h1>
          <p className="text-[var(--text-muted)] mb-6">
            Ahora te invitamos a realizar un breve quiz de conocimientos y la encuesta de satisfacción.
          </p>
          <button type="button" onClick={handleCelebrationNext} className="btn-primary">
            Continuar al quiz
          </button>
        </div>
      </div>
    );
  }

  if (step === "quiz") {
    if (questions.length === 0) {
      return (
        <div className="max-w-2xl mx-auto py-12 px-4 text-center">
          <p className="text-[var(--text-muted)] mb-4">No hay preguntas del quiz disponibles.</p>
          <Link href="/curso" className="btn-primary inline-flex">Volver al curso</Link>
        </div>
      );
    }
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="heading-hero text-[var(--ink)] mb-6">Quiz de conocimientos</h1>
        <FinalQuiz
          questions={questions}
          onSubmit={async (answers) => {
            const res = await fetch("/api/evaluation/quiz", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ answers }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return { score: data.score, total: data.total, passed: data.passed };
          }}
          onSuccess={handleQuizSuccess}
          onFailed={() => router.push("/curso")}
          demo={getDemoMode()}
        />
      </div>
    );
  }

  if (step === "survey") {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="heading-hero text-[var(--ink)] mb-6">Encuesta de satisfacción</h1>
        <ClosingSurvey
          onSubmit={async (data) => {
            const res = await fetch("/api/evaluation/closing-survey", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error((await res.json()).error);
          }}
          onSuccess={handleSurveySuccess}
          demo={getDemoMode()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="card-premium p-8">
        <h1 className="heading-hero text-[var(--ink)] mb-4">Evaluación completada</h1>
        <p className="text-[var(--text-muted)] mb-6">
          {quizPassed
            ? "Gracias por completar el quiz y la encuesta. Ya puedes descargar tu certificado."
            : "Gracias por tu tiempo. Puedes repasar el contenido y volver a intentar el quiz más tarde."}
        </p>
        <Link href="/certificado" className="btn-primary inline-flex">
          Ir al certificado
        </Link>
        <div className="mt-4">
          <Link href="/inicio" className="text-[var(--primary)] hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
