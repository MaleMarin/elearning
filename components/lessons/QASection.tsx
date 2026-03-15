"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, ChevronDown, ChevronUp, Send, ThumbsUp, CheckCircle, Award } from "lucide-react";
import { SurfaceCard, PrimaryButton, SecondaryButton, Badge } from "@/components/ui";

const AZUL_ACTIVO = "#1428d4";
const VERDE_RESUELTO = "#00e5a0";

interface QuestionPost {
  id: string;
  userId: string;
  userName: string;
  question: string;
  createdAt: string;
  votes: number;
  votadoPor?: string[];
  resuelta?: boolean;
}

interface QuestionAnswer {
  id: string;
  userId: string;
  userName: string;
  answer: string;
  isOfficial: boolean;
  createdAt: string;
  votes: number;
}

interface QASectionProps {
  lessonId: string;
  /** userId actual para votos y "marcar resuelta" */
  userId?: string;
  /** Si es admin o autor puede marcar resuelta */
  canMarkResolved?: (post: QuestionPost) => boolean;
  /** Si es admin o mentor puede marcar respuesta oficial */
  canMarkOfficial?: boolean;
}

export function QASection({ lessonId, userId, canMarkResolved: canMarkResolvedProp, canMarkOfficial: canMarkOfficialProp }: QASectionProps) {
  const [posts, setPosts] = useState<QuestionPost[]>([]);
  const [order, setOrder] = useState<"votes" | "recent">("votes");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answersByPost, setAnswersByPost] = useState<Record<string, QuestionAnswer[]>>({});
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswerByPost, setNewAnswerByPost] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resolveLoadingId, setResolveLoadingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId);
  const [userRole, setUserRole] = useState<string>("student");
  const [canMarkOfficial, setCanMarkOfficial] = useState(!!canMarkOfficialProp);

  useEffect(() => {
    if (userId !== undefined) setCurrentUserId(userId);
    else {
      fetch("/api/auth/me", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((me: { uid?: string; role?: string } | null) => {
          if (me?.uid) setCurrentUserId(me.uid);
          if (me?.role) setUserRole(me.role);
        })
        .catch(() => {});
    }
  }, [userId]);
  useEffect(() => {
    if (canMarkOfficialProp !== undefined) setCanMarkOfficial(canMarkOfficialProp);
    else setCanMarkOfficial(userRole === "admin" || userRole === "mentor");
  }, [canMarkOfficialProp, userRole]);

  const fetchPosts = useCallback(() => {
    if (!lessonId) return;
    setLoading(true);
    fetch(`/api/lesson/${lessonId}/questions?order=${order}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPosts((d.posts ?? []).map((p: QuestionPost) => ({ ...p, votadoPor: p.votadoPor ?? [], resuelta: p.resuelta ?? false }))))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [lessonId, order]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!expandedId) return;
    fetch(`/api/lesson/${lessonId}/questions/${expandedId}/answers`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setAnswersByPost((prev) => ({ ...prev, [expandedId]: d.answers ?? [] })))
      .catch(() => {});
  }, [lessonId, expandedId]);

  const canMarkResolved = useCallback(
    (post: QuestionPost) => {
      if (canMarkResolvedProp) return canMarkResolvedProp(post);
      return currentUserId === post.userId || userRole === "admin";
    },
    [canMarkResolvedProp, currentUserId, userRole]
  );

  const hasVoted = useCallback(
    (post: QuestionPost) => {
      if (!currentUserId) return false;
      return (post.votadoPor ?? []).includes(currentUserId);
    },
    [currentUserId]
  );

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = newQuestion.trim();
    if (q.length < 20 || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lesson/${lessonId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setPosts((prev) => [{ ...data, votadoPor: [], resuelta: false }, ...prev]);
      setNewQuestion("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo publicar");
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
      setAnswersByPost((prev) => ({ ...prev, [postId]: [...(prev[postId] ?? []), data] }));
      setNewAnswerByPost((prev) => ({ ...prev, [postId]: "" }));
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (post: QuestionPost) => {
    if (!currentUserId) return;
    const voted = hasVoted(post);
    const delta = voted ? -1 : 1;
    try {
      const res = await fetch(`/api/lesson/${lessonId}/questions/${post.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ delta }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== post.id) return p;
          const newVoted = data.voted ?? !voted;
          const newVotes = p.votes + (newVoted ? 1 : -1);
          const newVotadoPor = newVoted ? [...(p.votadoPor ?? []), currentUserId] : (p.votadoPor ?? []).filter((id) => id !== currentUserId);
          return { ...p, votes: Math.max(0, newVotes), votadoPor: newVotadoPor };
        })
      );
    } catch {
      // ignore
    }
  };

  const handleSetOfficial = async (postId: string, answerId: string, isOfficial: boolean) => {
    try {
      const res = await fetch(`/api/lesson/${lessonId}/questions/${postId}/official`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answerId, isOfficial }),
      });
      if (!res.ok) return;
      setAnswersByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? []).map((a) => ({ ...a, isOfficial: a.id === answerId ? isOfficial : false })),
      }));
    } catch {
      // ignore
    }
  };

  const handleResolve = async (post: QuestionPost) => {
    if (!canMarkResolved(post) || resolveLoadingId) return;
    setResolveLoadingId(post.id);
    try {
      const res = await fetch(`/api/lesson/${lessonId}/questions/${post.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ resolved: !post.resuelta }),
      });
      if (!res.ok) return;
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, resuelta: !p.resuelta } : p)));
    } catch {
      // ignore
    } finally {
      setResolveLoadingId(null);
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
      return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  return (
    <section className="mt-8 pt-6 border-t border-[var(--line-subtle)]" aria-label="Preguntas de la lección">
      <h2 className="text-lg font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" style={{ color: AZUL_ACTIVO }} aria-hidden />
        Preguntas
      </h2>

      <form onSubmit={handleAsk} className="mb-6">
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Escribe tu pregunta sobre esta lección (mínimo 20 caracteres)..."
          rows={2}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl bg-[var(--neu-bg)] text-[var(--ink)] text-sm resize-none shadow-[var(--neu-shadow-in)] border-none outline-none focus:shadow-[var(--neu-shadow-in)],0_0_0_2px_rgba(0,229,160,0.3)"
          disabled={submitting}
        />
        {newQuestion.trim().length > 0 && newQuestion.trim().length < 20 && (
          <p className="text-xs text-[var(--ink-muted)] mt-1">Faltan {20 - newQuestion.trim().length} caracteres.</p>
        )}
        <PrimaryButton type="submit" disabled={submitting || newQuestion.trim().length < 20} className="mt-2">
          Publicar pregunta
        </PrimaryButton>
      </form>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-[var(--ink-muted)]">Ordenar por:</span>
        <button
          type="button"
          onClick={() => setOrder("votes")}
          className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: order === "votes" ? AZUL_ACTIVO : "var(--neu-bg)",
            color: order === "votes" ? "#fff" : "var(--ink)",
            boxShadow: order === "votes" ? undefined : "var(--neu-shadow-in-sm)",
          }}
        >
          Más votada
        </button>
        <button
          type="button"
          onClick={() => setOrder("recent")}
          className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: order === "recent" ? AZUL_ACTIVO : "var(--neu-bg)",
            color: order === "recent" ? "#fff" : "var(--ink)",
            boxShadow: order === "recent" ? undefined : "var(--neu-shadow-in-sm)",
          }}
        >
          Más reciente
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--ink-muted)]">Cargando…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)]">Aún no hay preguntas. Sé el primero en preguntar.</p>
      ) : (
        <ul className="space-y-3 list-none">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-2xl bg-[var(--neu-bg)] overflow-hidden shadow-[var(--neu-shadow-out-sm)] transition-shadow hover:shadow-[var(--neu-glow)]"
            >
              <div className="p-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleVote(post)}
                      disabled={!currentUserId}
                      className="p-1.5 rounded-xl hover:bg-white/50 transition-colors disabled:opacity-50"
                      style={{ color: hasVoted(post) ? AZUL_ACTIVO : "var(--ink-muted)" }}
                      aria-label={hasVoted(post) ? "Quitar voto" : "Votar a favor"}
                    >
                      <ThumbsUp className="w-5 h-5" fill={hasVoted(post) ? "currentColor" : "none"} />
                    </button>
                    <span className="text-sm font-semibold text-[var(--ink)]">{post.votes}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {post.resuelta && (
                        <Badge variant="completado" className="bg-[rgba(0,229,160,0.12)] text-[var(--acento-dark)] border border-[rgba(0,229,160,0.3)]">
                          <CheckCircle className="w-3 h-3 inline mr-0.5" />
                          Resuelta
                        </Badge>
                      )}
                      <span className="text-sm text-[var(--ink-muted)]">{post.userName}</span>
                      <span className="text-xs text-[var(--ink-muted)]">{formatDate(post.createdAt)}</span>
                    </div>
                    <p className="text-[var(--ink)] font-medium mt-1">{post.question}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                        className="text-sm font-medium flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-white/50 transition-colors"
                        style={{ color: AZUL_ACTIVO }}
                      >
                        {(answersByPost[post.id] ?? []).length} respuestas
                        {expandedId === post.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {canMarkResolved(post) && (
                        <button
                          type="button"
                          onClick={() => handleResolve(post)}
                          disabled={!!resolveLoadingId}
                          className="text-sm font-medium rounded-lg px-2 py-1 hover:bg-white/50 transition-colors disabled:opacity-50"
                          style={{ color: VERDE_RESUELTO }}
                        >
                          {resolveLoadingId === post.id ? "…" : post.resuelta ? "Marcar no resuelta" : "Marcar como resuelta"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {expandedId === post.id && (
                <div className="border-t border-[var(--line-subtle)] bg-[var(--neu-bg)] p-4 space-y-3" style={{ boxShadow: "var(--neu-shadow-in-sm)" }}>
                  {(answersByPost[post.id] ?? []).map((a) => (
                    <div key={a.id} className="flex gap-2">
                      <div
                        className={`flex-1 rounded-xl p-3 ${
                          a.isOfficial ? "bg-[rgba(0,229,160,0.12)] border border-[rgba(0,229,160,0.3)]" : "bg-[var(--neu-bg)] shadow-[var(--neu-shadow-in-sm)]"
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-[var(--ink)]">{a.userName}</span>
                          {a.isOfficial && (
                            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: "rgba(0,229,160,0.2)", color: "var(--acento-dark)" }}>
                              <Award className="w-3 h-3" /> Respuesta oficial
                            </span>
                          )}
                          {canMarkOfficial && (
                            <button
                              type="button"
                              onClick={() => handleSetOfficial(post.id, a.id, !a.isOfficial)}
                              className="text-xs font-medium rounded-lg px-2 py-0.5 hover:bg-white/50 transition-colors"
                              style={{ color: AZUL_ACTIVO }}
                            >
                              {a.isOfficial ? "Quitar oficial" : "Marcar oficial"}
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-[var(--ink)] mt-1">{a.answer}</p>
                        <span className="text-xs text-[var(--ink-muted)] mt-1 block">{formatDate(a.createdAt)} · {a.votes} votos</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newAnswerByPost[post.id] ?? ""}
                      onChange={(e) => setNewAnswerByPost((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Escribe una respuesta..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[var(--neu-bg)] border-none shadow-[var(--neu-shadow-in)] text-[var(--ink)] text-sm outline-none focus:shadow-[var(--neu-shadow-in)],0_0_0_2px_rgba(0,229,160,0.3)"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleReply(post.id))}
                    />
                    <PrimaryButton type="button" onClick={() => handleReply(post.id)} disabled={submitting || !(newAnswerByPost[post.id] ?? "").trim()} className="shrink-0">
                      <Send className="w-4 h-4" />
                    </PrimaryButton>
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
