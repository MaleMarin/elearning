"use client";

import { useState, useEffect } from "react";
import { SurfaceCard, PrimaryButton } from "@/components/ui";
import { Lightbulb } from "lucide-react";

const STORAGE_KEY = "learningNeedsDismissedAt";

export function LearningNeedsCard() {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (dismissed) {
        const t = parseInt(dismissed, 10);
        if (Date.now() - t < 7 * 24 * 60 * 60 * 1000) setHidden(true);
        else setHidden(false);
      } else setHidden(false);
    } catch {
      setHidden(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/learning-needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      setValue("");
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      setHidden(true);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (hidden) return null;

  return (
    <SurfaceCard padding="md" clickable={false} className="max-w-md bg-[var(--neu-bg)] shadow-[var(--neu-shadow-out-sm)]">
      <p className="text-sm text-[var(--ink)] mb-2 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-[var(--primary)]" />
        ¿Qué más quieres aprender?
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ej: automatización de trámites, análisis de datos..."
          className="flex-1 px-3 py-2 rounded-xl bg-[var(--neu-bg)] border-none shadow-[var(--neu-shadow-in)] text-[var(--ink)] text-sm"
          maxLength={300}
        />
        <PrimaryButton type="submit" disabled={submitting || !value.trim()}>
          Sugerir
        </PrimaryButton>
      </form>
    </SurfaceCard>
  );
}
