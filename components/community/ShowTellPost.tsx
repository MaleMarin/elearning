"use client";

import { useState, useEffect } from "react";
import { Video, FileText, MessageCircle, Send, Star } from "lucide-react";

interface Post {
  id: string;
  userName: string;
  type: "video" | "text";
  videoUrl?: string | null;
  textContent?: string | null;
  weekLabel: string;
  createdAt: string;
  isHighlighted: boolean;
}

interface Comment {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
}

interface ShowTellPostProps {
  post: Post;
  cohortId: string | null;
  isAdmin?: boolean;
  onHighlight?: () => void;
}

function embedLoomUrl(url: string): string {
  const u = url.trim();
  const match = u.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (match) return `https://www.loom.com/embed/${match[1]}`;
  return u;
}

export function ShowTellPost({ post, cohortId, isAdmin, onHighlight }: ShowTellPostProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || !post.id) return;
    setLoading(true);
    fetch(`/api/show-tell/posts/${post.id}/comments`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [open, post.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = commentText.trim().slice(0, 200);
    if (!t || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/show-tell/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: t }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setComments((prev) => [...prev, data]);
      setCommentText("");
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleHighlight = async () => {
    if (!cohortId) return;
    try {
      await fetch(`/api/show-tell/posts/${post.id}/highlight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cohortId, highlighted: !post.isHighlighted }),
      });
      onHighlight?.();
    } catch {
      // ignore
    }
  };

  const dateStr = (() => {
    try {
      return new Date(post.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "";
    }
  })();

  return (
    <article className={`rounded-xl border p-4 ${post.isHighlighted ? "border-amber-300 bg-amber-50/30" : "border-[var(--line)] bg-white"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-[var(--ink)]">{post.userName}</span>
            <span className="text-xs text-[var(--ink-muted)]">{post.weekLabel}</span>
            <span className="text-xs text-[var(--ink-muted)]">{dateStr}</span>
            {post.isHighlighted && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                <Star className="w-3 h-3 fill-current" /> Destacado
              </span>
            )}
          </div>
          {post.type === "video" && post.videoUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-[var(--line)] aspect-video bg-[var(--ink)]">
              <iframe
                src={embedLoomUrl(post.videoUrl)}
                title="Show & Tell"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}
          {post.type === "text" && post.textContent && (
            <p className="mt-2 text-[var(--ink)] flex items-start gap-2">
              <FileText className="w-4 h-4 shrink-0 text-[var(--ink-muted)] mt-0.5" />
              {post.textContent}
            </p>
          )}
        </div>
        {isAdmin && cohortId && (
          <button
            type="button"
            onClick={handleHighlight}
            className="shrink-0 p-1.5 rounded-lg text-[var(--ink-muted)] hover:bg-[var(--cream)]"
            title={post.isHighlighted ? "Quitar destacado" : "Destacar"}
            aria-label={post.isHighlighted ? "Quitar destacado" : "Destacar publicación"}
          >
            <Star className={`w-4 h-4 ${post.isHighlighted ? "fill-amber-500 text-amber-500" : ""}`} aria-hidden />
          </button>
        )}
      </div>
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-sm text-[var(--primary)] font-medium flex items-center gap-1"
        >
          <MessageCircle className="w-4 h-4" />
          {comments.length} comentarios
        </button>
      </div>
      {open && (
        <div className="mt-4 pt-4 border-t border-[var(--line)] space-y-3">
          {loading ? (
            <p className="text-sm text-[var(--ink-muted)]">Cargando…</p>
          ) : (
            <ul className="space-y-2 list-none">
              {comments.map((c) => (
                <li key={c.id} className="text-sm pl-3 border-l-2 border-[var(--line)]">
                  <span className="font-medium text-[var(--ink)]">{c.userName}</span>
                  <span className="text-[var(--ink-muted)]">: {c.text}</span>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value.slice(0, 200))}
              placeholder="Comentario (máx. 200 caracteres)"
              maxLength={200}
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm"
              disabled={submitting}
            />
            <button type="submit" disabled={submitting || !commentText.trim()} className="btn-primary text-sm flex items-center gap-1 disabled:opacity-50">
              <Send className="w-4 h-4" /> Enviar
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
