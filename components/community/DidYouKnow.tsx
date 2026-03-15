"use client";

import { useState, useEffect } from "react";
import { Lightbulb, ThumbsUp, Heart, Star } from "lucide-react";

interface InsightItem {
  id: string;
  userName: string;
  text: string;
  institution: string | null;
  likes: number;
  loves: number;
  isHighlighted: boolean;
}

interface DidYouKnowProps {
  moduleId: string;
  isAdmin?: boolean;
}

export function DidYouKnow({ moduleId, isAdmin }: DidYouKnowProps) {
  const [items, setItems] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [institution, setInstitution] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!moduleId) return;
    fetch(`/api/module/${moduleId}/insights`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [moduleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim().slice(0, 300);
    if (!t || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/module/${moduleId}/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: t, institution: institution.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setItems((prev) => [data, ...prev]);
      setText("");
      setInstitution("");
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleReact = async (itemId: string, reaction: "like" | "love", delta: 1 | -1) => {
    try {
      await fetch(`/api/module/${moduleId}/insights/${itemId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reaction, delta }),
      });
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== itemId) return i;
          return { ...i, likes: i.likes + (reaction === "like" ? delta : 0), loves: i.loves + (reaction === "love" ? delta : 0) };
        })
      );
    } catch {
      // ignore
    }
  };

  const handleHighlight = async (itemId: string, highlighted: boolean) => {
    try {
      await fetch(`/api/module/${moduleId}/insights/${itemId}/highlight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ highlighted }),
      });
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, isHighlighted: highlighted } : i)));
    } catch {
      // ignore
    }
  };

  return (
    <section className="mt-8 pt-6 border-t border-[var(--line)]" aria-label="Lo que el grupo está descubriendo">
      <h2 className="text-lg font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500" aria-hidden />
        Lo que el grupo está descubriendo
      </h2>
      <p className="text-sm text-[var(--ink-muted)] mb-4">
        Comparte en pocas palabras cómo lo hacen en tu institución (máx. 300 caracteres).
      </p>

      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 300))}
          placeholder="En mi institución hacemos..."
          rows={2}
          maxLength={300}
          className="w-full px-4 py-3 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm resize-none"
          disabled={submitting}
        />
        <input
          type="text"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="Institución (opcional)"
          className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm"
          disabled={submitting}
        />
        <button type="submit" disabled={submitting || !text.trim()} className="btn-primary text-sm disabled:opacity-50">
          Compartir
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-[var(--ink-muted)]">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)]">Nadie ha compartido aún. ¡Sé el primero!</p>
      ) : (
        <ul className="space-y-3 list-none">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-xl border p-4 ${item.isHighlighted ? "border-amber-300 bg-amber-50/50" : "border-[var(--line)] bg-white"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[var(--ink)]">{item.text}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-[var(--ink-muted)]">{item.userName}</span>
                    {item.institution && (
                      <span className="text-xs text-[var(--ink-muted)]">· {item.institution}</span>
                    )}
                    {item.isHighlighted && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3" /> Destacado
                      </span>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleHighlight(item.id, !item.isHighlighted)}
                    className="shrink-0 p-1.5 rounded-lg text-[var(--ink-muted)] hover:bg-[var(--cream)]"
                    title={item.isHighlighted ? "Quitar destacado" : "Destacar"}
                  >
                    <Star className={`w-4 h-4 ${item.isHighlighted ? "fill-amber-500 text-amber-500" : ""}`} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => handleReact(item.id, "like", 1)}
                  className="flex items-center gap-1 text-sm text-[var(--ink-muted)] hover:text-[var(--primary)]"
                >
                  <ThumbsUp className="w-4 h-4" /> {item.likes}
                </button>
                <button
                  type="button"
                  onClick={() => handleReact(item.id, "love", 1)}
                  className="flex items-center gap-1 text-sm text-[var(--ink-muted)] hover:text-red-500"
                >
                  <Heart className="w-4 h-4" /> {item.loves}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
