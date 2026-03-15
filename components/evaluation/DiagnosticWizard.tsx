"use client";

import { useState } from "react";
import type { DiagnosticAnswers } from "@/lib/services/evaluation";

/** Exactamente 5 preguntas del diagnóstico inicial (auditoría ítem 73). */
const STEPS = [
  {
    key: "experience",
    title: "Experiencia",
    question: "¿Cuál es tu nivel de experiencia en innovación pública?",
    type: "single" as const,
    options: ["Básico", "Intermedio", "Avanzado"],
  },
  {
    key: "motivation",
    title: "Motivación",
    question: "¿Cuál es tu principal motivación para este programa?",
    type: "single" as const,
    options: [
      "Me lo indicó mi jefatura",
      "Quiero crecer profesionalmente",
      "Necesito herramientas para un proyecto específico",
      "Me interesa el tema por iniciativa propia",
    ],
  },
  {
    key: "challenges",
    title: "Mayor reto",
    question: "¿Cuál es tu mayor reto en tu institución? (máx. 2)",
    type: "multi" as const,
    max: 2,
    options: [
      "Resistencia al cambio en mi equipo",
      "Falta de recursos o presupuesto",
      "Procesos muy rígidos o burocráticos",
      "No sé por dónde empezar",
      "Falta de apoyo de la dirección",
    ],
  },
  {
    key: "expectation",
    title: "Expectativa",
    question: "¿Qué esperas lograr al terminar el programa? (opcional)",
    type: "text" as const,
    maxChars: 200,
  },
  {
    key: "availability",
    title: "Disponibilidad",
    question: "¿Cuánto tiempo puedes dedicar por semana?",
    type: "single" as const,
    options: ["1 a 2 horas", "3 a 5 horas", "6 horas o más"],
  },
];

const INITIAL_ANSWERS: DiagnosticAnswers = {
  experience: "",
  motivation: "",
  challenges: [],
  expectation: "",
  availability: "",
};

interface DiagnosticWizardProps {
  onComplete: (answers: DiagnosticAnswers, skipped: boolean) => Promise<void>;
  onSaveLetter?: (content: string) => Promise<void>;
  demo?: boolean;
}

export function DiagnosticWizard({ onComplete, onSaveLetter, demo = false }: DiagnosticWizardProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<DiagnosticAnswers>({ ...INITIAL_ANSWERS });
  const [textValue, setTextValue] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isLetterStep = step === STEPS.length;
  const current = isLetterStep ? null : STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleSingle = (value: string) => {
    if (!current) return;
    setAnswers((a) => ({ ...a, [current.key as keyof DiagnosticAnswers]: value }));
  };

  const handleMulti = (value: string) => {
    setAnswers((a) => {
      const list = (a.challenges ?? []).includes(value)
        ? (a.challenges ?? []).filter((x) => x !== value)
        : [...(a.challenges ?? []), value].slice(0, 2);
      return { ...a, challenges: list };
    });
  };

  const handleNext = () => {
    if (current?.key === "expectation") {
      setAnswers((a) => ({ ...a, expectation: textValue.slice(0, 200) }));
    }
    if (isLast) {
      setStep(STEPS.length);
      setTextValue("");
    } else {
      setStep((s) => s + 1);
      setTextValue("");
    }
  };

  const handleSaveLetter = async () => {
    setSubmitting(true);
    try {
      if (onSaveLetter) await onSaveLetter(letterContent);
      await onComplete(answers, false);
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async (skipped: boolean) => {
    setSubmitting(true);
    try {
      const final = isLast && current?.key === "expectation"
        ? { ...answers, expectation: textValue.slice(0, 200) }
        : answers;
      await onComplete(final, skipped);
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    if (!current) return false;
    if (current.type === "single")
      return (answers[current.key as keyof DiagnosticAnswers] as string)?.trim().length > 0;
    if (current.type === "multi")
      return (answers.challenges?.length ?? 0) <= 2;
    return true;
  };

  if (isLetterStep) {
    return (
      <div className="card-premium p-6 max-w-lg mx-auto">
        <h2 className="heading-section mb-2">Una última cosa — escríbete una carta</h2>
        <p className="text-[var(--text)] mb-6">
          Al terminar el programa, te la mostraremos. ¿Qué te prometiste hoy?
        </p>
        <textarea
          value={letterContent}
          onChange={(e) => setLetterContent(e.target.value)}
          placeholder="Querido yo del futuro, empiezo este programa porque..."
          rows={5}
          className="w-full px-4 py-3 rounded-lg border border-[var(--line)] text-[var(--text)] bg-[var(--surface)] input-premium mb-4"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setStep(STEPS.length - 1)}
            className="px-6 py-3 rounded-full border border-[var(--line)] text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] min-h-[48px]"
          >
            Atrás
          </button>
          <button
            type="button"
            onClick={handleSaveLetter}
            disabled={submitting}
            className="btn-primary disabled:opacity-50 min-h-[48px]"
          >
            {submitting ? "Guardando…" : "Guardar mi carta"}
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="card-premium p-6 max-w-lg mx-auto">
      <p className="section-label mb-1">
        Paso {step + 1} de {STEPS.length}
      </p>
      <h2 className="heading-section mb-2">{current.title}</h2>
      <p className="text-[var(--text)] mb-6">{current.question}</p>

      {current.type === "single" && (
        <ul className="space-y-2 mb-6">
          {current.options!.map((opt) => (
            <li key={opt}>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--line)] hover:bg-[var(--surface-soft)] cursor-pointer">
                <input
                  type="radio"
                  name={current.key}
                  value={opt}
                  checked={(answers[current.key as keyof DiagnosticAnswers] as string) === opt}
                  onChange={() => handleSingle(opt)}
                  className="w-5 h-5 text-[var(--primary)]"
                />
                <span className="text-[var(--text)]">{opt}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {current.type === "multi" && (
        <ul className="space-y-2 mb-6">
          {current.options!.map((opt) => (
            <li key={opt}>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--line)] hover:bg-[var(--surface-soft)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={(answers.challenges ?? []).includes(opt)}
                  onChange={() => handleMulti(opt)}
                  disabled={
                    !(answers.challenges ?? []).includes(opt) &&
                    (answers.challenges ?? []).length >= (current.max ?? 2)
                  }
                  className="w-5 h-5 rounded text-[var(--primary)]"
                />
                <span className="text-[var(--text)]">{opt}</span>
              </label>
            </li>
          ))}
          <p className="text-sm text-[var(--muted)]">
            {(answers.challenges ?? []).length} de {current.max} seleccionados
          </p>
        </ul>
      )}

      {current.type === "text" && (
        <div className="mb-6">
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value.slice(0, 200))}
            placeholder="Escribe aquí (opcional)"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-[var(--line)] text-[var(--text)] bg-[var(--surface)] input-premium"
            maxLength={200}
          />
          <p className="text-sm text-[var(--muted)] mt-1">{textValue.length}/200</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {!isFirst && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="px-6 py-3 rounded-full border border-[var(--line)] text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] min-h-[48px]"
          >
            Atrás
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={(!canNext() && current.type !== "text") || submitting}
          className="btn-primary disabled:opacity-50"
        >
          {submitting ? "Guardando…" : isLast ? "Finalizar" : "Siguiente"}
        </button>
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={submitting}
          className="text-[var(--muted)] hover:text-[var(--ink)] underline"
        >
          Completar después
        </button>
      </div>
    </div>
  );
}
