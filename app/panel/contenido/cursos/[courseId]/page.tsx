"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Course, Module } from "@/lib/types/content";

export default function PanelCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = String(params?.courseId ?? "");
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState<"draft" | "published">("draft");
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);
  const [cohortCourses, setCohortCourses] = useState<{ id: string; cohort_id: string; course_id: string; cohort_name?: string }[]>([]);
  const [assignCohortId, setAssignCohortId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    Promise.all([
      fetch(`/api/admin/courses/${courseId}`).then((r) => r.json()),
      fetch(`/api/admin/courses/${courseId}/modules`).then((r) => r.json()),
      fetch(`/api/admin/courses/${courseId}/cohorts`).then((r) => r.json()),
      fetch(`/api/admin/cohorts`).then((r) => r.json()),
    ])
      .then(([courseRes, modulesRes, cohortsRes, allCohortsRes]) => {
        if (courseRes.error) throw new Error(courseRes.error);
        if (modulesRes.error) throw new Error(modulesRes.error);
        setCourse(courseRes.course);
        setEditTitle(courseRes.course.title);
        setEditStatus(courseRes.course.status);
        setModules(modulesRes.modules ?? []);
        setCohortCourses(cohortsRes.cohortCourses ?? []);
        setCohorts(allCohortsRes.cohorts ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  const saveCourse = () => {
    if (!course) return;
    fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, status: editStatus }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setCourse(d.course);
        setEditing(false);
      })
      .catch((e) => setError(e.message));
  };

  const createModule = () => {
    if (!newModuleTitle.trim() || creating) return;
    setCreating(true);
    fetch(`/api/admin/courses/${courseId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newModuleTitle.trim(), order_index: modules.length, status: "draft" }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setModules((prev) => [...prev, d.module]);
        setNewModuleTitle("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setCreating(false));
  };

  const assignCohort = () => {
    if (!assignCohortId || assigning) return;
    setAssigning(true);
    fetch(`/api/admin/courses/${courseId}/cohorts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cohortId: assignCohortId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setCohortCourses((prev) => [...prev, d.link]);
        setAssignCohortId("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setAssigning(false));
  };

  const unassignCohort = (cohortId: string) => {
    fetch(`/api/admin/courses/${courseId}/cohorts?cohortId=${cohortId}`, { method: "DELETE" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setCohortCourses((prev) => prev.filter((cc) => cc.cohort_id !== cohortId));
      })
      .catch((e) => setError(e.message));
  };

  if (loading) return <p className="text-[var(--text-muted)]">Cargando…</p>;
  if (error) return <p className="text-[var(--error)]" role="alert">{error}</p>;
  if (!course) return <p className="text-[var(--text-muted)]">Curso no encontrado.</p>;

  return (
    <div className="max-w-3xl">
      <nav className="text-sm text-[var(--text-muted)] mb-4">
        <Link href="/panel/contenido" className="hover:text-[var(--accent)]">Panel</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--text)]">{course.title}</span>
      </nav>
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">
        {editing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        ) : (
          course.title
        )}
      </h1>
      {editing ? (
        <div className="flex gap-2 items-center mb-4">
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as "draft" | "published")}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
          <button type="button" onClick={saveCourse} className="btn-primary">Guardar</button>
          <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
        </div>
      ) : (
        <button type="button" onClick={() => setEditing(true)} className="mb-4 px-4 py-2 border rounded-lg">Editar curso</button>
      )}

      <div className="card-white p-4 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">Asignar a cohorte</h2>
        <p className="text-[var(--text-muted)] text-sm mb-2">
          Los mentores solo pueden editar cursos asignados a sus cohortes. Asigna este curso a una cohorte para que aparezca en el panel de los mentores.
        </p>
        <div className="flex gap-2 flex-wrap items-center mb-2">
          <select
            value={assignCohortId}
            onChange={(e) => setAssignCohortId(e.target.value)}
            className="px-3 py-2 border rounded-lg min-h-[48px] min-w-[200px]"
          >
            <option value="">Seleccionar cohorte</option>
            {cohorts.filter((c) => !cohortCourses.some((cc) => cc.cohort_id === c.id)).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={assignCohort}
            disabled={assigning || !assignCohortId}
            className="btn-primary disabled:opacity-50"
          >
            {assigning ? "Asignando…" : "Asignar"}
          </button>
        </div>
        {cohortCourses.length > 0 && (
          <ul className="space-y-1 text-sm">
            {cohortCourses.map((cc) => (
              <li key={cc.id} className="flex items-center justify-between gap-2">
                <span>{cc.cohort_name ?? cc.cohort_id}</span>
                <button type="button" onClick={() => unassignCohort(cc.cohort_id)} className="text-red-600 hover:underline">Quitar</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card-white p-4 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">Nuevo módulo</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="text"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="Título del módulo"
            className="flex-1 min-w-[200px] px-4 py-3 rounded-lg border border-gray-300 text-base min-h-[48px]"
          />
          <button
            type="button"
            onClick={createModule}
            disabled={creating || !newModuleTitle.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {creating ? "Creando…" : "Crear módulo"}
          </button>
        </div>
      </div>

      <section className="card-white p-4">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">Módulos</h2>
        {modules.length === 0 ? (
          <p className="text-[var(--text-muted)]">No hay módulos.</p>
        ) : (
          <ul className="space-y-2">
            {modules.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
                <Link
                  href={`/panel/contenido/cursos/${courseId}/modulos/${m.id}`}
                  className="font-medium text-[var(--text)] hover:text-[var(--accent)]"
                >
                  {m.title}
                </Link>
                <span className={`text-sm px-2 py-0.5 rounded ${m.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                  {m.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
