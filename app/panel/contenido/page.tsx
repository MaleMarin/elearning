"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Course } from "@/lib/types/content";

export default function PanelContenidoPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setCourses(d.courses ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const createCourse = () => {
    if (!newTitle.trim() || creating) return;
    setCreating(true);
    fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), status: "draft" }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setCourses((prev) => [d.course, ...prev]);
        setNewTitle("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setCreating(false));
  };

  if (loading) return <p className="text-[var(--text-muted)]">Cargando…</p>;
  if (error) return <p className="text-[var(--error)]" role="alert">{error}</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Panel de contenido</h1>
      <p className="text-[var(--text-muted)] mb-6">
        Cursos, módulos y lecciones. Solo ves los cursos que puedes editar (admin: todos; mentor: asignados a tus cohortes).
      </p>

      <div className="card-white p-4 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">Nuevo curso</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título del curso"
            className="flex-1 min-w-[200px] px-4 py-3 rounded-lg border border-gray-300 text-[var(--text)] text-base min-h-[48px]"
          />
          <button
            type="button"
            onClick={createCourse}
            disabled={creating || !newTitle.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {creating ? "Creando…" : "Crear curso"}
          </button>
        </div>
      </div>

      <section className="card-white p-4">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">Cursos</h2>
        {courses.length === 0 ? (
          <p className="text-[var(--text-muted)]">No hay cursos. Crea uno arriba o asígnalo a una cohorte (mentor) para verlo aquí.</p>
        ) : (
          <ul className="space-y-2">
            {courses.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
                <Link
                  href={`/panel/contenido/cursos/${c.id}`}
                  className="font-medium text-[var(--text)] hover:text-[var(--accent)]"
                >
                  {c.title}
                </Link>
                <span className={`text-sm px-2 py-0.5 rounded ${c.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
