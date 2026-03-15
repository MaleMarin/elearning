"use client";

import { useState, useCallback } from "react";
import type {
  H5PContentPayload,
  H5PInteractiveVideo,
  H5PFlashcards,
  H5PQuiz,
  H5PImageHotspot,
} from "@/lib/services/h5p";

interface H5PPlayerProps {
  content: H5PContentPayload;
  title?: string;
  className?: string;
  /** Para tracking xAPI (p. ej. video pausado). */
  lessonId?: string;
}

/** Video interactivo: video + preguntas en momentos. */
function InteractiveVideoPlayer({
  content,
  lessonId,
}: {
  content: H5PInteractiveVideo;
  lessonId?: string;
}) {
  const [currentQuestion, setCurrentQuestion] = useState<number | null>(null);
  const [time, setTime] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const sorted = [...content.questions].sort((a, b) => a.timestamp - b.timestamp);
  const checkTime = useCallback((t: number) => {
    setTime(t);
    const next = sorted.findIndex((q) => q.timestamp >= t && answers[q.timestamp] === undefined);
    if (next >= 0 && sorted[next].timestamp <= t + 2) setCurrentQuestion(next);
    else if (currentQuestion !== null && sorted[currentQuestion] && t < sorted[currentQuestion].timestamp)
      setCurrentQuestion(null);
  }, [sorted, answers, currentQuestion]);

  const onTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = e.currentTarget;
    if (el) checkTime(el.currentTime);
  };

  const onPause = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const el = e.currentTarget;
      if (!lessonId || !el) return;
      const seconds = Math.floor(el.currentTime);
      fetch("/api/xapi/video-paused", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId, secondsPaused: seconds }),
      }).catch(() => {});
    },
    [lessonId]
  );

  const q = currentQuestion !== null ? sorted[currentQuestion] : null;
  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--ink)] aspect-video">
        <video
          src={content.videoUrl}
          controls
          className="w-full h-full"
          onTimeUpdate={onTimeUpdate}
          onPause={onPause}
        />
      </div>
      {q && (
        <div className="card-premium p-4">
          <p className="font-medium text-[var(--ink)] mb-2">{q.question}</p>
          <ul className="space-y-2">
            {q.options.map((opt, i) => (
              <li key={i}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${q.timestamp}`}
                    checked={answers[q.timestamp] === i}
                    onChange={() => {
                      setAnswers((a) => ({ ...a, [q.timestamp]: i }));
                      setCurrentQuestion(null);
                    }}
                    className="w-4 h-4 text-[var(--primary)]"
                  />
                  <span className="text-[var(--text)]">{opt}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Flashcards: frente y dorso. */
function FlashcardsPlayer({ content }: { content: H5PFlashcards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = content.cards[index];
  if (!card) return <p className="text-[var(--text-muted)]">Sin tarjetas.</p>;
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-[var(--text-muted)]">
        <span>Tarjeta {index + 1} de {content.cards.length}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setIndex((i) => Math.max(0, i - 1)); setFlipped(false); }}
            disabled={index === 0}
            className="px-2 py-1 rounded border border-[var(--line)] disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => { setIndex((i) => Math.min(content.cards.length - 1, i + 1)); setFlipped(false); }}
            disabled={index === content.cards.length - 1}
            className="px-2 py-1 rounded border border-[var(--line)] disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="w-full min-h-[120px] card-premium p-6 text-left hover:bg-[var(--surface-soft)] transition-colors"
      >
        <p className="text-[var(--ink)] font-medium">
          {flipped ? card.back : card.front}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2">Toca para voltear</p>
      </button>
    </div>
  );
}

/** Quiz H5P: múltiple opción. */
function QuizPlayer({ content }: { content: H5PQuiz }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const q = content.questions[step];
  if (!q) return <p className="text-[var(--text-muted)]">Sin preguntas.</p>;

  const handleNext = () => {
    if (step < content.questions.length - 1) setStep((s) => s + 1);
    else setDone(true);
  };

  if (done) {
    const correct = content.questions.filter((_, i) => answers[i] === content.questions[i].correctIndex).length;
    return (
      <div className="card-premium p-6 text-center">
        <p className="text-xl font-semibold text-[var(--ink)]">
          Resultado: {correct} / {content.questions.length}
        </p>
        <p className="text-[var(--text-muted)] mt-1">Respuestas correctas</p>
      </div>
    );
  }

  const selected = answers[step] ?? -1;
  return (
    <div className="space-y-4">
      <div className="text-sm text-[var(--text-muted)]">
        Pregunta {step + 1} de {content.questions.length}
      </div>
      <div className="card-premium p-4">
        <p className="font-medium text-[var(--ink)] mb-4">{q.question}</p>
        <ul className="space-y-2">
          {q.options.map((opt, i) => (
            <li key={i}>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--line)] hover:bg-[var(--surface-soft)] cursor-pointer">
                <input
                  type="radio"
                  name={`quiz-${step}`}
                  checked={selected === i}
                  onChange={() => setAnswers((a) => ({ ...a, [step]: i }))}
                  className="w-5 h-5 text-[var(--primary)]"
                />
                <span className="text-[var(--text)]">{opt}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          disabled={selected < 0}
          className="btn-primary disabled:opacity-50"
        >
          {step < content.questions.length - 1 ? "Siguiente" : "Ver resultado"}
        </button>
      </div>
    </div>
  );
}

/** Imagen con zonas clicables y tooltips. */
function ImageHotspotPlayer({ content }: { content: H5PImageHotspot }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = content.areas.find((a) => a.id === activeId);
  return (
    <div className="relative inline-block w-full max-w-2xl">
      <div className="relative rounded-xl overflow-hidden border border-[var(--line)]">
        <img
          src={content.imageUrl}
          alt="Contenido interactivo"
          className="w-full h-auto block"
        />
        {content.areas.map((area) => (
          <button
            key={area.id}
            type="button"
            className="absolute border-2 border-[var(--primary)] bg-[var(--primary)]/20 rounded hover:bg-[var(--primary)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{
              left: `${area.x}%`,
              top: `${area.y}%`,
              width: `${area.width}%`,
              height: `${area.height}%`,
            }}
            onClick={() => setActiveId(activeId === area.id ? null : area.id)}
            aria-label={area.tooltip}
          />
        ))}
      </div>
      {active && (
        <div className="mt-3 p-3 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)]">
          <p className="text-[var(--ink)]">{active.tooltip}</p>
        </div>
      )}
    </div>
  );
}

export function H5PPlayer({ content, title, className = "", lessonId }: H5PPlayerProps) {
  try {
    return (
      <div className={className}>
        {title && <h3 className="heading-section mb-4">{title}</h3>}
        {content.type === "interactive_video" && (
          <InteractiveVideoPlayer content={content} lessonId={lessonId} />
        )}
        {content.type === "flashcards" && <FlashcardsPlayer content={content} />}
        {content.type === "quiz" && <QuizPlayer content={content} />}
        {content.type === "image_hotspot" && <ImageHotspotPlayer content={content} />}
      </div>
    );
  } catch {
    return (
      <div className={`rounded-xl border border-[var(--line)] p-6 text-[var(--text-muted)] ${className}`}>
        No se pudo cargar este contenido interactivo.
      </div>
    );
  }
}
