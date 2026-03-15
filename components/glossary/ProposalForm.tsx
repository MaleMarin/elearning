"use client";

import { useState } from "react";

interface ProposalFormProps {
  courseId: string;
  termId: string;
  onSubmitted?: () => void;
}

export function ProposalForm({ courseId, termId, onSubmitted }: ProposalFormProps) {
  const [definition, setDefinition] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!definition.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/glossary/${courseId}/terms/${termId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ definition: definition.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      setDefinition("");
      onSubmitted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="block text-sm font-medium text-[var(--ink)]">
        Proponer una definición
      </label>
      <textarea
        value={definition}
        onChange={(e) => setDefinition(e.target.value)}
        placeholder="Escribe tu definición del término..."
        rows={3}
        className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm"
        disabled={submitting}
      />
      {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !definition.trim()}
        className="btn-primary text-sm disabled:opacity-50"
      >
        {submitting ? "Enviando…" : "Enviar propuesta"}
      </button>
    </form>
  );
}
