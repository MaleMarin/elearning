"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Module, Lesson } from "@/lib/types/content";

export default function PanelModulePage() {
  const params = useParams();
  const courseId = String(params?.courseId ?? "");
  const moduleId = String(params?.moduleId ?? "");
  const [module_, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!moduleId) return;
    fetch(`/api/admin/modules/${moduleId}/lessons`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setLessons(d.lessons ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  }, [moduleId, courseId]);

  useEffect(() => {
    if (!moduleId) return;
    fetch(`/api/admin/courses/${courseId}/modules`)
      .then((r) => r.json())
      .then((d) => {
        if (d.modules) {
          const m = d.modules.find((x: Module) => x.id === moduleId);
          if (m) setModule(m);
        }
      });
  }, [courseId, moduleId]);

  const router = useRouter();
  const handleCreate = () => {
    if (!newLessonTitle.trim() || creating) return;
    setCreating(true);
    fetch(`/api/admin/modules/${moduleId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newLessonTitle.trim(),
        summary: "",
        content: "",
        order_index: lessons.length,
        status: "draft",
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setLessons((prev) => [...prev, d.lesson]);
        setNewLessonTitle("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setCreating(false));
  };

  if (loading) return <p className="text-[var(--text-muted)]">Cargando…</p>;
  if (error) return <p className="text-[var(--error)]" role="alert">{error}</p>;

  const moduleTitle = module_?.title ?? "Módulo";

  return (
    <div className="max-w-3xl">
      <nav className="text-sm text-[var(--text-muted)] mb-4">
        <Link href="/panel/contenido" className="hover:text-[var(--accent)]">Panel</Link>
        <span className="mx-2">/</span>
        <Link href={`/panel/contenido/cursos/${courseId}`} className="hover:text-[var(--accent)]">Curso</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--text)]">{moduleTitle}</span>
      </nav>
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">{moduleTitle}</h1>

      <div className="card-white p-4 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">Nueva lección</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="text"
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
            placeholder="Título de la lección"
            className="flex-1 min-w-[200px] px-4 py-3 rounded-lg border border-gray-300 text-base min-h-[48px]"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newLessonTitle.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {creating ? "Creando…" : "Crear lección"}
          </button>
        </div>
      </div>

      <section className="card-white p-4">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">Lecciones</h2>
        {lessons.length === 0 ? (
          <p className="text-[var(--text-muted)]">No hay lecciones.</p>
        ) : (
          <ul className="space-y-2">
            {lessons.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
                <Link
                  href={`/panel/contenido/lecciones/${l.id}`}
                  className="font-medium text-[var(--text)] hover:text-[var(--accent)]"
                >
                  {l.title}
                </Link>
                <span className={`text-sm px-2 py-0.5 rounded ${l.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                  {l.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
