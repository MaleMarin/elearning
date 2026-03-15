"use client";

import { useState } from "react";
import { StarRating } from "./StarRating";
import { NPSSelector } from "./NPSSelector";

const METHODOLOGY_QUESTIONS = [
  "¿La metodología del programa fue clara y ordenada?",
  "¿Las actividades prácticas te ayudaron a entender mejor?",
  "¿El nivel de dificultad fue adecuado?",
];

const CONTENT_QUESTIONS = [
  "¿El contenido fue relevante para tu trabajo?",
  "¿Las lecciones fueron claras y bien explicadas?",
  "¿Aplicarías lo aprendido en tu organización?",
];

const PLATFORM_QUESTIONS = [
  "¿La plataforma fue fácil de usar?",
  "¿Tuviste problemas técnicos durante el programa?",
  "¿El bot asistente te fue útil?",
];

interface ClosingSurveyProps {
  onSubmit: (data: {
    methodology: number[];
    content: number[];
    platform: number[];
    nps: number;
    comment?: string;
  }) => Promise<void>;
  onSuccess: () => void;
  demo?: boolean;
}

export function ClosingSurvey({ onSubmit, onSuccess, demo = false }: ClosingSurveyProps) {
  const [methodology, setMethodology] = useState<number[]>([0, 0, 0]);
  const [content, setContent] = useState<number[]>([0, 0, 0]);
  const [platform, setPlatform] = useState<number[]>([0, 0, 0]);
  const [nps, setNps] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setMethodologyAt = (i: number, v: number) => {
    setMethodology((m) => {
      const next = [...m];
      next[i] = v;
      return next;
    });
  };
  const setContentAt = (i: number, v: number) => {
    setContent((c) => {
      const next = [...c];
      next[i] = v;
      return next;
    });
  };
  const setPlatformAt = (i: number, v: number) => {
    setPlatform((p) => {
      const next = [...p];
      next[i] = v;
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        methodology,
        content,
        platform,
        nps: nps !== null ? nps : 0,
        comment: comment.trim() || undefined,
      });
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card-premium p-6 max-w-lg mx-auto space-y-8">
      <h2 className="heading-section">Encuesta de cierre</h2>
      <p className="text-[var(--text-muted)]">
        Tu opinión nos ayuda a mejorar. Responde con sinceridad (opcional en comentario).
      </p>

      <section>
        <h3 className="font-semibold text-[var(--ink)] mb-3">Metodología</h3>
        <ul className="space-y-4">
          {METHODOLOGY_QUESTIONS.map((q, i) => (
            <li key={i}>
              <p className="text-[var(--text)] mb-2">{q}</p>
              <StarRating value={methodology[i] ?? 0} onChange={(v) => setMethodologyAt(i, v)} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-[var(--ink)] mb-3">Contenido del curso</h3>
        <ul className="space-y-4">
          {CONTENT_QUESTIONS.map((q, i) => (
            <li key={i}>
              <p className="text-[var(--text)] mb-2">{q}</p>
              <StarRating value={content[i] ?? 0} onChange={(v) => setContentAt(i, v)} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-[var(--ink)] mb-3">Plataforma</h3>
        <ul className="space-y-4">
          {PLATFORM_QUESTIONS.map((q, i) => (
            <li key={i}>
              <p className="text-[var(--text)] mb-2">{q}</p>
              <StarRating value={platform[i] ?? 0} onChange={(v) => setPlatformAt(i, v)} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-[var(--ink)] mb-3">
          ¿Qué tan probable es que recomiendes este programa a un colega? (0-10)
        </h3>
        <NPSSelector value={nps} onChange={setNps} />
      </section>

      <section>
        <label className="block">
          <span className="font-medium text-[var(--text)]">Comentarios o sugerencias (opcional)</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 2000))}
            rows={3}
            className="mt-2 w-full px-4 py-3 rounded-lg border border-[var(--line)] text-[var(--text)] bg-[var(--surface)]"
            maxLength={2000}
          />
        </label>
      </section>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="btn-primary disabled:opacity-50"
      >
        {submitting ? "Enviando…" : "Enviar encuesta"}
      </button>
    </div>
  );
}
