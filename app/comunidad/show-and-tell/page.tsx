"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { ShowTellPost } from "@/components/community/ShowTellPost";
import { ChevronLeft, Video, FileText } from "lucide-react";

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

export default function ShowAndTellPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cohortId, setCohortId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "create">("view");
  const [type, setType] = useState<"video" | "text">("text");
  const [videoUrl, setVideoUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/show-tell/posts", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.posts ?? []);
        setCohortId(d.cohortId ?? null);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setRole(d.role ?? null))
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (type === "video" && !videoUrl.trim()) return;
    if (type === "text" && !textContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/show-tell/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          type === "video" ? { type: "video", videoUrl: videoUrl.trim() } : { type: "text", textContent: textContent.trim().slice(0, 400) }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setPosts((prev) => [data, ...prev]);
      setMode("view");
      setVideoUrl("");
      setTextContent("");
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl w-full space-y-6">
      <nav className="text-sm text-[var(--ink-muted)]" aria-label="Breadcrumb">
        <Link href="/inicio" className="hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded">
          Inicio
        </Link>
        {" · "}
        <span className="text-[var(--ink)] font-medium">Show & Tell</span>
      </nav>

      <div className="flex items-center gap-4">
        <Link
          href="/inicio"
          className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden />
          Volver
        </Link>
      </div>

      <SurfaceCard padding="lg" clickable={false}>
        <h1 className="text-xl font-semibold text-[var(--ink)] mb-2">Show & Tell</h1>
        <p className="text-sm text-[var(--ink-muted)] mb-4">
          Espacio semanal para compartir cómo aplicaste lo aprendido. Sube un video de 2 min (Loom) o escribe un texto breve (máx. 400 caracteres).
        </p>

        {!loading && cohortId && (
          <button
            type="button"
            onClick={() => setMode(mode === "create" ? "view" : "create")}
            className="btn-primary text-sm mb-4"
          >
            {mode === "create" ? "Cancelar" : "Compartir mi experiencia"}
          </button>
        )}

        {mode === "create" && (
          <form onSubmit={handleCreate} className="mb-6 p-4 rounded-xl border border-[var(--line)] bg-[var(--cream)]/20 space-y-3">
            <div className="flex gap-2">
              <button type="button" onClick={() => setType("text")} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${type === "text" ? "bg-[var(--primary)] text-white" : "bg-white border border-[var(--line)]"}`}>
                <FileText className="w-4 h-4" /> Texto
              </button>
              <button type="button" onClick={() => setType("video")} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${type === "video" ? "bg-[var(--primary)] text-white" : "bg-white border border-[var(--line)]"}`}>
                <Video className="w-4 h-4" /> Video (Loom)
              </button>
            </div>
            {type === "video" && (
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="URL del video Loom"
                className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-sm"
              />
            )}
            {type === "text" && (
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value.slice(0, 400))}
                placeholder="Cuenta en pocas palabras cómo lo aplicaste..."
                rows={4}
                maxLength={400}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-sm resize-none"
              />
            )}
            <button type="submit" disabled={submitting || (type === "video" ? !videoUrl.trim() : !textContent.trim())} className="btn-primary text-sm disabled:opacity-50">
              Publicar
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-[var(--ink-muted)]">Cargando…</p>
        ) : posts.length === 0 ? (
          <p className="text-[var(--ink-muted)]">Aún no hay publicaciones. ¡Sé el primero en compartir!</p>
        ) : (
          <ul className="space-y-4 list-none">
            {posts.map((post) => (
              <li key={post.id}>
                <ShowTellPost
                  post={post}
                  cohortId={cohortId}
                  isAdmin={role === "admin"}
                  onHighlight={() => {
                    fetch("/api/show-tell/posts", { credentials: "include" })
                      .then((r) => r.json())
                      .then((d) => setPosts(d.posts ?? []));
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </SurfaceCard>
    </div>
  );
}
