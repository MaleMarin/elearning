"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, ThumbsUp, ChevronDown, ChevronUp, Send, Award, Bell } from "lucide-react";

interface Post {
  id: string;
  userId: string;
  userName: string;
  question: string;
  createdAt: string;
  votes: number;
}

interface Answer {
  id: string;
  userId: string;
  userName: string;
  answer: string;
  isOfficial: boolean;
  createdAt: string;
  votes: number;
}

interface LessonQAProps {
  lessonId: string;
  /** Si el usuario es tutor o admin (puede marcar respuesta oficial). */
  canMarkOfficial?: boolean;
}

export function LessonQA({ lessonId, canMarkOfficial: canMarkOfficialProp }: LessonQAProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [order, setOrder] = useState<"recent" | "votes">("recent");
  const [loading, setLoading] = useState(true);
  const [canMarkOfficial, setCanMarkOfficial] = useState(!!canMarkOfficialProp);

  useEffect(() => {
    if (canMarkOfficialProp !== undefined) return;
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCanMarkOfficial(d.role === "admin" || d.role === "mentor"))
      .catch(() => {});
  }, [canMarkOfficialProp]);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [answersByPost, setAnswersByPost] = useState<Record<string, Answer[]>>({});
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswerByPost, setNewAnswerByPost] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [unreadAnswers, setUnreadAnswers] = useState(0);

  useEffect(() => {
    if (!lessonId) return;
    fetch(`/api/notifications?lessonId=${encodeURIComponent(lessonId)}&unreadOnly=true`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUnreadAnswers((d.notifications ?? []).length))
      .catch(() => setUnreadAnswers(0));
  }, [lessonId]);

  const markNotificationsRead = useCallback(() => {
    fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ lessonId }),
    }).then(() => setUnreadAnswers(0));
  }, [lessonId]);

  const fetchPosts = useCallback(() => {
    if (!lessonId) return;
    setLoading(true);
    fetch(`/api/lesson/${lessonId}/questions?order=${order}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [lessonId, order]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!expandedPostId) return;
    fetch(`/api/lesson/${lessonId}/questions/${expandedPostId}/answers`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setAnswersByPost((prev) => ({ ...prev, [expandedPostId]: d.answers ?? [] })))
      .catch(() => {});
  }, [lessonId, expandedPostId]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lesson/${lessonId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: newQuestion.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setPosts((prev) => [data, ...prev]);
      setNewQuestion("");
    } catch {
      // show error in UI if needed
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (postId: string) => {
    const answer = (newAnswerByPost[postId] ?? "").trim();
    if (!answer || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lesson/${lessonId}/questions/${postId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setAnswersByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), data],
      }));
      setNewAnswerByPost((prev) => ({ ...prev, [postId]: "" }));
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleVotePost = async (postId: string, delta: 1 | -1) => {
    try {
      await fetch(`/api/lesson/${lessonId}/questions/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ delta }),
      });
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, votes: p.votes + delta } : p)));
    } catch {
      // ignore
    }
  };

  const handleVoteAnswer = async (postId: string, answerId: string, delta: 1 | -1) => {
    try {
      await fetch(`/api/lesson/${lessonId}/questions/${postId}/answers/${answerId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ delta }),
      });
      setAnswersByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? []).map((a) => (a.id === answerId ? { ...a, votes: a.votes + delta } : a)),
      }));
    } catch {
      // ignore
    }
  };

  const handleSetOfficial = async (postId: string, answerId: string, isOfficial: boolean) => {
    try {
      await fetch(`/api/lesson/${lessonId}/questions/${postId}/official`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answerId, isOfficial }),
      });
      setAnswersByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? []).map((a) => ({ ...a, isOfficial: a.id === answerId ? isOfficial : false })),
      }));
    } catch {
      // ignore
    }
  };

  const formatDate = (s: string) => {
    try {
      const d = new Date(s);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      if (diff < 60000) return "Ahora";
      if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
      if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
      return d.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  return (
    <section className="mt-8 pt-6 border-t border-[var(--line)]" aria-label="Preguntas de la comunidad">
      <h2 className="text-lg font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-[var(--primary)]" aria-hidden />
        Preguntas de la comunidad
      </h2>

      {unreadAnswers > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-3">
          <p className="text-sm text-[var(--ink)] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[var(--primary)]" />
            {unreadAnswers === 1
              ? "Tienes 1 nueva respuesta en tus preguntas."
              : `Tienes ${unreadAnswers} nuevas respuestas en tus preguntas.`}
          </p>
          <button type="button" onClick={markNotificationsRead} className="text-sm font-medium text-[var(--primary)] hover:underline">
            Marcar como leídas
          </button>
        </div>
      )}

      <form onSubmit={handleAsk} className="mb-4">
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Escribe tu pregunta sobre esta lección..."
          rows={2}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)] text-sm resize-none"
          disabled={submitting}
        />
        <button type="submit" disabled={submitting || !newQuestion.trim()} className="btn-primary text-sm mt-2 disabled:opacity-50">
          Publicar pregunta
        </button>
      </form>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-[var(--ink-muted)]">Ordenar por:</span>
        <button
          type="button"
          onClick={() => setOrder("recent")}
          className={`px-2 py-1 rounded-lg text-sm ${order === "recent" ? "bg-[var(--primary)] text-white" : "bg-[var(--cream)] text-[var(--ink)]"}`}
        >
          Más reciente
        </button>
        <button
          type="button"
          onClick={() => setOrder("votes")}
          className={`px-2 py-1 rounded-lg text-sm ${order === "votes" ? "bg-[var(--primary)] text-white" : "bg-[var(--cream)] text-[var(--ink)]"}`}
        >
          Más votada
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--ink-muted)]">Cargando…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)]">Aún no hay preguntas. Sé el primero en preguntar.</p>
      ) : (
        <ul className="space-y-3 list-none">
          {posts.map((post) => (
            <li key={post.id} className="rounded-xl border border-[var(--line)] bg-white overflow-hidden">
              <div className="p-4">
                <p className="text-[var(--ink)] font-medium">{post.question}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-[var(--ink-muted)]">
                  <span>{post.userName}</span>
                  <span>{formatDate(post.createdAt)}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => handleVotePost(post.id, 1)} className="p-0.5 rounded hover:bg-[var(--cream)]" aria-label="Votar a favor">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <span>{post.votes}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                  className="mt-2 text-sm text-[var(--primary)] font-medium flex items-center gap-1"
                >
                  {(answersByPost[post.id] ?? []).length} respuestas
                  {expandedPostId === post.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              {expandedPostId === post.id && (
                <div className="border-t border-[var(--line)] bg-[var(--cream)]/20 p-4 space-y-3">
                  {(answersByPost[post.id] ?? []).map((a) => (
                    <div key={a.id} className="flex gap-2">
                      <div className={`flex-1 rounded-lg p-3 ${a.isOfficial ? "bg-amber-50 border border-amber-200" : "bg-white border border-[var(--line)]"}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-[var(--ink)]">{a.userName}</span>
                          {a.isOfficial && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                              <Award className="w-3 h-3" /> Respuesta oficial
                            </span>
                          )}
                          {canMarkOfficial && (
                            <button
                              type="button"
                              onClick={() => handleSetOfficial(post.id, a.id, !a.isOfficial)}
                              className="text-xs text-[var(--primary)] hover:underline"
                            >
                              {a.isOfficial ? "Quitar oficial" : "Marcar oficial"}
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-[var(--ink)] mt-1">{a.answer}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-[var(--ink-muted)]">
                          <button type="button" onClick={() => handleVoteAnswer(post.id, a.id, 1)} className="flex items-center gap-0.5 hover:text-[var(--primary)]">
                            <ThumbsUp className="w-3 h-3" /> {a.votes}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAnswerByPost[post.id] ?? ""}
                      onChange={(e) => setNewAnswerByPost((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Escribe una respuesta..."
                      className="flex-1 px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleReply(post.id))}
                    />
                    <button type="button" onClick={() => handleReply(post.id)} disabled={submitting || !(newAnswerByPost[post.id] ?? "").trim()} className="btn-primary text-sm flex items-center gap-1 disabled:opacity-50">
                      <Send className="w-4 h-4" /> Responder
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
