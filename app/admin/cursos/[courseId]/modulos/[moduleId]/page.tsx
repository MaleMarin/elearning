"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  Badge,
} from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { ChevronLeft, Plus, Pencil, FileText } from "lucide-react";

type Module = {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  status: string;
};
type Lesson = {
  id: string;
  title: string;
  order_index: number;
  status: string;
};

export default function AdminModuloEditPage() {
  const params = useParams();
  const courseId = String(params?.courseId ?? "");
  const moduleId = String(params?.moduleId ?? "");
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonSubmitting, setLessonSubmitting] = useState(false);

  useEffect(() => {
    if (!moduleId) return;
    Promise.all([
      fetch(`/api/admin/modules/${moduleId}`).then((r) => r.json()),
      fetch(`/api/admin/modules/${moduleId}/lessons`).then((r) => r.json()),
    ])
      .then(([modRes, lessonsRes]) => {
        if (modRes.module) {
          setModule(modRes.module);
          setEditTitle(modRes.module.title);
          setEditDescription(modRes.module.description ?? "");
          setEditStatus(modRes.module.status);
        }
        setLessons(lessonsRes.lessons ?? []);
      })
      .catch(() => setError("Error al cargar"))
      .finally(() => setLoading(false));
  }, [moduleId]);

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          status: editStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      setModule(data.module);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLessonSubmitting(true);
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonTitle.trim(),
          summary: "",
          content: "",
          order_index: lessons.length,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear lección");
      setLessons((prev) => [...prev, data.lesson]);
      setLessonTitle("");
      setLessonOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear lección");
    } finally {
      setLessonSubmitting(false);
    }
  };

  if (loading || !module) {
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
            href={`/admin/cursos/${courseId}`}
            className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Curso
          </Link>
        </div>

        {error && <Alert message={error} variant="error" className="mb-4" />}

        <SurfaceCard padding="lg" clickable={false} className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Datos del módulo</h2>
          <form onSubmit={handleSaveModule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Título</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Descripción</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">Estado</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as "draft" | "published")}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
            <PrimaryButton type="submit" disabled={saving}>Guardar módulo</PrimaryButton>
          </form>
        </SurfaceCard>

        <SurfaceCard padding="lg" clickable={false}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-[var(--ink)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--primary)]" />
              Lecciones
            </h2>
            {!lessonOpen ? (
              <PrimaryButton onClick={() => setLessonOpen(true)}>
                <Plus className="w-4 h-4" />
                Añadir lección
              </PrimaryButton>
            ) : (
              <SecondaryButton onClick={() => setLessonOpen(false)}>Cerrar</SecondaryButton>
            )}
          </div>
          {lessonOpen && (
            <form onSubmit={handleAddLesson} className="mb-6 p-4 rounded-xl bg-[var(--bg)] space-y-3">
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Título de la lección"
                className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
              />
              <PrimaryButton type="submit" disabled={lessonSubmitting || !lessonTitle.trim()}>
                Crear lección
              </PrimaryButton>
            </form>
          )}
          {lessons.length === 0 ? (
            <p className="text-[var(--ink-muted)] text-sm">Aún no hay lecciones. Añade una arriba.</p>
          ) : (
            <ul className="space-y-2">
              {lessons
                .sort((a, b) => a.order_index - b.order_index)
                .map((l) => (
                  <li key={l.id}>
                    <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-[var(--bg)] border border-[var(--line-subtle)]">
                      <span className="font-medium text-[var(--ink)]">{l.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={l.status === "published" ? "completado" : "pendiente"}>
                          {l.status === "published" ? "Publicado" : "Borrador"}
                        </Badge>
                        <SecondaryButton href={`/admin/cursos/${courseId}/modulos/${moduleId}/leccion/${l.id}`}>
                          <Pencil className="w-4 h-4" />
                          Editar
                        </SecondaryButton>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}
