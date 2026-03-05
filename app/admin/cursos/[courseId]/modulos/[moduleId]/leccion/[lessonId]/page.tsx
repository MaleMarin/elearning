"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { ChevronLeft } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  video_embed_url: string | null;
  estimated_minutes: number | null;
  order_index: number;
  status: string;
};

export default function AdminLeccionEditPage() {
  const params = useParams();
  const lessonId = String(params?.lessonId ?? "");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [videoEmbedUrl, setVideoEmbedUrl] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    fetch(`/api/admin/lessons/${lessonId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.lesson) {
          setLesson(data.lesson);
          setTitle(data.lesson.title);
          setSummary(data.lesson.summary ?? "");
          setContent(data.lesson.content ?? "");
          setVideoEmbedUrl(data.lesson.video_embed_url ?? "");
          setEstimatedMinutes(
            data.lesson.estimated_minutes != null ? String(data.lesson.estimated_minutes) : ""
          );
          setStatus(data.lesson.status);
        }
      })
      .catch(() => setError("Error al cargar"))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          content: content.trim() || "",
          video_embed_url: videoEmbedUrl.trim() || null,
          estimated_minutes:
            estimatedMinutes === "" ? null : Math.max(0, parseInt(estimatedMinutes, 10)),
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      setLesson(data.lesson);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !lesson) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center">
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      </div>
    );
  }

  const courseId = params?.courseId;
  const moduleId = params?.moduleId;

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/admin/cursos/${courseId}/modulos/${moduleId}`}
            className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Módulo
          </Link>
        </div>

        {error && <Alert message={error} variant="error" className="mb-4" />}

        <SurfaceCard padding="lg" clickable={false}>
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Editar lección</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Resumen</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
                placeholder="Breve descripción de la lección"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Contenido (Markdown)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)] font-mono text-sm"
                placeholder="Contenido en texto o Markdown..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                URL del video (embed)
              </label>
              <input
                type="url"
                value={videoEmbedUrl}
                onChange={(e) => setVideoEmbedUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Minutos estimados
              </label>
              <input
                type="number"
                min={0}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="w-24 px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
            <div className="flex gap-3">
              <PrimaryButton type="submit" disabled={saving}>
                Guardar lección
              </PrimaryButton>
              <SecondaryButton
                type="button"
                href={`/admin/cursos/${courseId}/modulos/${moduleId}`}
              >
                Volver al módulo
              </SecondaryButton>
            </div>
          </form>
        </SurfaceCard>
      </div>
    </div>
  );
}
