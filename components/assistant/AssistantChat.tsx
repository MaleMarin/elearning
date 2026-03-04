"use client";

import { useState, useEffect, useRef } from "react";
import type { AssistantMode } from "@/lib/types/database";
import type { LessonContext } from "@/lib/types/database";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

interface AssistantChatProps {
  mode: AssistantMode;
  lessonContext: LessonContext | null;
  cohortId?: string | null;
  courseId?: string | null;
  onClose?: () => void;
}

export function AssistantChat({
  mode,
  lessonContext,
  cohortId,
  courseId,
}: AssistantChatProps) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    setLoading(true);

    const userMessage: Message = {
      id: "temp-" + Date.now(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          threadId: threadId ?? undefined,
          message: text,
          context: lessonContext ?? undefined,
          cohortId: cohortId ?? undefined,
          courseId: courseId ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      if (data.threadId) setThreadId(data.threadId);
      setMessages((prev) => [
        ...prev,
        {
          id: "assistant-" + Date.now(),
          role: "assistant",
          content: data.message,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar");
    } finally {
      setLoading(false);
    }
  };

  const displayMessages = messages.filter((m) => m.role !== "system");

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 && (
          <p className="text-[var(--text-muted)] text-center py-4">
            {mode === "tutor" && "Pregunta algo sobre la lección. ¿Quieres un mini-quiz?"}
            {mode === "support" && "Cuéntame en qué necesitas ayuda. Revisa el FAQ o abre un ticket."}
            {mode === "community" && "Pregunta sobre la comunidad, moderación o dinamización."}
          </p>
        )}
        {displayMessages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-[var(--accent)] text-white"
                  : "card-white"
              }`}
            >
              <p className="whitespace-pre-wrap text-base">{m.content}</p>
            </div>
          </div>
        ))}
        {error && (
          <p className="text-[var(--error)] text-sm" role="alert">
            {error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-cream-dark bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-[var(--text)] text-base min-h-[48px] focus:outline focus:ring-2 focus:ring-[var(--accent)]"
            disabled={loading}
            aria-label="Mensaje"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? "…" : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}
