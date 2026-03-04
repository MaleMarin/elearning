"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Lesson, LessonResource } from "@/lib/types/content";

export default function PanelLessonPage() {
  const params = useParams();
  const lessonId = String(params?.lessonId ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    video_embed_url: "",
    estimated_minutes: "" as number | "",
    status: "draft" as "draft" | "published",
  });

  useEffect(() => {
    if (!lessonId) return;
    Promise.all([
      fetch(`/api/admin/lessons/${lessonId}`).then((r) => r.json()),
      fetch(`/api/admin/lessons/${lessonId}/resources`).then((r) => r.json()),
    ])
      .then(([lessonRes, resourcesRes]) => {
        if (lessonRes.error) throw new Error(lessonRes.error);
        if (resourcesRes.error) throw new Error(resourcesRes.error);
        setLesson(lessonRes.lesson);
        const l = lessonRes.lesson;
        setForm({
          title: l.title ?? "",
          summary: l.summary ?? "",
          content: l.content ?? "",
          video_embed_url: l.video_embed_url ?? "",
          estimated_minutes: l.estimated_minutes ?? "",
          status: l.status ?? "draft",
        });
        setResources(resourcesRes.resources ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const saveLesson = () => {
    if (!lesson) return;
    setSaving(true);
    fetch(`/api/admin/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        summary: form.summary,
        content: form.content,
        video_embed_url: form.video_embed_url || null,
        estimated_minutes: form.estimated_minutes === "" ? null : Number(form.estimated_minutes),
        status: form.status,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setLesson(d.lesson);
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false));
  };

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    fetch(`/api/admin/lessons/${lessonId}/resources`, { method: "POST", body: fd })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setResources((prev) => [...prev, d.resource]);
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  };

  const deleteResource = (resourceId: string) => {
    if (!confirm("¿Eliminar este recurso?")) return;
    fetch(`/api/admin/lessons/${lessonId}/resources/${resourceId}`, { method: "DELETE" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
      })
      .catch((e) => setError(e.message));
  };

  const openResource = async (resourceId: string, preview: boolean) => {
    try {
      const r = await fetch(
        `/api/admin/lessons/${lessonId}/resources/${resourceId}/url?preview=${preview ? "1" : "0"}`
      );
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      if (d.url) window.open(d.url, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al obtener enlace");
    }
  };

  if (loading) return <p className="text-[var(--text-muted)]">Cargando…</p>;
  if (error) return <p className="text-[var(--error)]" role="alert">{error}</p>;
  if (!lesson) return <p className="text-[var(--text-muted)]">Lección no encontrada.</p>;

  return (
    <div className="max-w-4xl">
      <nav className="text-sm text-[var(--text-muted)] mb-4">
        <Link href="/panel/contenido" className="hover:text-[var(--accent)]">Panel</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--text)]">{lesson.title}</span>
      </nav>
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Editar lección</h1>

      <div className="card-white p-6 mb-6 space-y-4">
        <label className="block">
          <span className="font-medium text-[var(--text)]">Título</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 text-base min-h-[48px]"
          />
        </label>
        <label className="block">
          <span className="font-medium text-[var(--text)]">Resumen</span>
          <textarea
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            rows={2}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 text-base"
          />
        </label>
        <label className="block">
          <span className="font-medium text-[var(--text)]">Contenido (Markdown)</span>
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={12}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 text-base font-mono"
          />
        </label>
        <label className="block">
          <span className="font-medium text-[var(--text)]">URL del video (embed)</span>
          <input
            type="url"
            value={form.video_embed_url}
            onChange={(e) => setForm((f) => ({ ...f, video_embed_url: e.target.value }))}
            placeholder="https://..."
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 text-base min-h-[48px]"
          />
        </label>
        <label className="block">
          <span className="font-medium text-[var(--text)]">Minutos estimados</span>
          <input
            type="number"
            min={1}
            value={form.estimated_minutes === "" ? "" : form.estimated_minutes}
            onChange={(e) => setForm((f) => ({ ...f, estimated_minutes: e.target.value === "" ? "" : Number(e.target.value) }))}
            className="mt-1 block w-full max-w-[120px] px-4 py-3 rounded-lg border border-gray-300 text-base min-h-[48px]"
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="font-medium text-[var(--text)]">Estado</span>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "draft" | "published" }))}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <button
          type="button"
          onClick={saveLesson}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar lección"}
        </button>
      </div>

      <section className="card-white p-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">Recursos</h2>
        <p className="text-[var(--text-muted)] text-sm mb-4">
          Sube archivos (PDF, etc.). Se guardan en Storage (bucket privado) y se listan aquí con opción de descarga o vista previa (PDF).
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf,image/*,.doc,.docx"
          onChange={uploadFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-primary mb-4 disabled:opacity-50"
        >
          {uploading ? "Subiendo…" : "Subir archivo"}
        </button>
        {resources.length === 0 ? (
          <p className="text-[var(--text-muted)]">No hay recursos.</p>
        ) : (
          <ul className="space-y-3">
            {resources.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--text)] truncate">{r.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {r.mime_type} · {(r.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openResource(r.id, true)}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm"
                  >
                    Vista previa
                  </button>
                  <button
                    type="button"
                    onClick={() => openResource(r.id, false)}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm"
                  >
                    Descargar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteResource(r.id)}
                    className="px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
