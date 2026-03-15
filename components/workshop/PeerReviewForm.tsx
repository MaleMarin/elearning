"use client";

import { useState } from "react";
import { SurfaceCard, PrimaryButton } from "@/components/ui";
import { RubricDisplay } from "./RubricDisplay";
import type { RubricCriterion } from "@/lib/services/workshop";

interface PeerReviewFormProps {
  rubric: RubricCriterion[];
  reviewedUserId: string;
  slotLabel: string;
  submissionContent: string;
  submissionFileUrl: string | null;
  onSubmit: (scores: Record<string, number>, feedback: string) => Promise<void>;
  alreadySubmitted?: boolean;
}

/**
 * Formulario para evaluar un trabajo de un par: puntaje por criterio + feedback escrito.
 */
export function PeerReviewForm({
  rubric,
  reviewedUserId,
  slotLabel,
  submissionContent,
  submissionFileUrl,
  onSubmit,
  alreadySubmitted,
}: PeerReviewFormProps) {
  const [scores, setScores] = useState<Record<string, number>>(() =>
    rubric.reduce((acc, c) => ({ ...acc, [c.id]: 0 }), {})
  );
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(scores, feedback);
    } finally {
      setSaving(false);
    }
  };

  if (alreadySubmitted) {
    return (
      <SurfaceCard padding="md" clickable={false}>
        <p className="text-sm text-[var(--success)] font-medium">Ya enviaste tu evaluación para {slotLabel}.</p>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard padding="lg" clickable={false}>
      <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">Evaluar {slotLabel}</h3>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 mb-4">
        <p className="text-sm text-[var(--ink-muted)] mb-2">Trabajo a evaluar:</p>
        <p className="text-[var(--ink)] whitespace-pre-wrap">{submissionContent || "(Sin contenido)"}</p>
        {submissionFileUrl && (
          <a href={submissionFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block">
            Ver archivo adjunto
          </a>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <RubricDisplay rubric={rubric} readOnly />
        <div className="space-y-2">
          {rubric.map((c) => (
            <label key={c.id} className="block">
              <span className="text-sm font-medium text-[var(--ink)]">{c.label} (0–{c.maxScore})</span>
              <input
                type="number"
                min={0}
                max={c.maxScore}
                value={scores[c.id] ?? 0}
                onChange={(e) => setScores((s) => ({ ...s, [c.id]: Math.min(c.maxScore, Math.max(0, Number(e.target.value) || 0)) }))}
                className="mt-1 block w-full max-w-[120px] px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]"
              />
            </label>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">Feedback escrito (opcional)</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--ink)]"
            placeholder="Comentarios para el autor..."
          />
        </div>
        <PrimaryButton type="submit" disabled={saving}>
          {saving ? "Enviando…" : "Enviar evaluación"}
        </PrimaryButton>
      </form>
    </SurfaceCard>
  );
}
