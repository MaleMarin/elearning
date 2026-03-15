"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

interface PairChatProps {
  pairId: string;
  currentUserId: string;
  pollIntervalMs?: number;
}

export function PairChat({ pairId, currentUserId, pollIntervalMs = 30000 }: PairChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/learning-pairs/${pairId}/messages`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.messages)) setMessages(data.messages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [pairId]);

  useEffect(() => {
    if (!pairId) return;
    const t = setInterval(fetchMessages, pollIntervalMs);
    return () => clearInterval(t);
  }, [pairId, pollIntervalMs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/learning-pairs/${pairId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setMessages((prev) => [...prev, { ...data, id: data.id ?? "" }]);
      setText("");
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--line)]">
        <MessageCircle className="w-4 h-4 text-[var(--primary)]" />
        <h3 className="font-semibold text-[var(--ink)]">Chat con tu colega</h3>
      </div>
      <div className="flex-1 min-h-[200px] max-h-[320px] overflow-y-auto p-4 space-y-2">
        {loading ? (
          <p className="text-sm text-[var(--ink-muted)]">Cargando mensajes…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-[var(--ink-muted)]">Aún no hay mensajes.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`text-sm max-w-[85%] ${m.userId === currentUserId ? "ml-auto text-right" : ""}`}>
              <span className="font-medium text-[var(--ink)]">{m.userName}</span>
              <span className="text-[var(--ink-muted)] text-xs ml-1">{formatTime(m.createdAt)}</span>
              <p className="mt-0.5 text-[var(--ink)] break-words">{m.text}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--line)] flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 2000))}
          placeholder="Escribe un mensaje…"
          className="flex-1 px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm"
          disabled={submitting}
        />
        <button type="submit" disabled={submitting || !text.trim()} className="btn-primary text-sm flex items-center gap-1 disabled:opacity-50">
          <Send className="w-4 h-4" /> Enviar
        </button>
      </form>
    </div>
  );
}
