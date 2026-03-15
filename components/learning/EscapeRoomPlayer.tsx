"use client";

import { useState, useEffect } from "react";
import { SurfaceCard, PrimaryButton } from "@/components/ui";
import type { EscapeRoom, EscapeRoomChallenge, EscapeRoomProgress } from "@/lib/services/escapeRoom";
import { Clock, Lightbulb, Trophy } from "lucide-react";

interface EscapeRoomPlayerProps {
  room: EscapeRoom;
  progress: EscapeRoomProgress | null;
  roomId: string;
  onStart: () => Promise<{ progress: EscapeRoomProgress }>;
  onSubmitAnswer: (roomIndex: number, answer: string) => Promise<{ correct: boolean; completed: boolean }>;
  onUseHint: (roomIndex: number) => Promise<{ hintsUsed: number; allowed: boolean }>;
}

export function EscapeRoomPlayer({
  room,
  progress,
  roomId,
  onStart,
  onSubmitAnswer,
  onUseHint,
}: EscapeRoomPlayerProps) {
  const [started, setStarted] = useState(!!progress);
  const [currentIndex, setCurrentIndex] = useState(progress?.currentRoomIndex ?? 0);
  const [completed, setCompleted] = useState(!!progress?.completedAt);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hintsUsed, setHintsUsed] = useState<Record<number, number>>(progress?.hintsUsedByRoom ?? {});
  const [secondsLeft, setSecondsLeft] = useState(room.durationMinutes * 60);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    if (!started || completed || room.durationMinutes <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [started, completed, room.durationMinutes]);

  const handleStart = async () => {
    const res = await onStart();
    setStarted(true);
    setCurrentIndex(res.progress.currentRoomIndex ?? 0);
    setCompleted(!!res.progress.completedAt);
    setHintsUsed(res.progress.hintsUsedByRoom ?? {});
    if (room.durationMinutes > 0) setSecondsLeft(room.durationMinutes * 60);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await onSubmitAnswer(currentIndex, answer);
      setFeedback(res.correct ? "correct" : "wrong");
      if (res.correct) {
        setAnswer("");
        setCurrentIndex((i) => i + 1);
        if (res.completed) setCompleted(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleHint = async () => {
    const res = await onUseHint(currentIndex);
    setHintsUsed((prev) => ({ ...prev, [currentIndex]: res.hintsUsed }));
  };

  const challenge: EscapeRoomChallenge | undefined = room.rooms[currentIndex];
  const hintsForRoom = hintsUsed[currentIndex] ?? 0;
  const canUseHint = challenge && hintsForRoom < room.maxHintsPerRoom;

  if (!started) {
    return (
      <SurfaceCard padding="lg" clickable={false}>
        <h2 className="text-xl font-semibold text-[var(--ink)] mb-2">{room.title}</h2>
        <p className="text-[var(--ink-muted)] mb-4">{room.description}</p>
        <p className="text-sm text-[var(--ink-muted)] mb-4">
          {room.durationMinutes} min · Máx. {room.maxHintsPerRoom} pistas por sala · {room.rooms.length} salas
        </p>
        <PrimaryButton onClick={handleStart}>Comenzar escape room</PrimaryButton>
      </SurfaceCard>
    );
  }

  if (completed) {
    return (
      <SurfaceCard padding="lg" clickable={false} className="text-center">
        <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[var(--ink)] mb-2">¡Completado!</h2>
        <p className="text-[var(--primary)] font-medium mb-2">Badge: {room.completionBadge}</p>
        <p className="text-sm text-[var(--ink-muted)]">Has superado todas las salas.</p>
      </SurfaceCard>
    );
  }

  if (!challenge) {
    return (
      <SurfaceCard padding="lg">
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      </SurfaceCard>
    );
  }

  return (
    <div className="space-y-4">
      {room.durationMinutes > 0 && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-soft)]">
          <Clock className="w-4 h-4 text-[var(--ink-muted)]" />
          <span className="font-mono text-[var(--ink)]">
            {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
      )}
      <SurfaceCard padding="lg" clickable={false}>
        <p className="text-sm text-[var(--ink-muted)] mb-2">Sala {currentIndex + 1} de {room.rooms.length}</p>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-3">{challenge.title}</h2>
        <div className="prose prose-sm text-[var(--ink)] mb-4 whitespace-pre-wrap">{challenge.content}</div>
        {challenge.question && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-[var(--ink)]">{challenge.question}</span>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="mt-2 w-full px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--ink)]"
                placeholder="Tu respuesta..."
                disabled={submitting}
              />
            </label>
            {feedback === "wrong" && (
              <p className="text-sm text-red-600">No es correcto. Intenta de nuevo.</p>
            )}
            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="submit" disabled={submitting || !answer.trim()}>
                {submitting ? "Comprobando…" : "Enviar respuesta"}
              </PrimaryButton>
              {canUseHint && (
                <button
                  type="button"
                  onClick={handleHint}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--cream)]"
                  aria-label="Obtener pista"
                >
                  <Lightbulb className="w-4 h-4" aria-hidden />
                  Pista ({hintsForRoom}/{room.maxHintsPerRoom})
                </button>
              )}
            </div>
          </form>
        )}
      </SurfaceCard>
    </div>
  );
}
