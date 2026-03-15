"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { H5PUploader } from "@/components/admin/H5PUploader";
import { LessonEditor } from "@/components/admin/LessonEditor";
import type { LessonBlock } from "@/lib/services/lessonBlocks";
import { ChevronLeft } from "lucide-react";

type LessonCompetencia = { id: string; nivel: string };
type Lesson = {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  video_embed_url: string | null;
  estimated_minutes: number | null;
  order_index: number;
  status: string;
  h5p_content_id?: string | null;
  blocks?: LessonBlock[];
  competencias?: LessonCompetencia[];
};

type CompetenciaOption = { id: string; nombre: string };

type H5PItem = { id: string; title: string; contentType: string; updatedAt?: string };

export default function AdminLeccionEditPage() {
  const params = useParams();
  const courseId = String(params?.courseId ?? "");
  const moduleId = String(params?.moduleId ?? "");
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
  const [h5pContentId, setH5pContentId] = useState<string | null>(null);
  const [h5pList, setH5pList] = useState<H5PItem[]>([]);
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [useBlocks, setUseBlocks] = useState(false);
  const [competencias, setCompetencias] = useState<LessonCompetencia[]>([]);
  const [competenciasCatalog, setCompetenciasCatalog] = useState<CompetenciaOption[]>([]);
  const [otherEditor, setOtherEditor] = useState<{ userName: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((me: { uid?: string } | null) => { if (me?.uid) setCurrentUserId(me.uid); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!courseId || !lessonId) return;
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((me: { uid?: string; role?: string; email?: string } | null) => {
        const name = me?.email?.split("@")[0] ?? "Editor";
        return fetch(`/api/admin/courses/${courseId}/editing-lock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ lessonId, userName: name }),
        });
      })
      .then(() => {})
      .catch(() => {});
    const release = () => {
      fetch(`/api/admin/courses/${courseId}/editing-lock?lessonId=${encodeURIComponent(lessonId)}`, { method: "DELETE", credentials: "include" }).catch(() => {});
    };
    window.addEventListener("beforeunload", release);
    return () => {
      window.removeEventListener("beforeunload", release);
      release();
    };
  }, [courseId, lessonId]);

  useEffect(() => {
    if (!courseId || !currentUserId) return;
    const interval = setInterval(() => {
      fetch(`/api/admin/courses/${courseId}`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => {
          const locks = (d.course?.editingLocks as Record<string, { userId: string; userName: string }>) ?? {};
          const lock = locks[lessonId];
          if (lock && lock.userId !== currentUserId) setOtherEditor({ userName: lock.userName });
          else setOtherEditor(null);
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [courseId, lessonId, currentUserId]);

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
          setH5pContentId(data.lesson.h5p_content_id ?? null);
          setBlocks(Array.isArray(data.lesson.blocks) ? data.lesson.blocks : []);
          setUseBlocks(Array.isArray(data.lesson.blocks) && data.lesson.blocks.length > 0);
          setCompetencias(Array.isArray(data.lesson.competencias) ? data.lesson.competencias : []);
        }
      })
      .catch(() => setError("Error al cargar"))
      .finally(() => setLoading(false));
  }, [lessonId]);

  useEffect(() => {
    fetch("/api/admin/h5p/content", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setH5pList(data) : setH5pList([])))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/admin/competencias", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => (Array.isArray(data.competencias) ? setCompetenciasCatalog(data.competencias) : setCompetenciasCatalog([])))
      .catch(() => {});
  }, []);

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
          h5p_content_id: h5pContentId || null,
          blocks: useBlocks ? blocks : [],
          competencias: competencias.length ? competencias : [],
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

        {otherEditor && (
          <div
            className="mb-4 rounded-lg px-4 py-2 text-sm text-[var(--ink)]"
            style={{ background: "rgba(0,229,160,0.12)", borderRadius: 8, padding: "8px 14px" }}
            role="status"
          >
            <strong>{otherEditor.userName}</strong> está editando esta lección ahora
          </div>
        )}

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
              <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                Contenido
              </label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contentMode"
                    checked={!useBlocks}
                    onChange={() => setUseBlocks(false)}
                  />
                  <span>Markdown (texto plano)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contentMode"
                    checked={useBlocks}
                    onChange={() => setUseBlocks(true)}
                  />
                  <span>Bloques (Notion-style)</span>
                </label>
              </div>
              {useBlocks ? (
                <LessonEditor
                  blocks={blocks}
                  onChange={setBlocks}
                  h5pContentIds={h5pList.map((h) => ({ id: h.id, title: h.title }))}
                  legacyContent={content}
                  onMigrateFromLegacy={() => setContent("")}
                />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)] font-mono text-sm"
                  placeholder="Contenido en texto o Markdown..."
                />
              )}
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
              <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                Competencias que desarrolla esta lección
              </label>
              <p className="text-sm text-[var(--ink-muted)] mb-2">
                Seleccione las competencias SPC que se trabajan en esta lección y el nivel.
              </p>
              <div className="space-y-3 rounded-xl border border-[var(--line-subtle)] bg-white p-4">
                {competenciasCatalog.map((c) => {
                  const selected = competencias.find((x) => x.id === c.id);
                  return (
                    <div key={c.id} className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer min-w-[200px]">
                        <input
                          type="checkbox"
                          checked={!!selected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCompetencias((prev) => [...prev, { id: c.id, nivel: "basico" }]);
                            } else {
                              setCompetencias((prev) => prev.filter((x) => x.id !== c.id));
                            }
                          }}
                        />
                        <span className="text-[var(--ink)]">{c.nombre}</span>
                      </label>
                      {selected && (
                        <select
                          value={selected.nivel}
                          onChange={(e) => {
                            const nivel = e.target.value as "basico" | "intermedio" | "avanzado";
                            setCompetencias((prev) =>
                              prev.map((x) => (x.id === c.id ? { ...x, nivel } : x))
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg border border-[var(--line-subtle)] bg-white text-sm text-[var(--ink)]"
                        >
                          <option value="basico">Básico</option>
                          <option value="intermedio">Intermedio</option>
                          <option value="avanzado">Avanzado</option>
                        </select>
                      )}
                    </div>
                  );
                })}
                {competenciasCatalog.length === 0 && (
                  <p className="text-sm text-[var(--ink-muted)]">Cargando catálogo de competencias…</p>
                )}
              </div>
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
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Contenido H5P</label>
              <select
                value={h5pContentId ?? ""}
                onChange={(e) => setH5pContentId(e.target.value || null)}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
              >
                <option value="">Ninguno</option>
                {h5pList.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.title} ({h.contentType})
                  </option>
                ))}
              </select>
              <H5PUploader
                onCreated={(id, t) => {
                  setH5pContentId(id);
                  setH5pList((prev) => [{ id, title: t, contentType: "", updatedAt: "" }, ...prev]);
                }}
                onError={setError}
              />
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
