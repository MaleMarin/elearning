"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Route, Save } from "lucide-react";
import { SurfaceCard, PrimaryButton, SecondaryButton, Alert } from "@/components/ui";
import type { LearningPath, LearningPathCourse } from "@/lib/services/learning-paths";

type CourseOption = { id: string; title: string };

export default function AdminRutaEditPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const [path, setPath] = useState<LearningPath | null>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editCargos, setEditCargos] = useState("");
  const [editInstituciones, setEditInstituciones] = useState("");
  const [editActiva, setEditActiva] = useState(true);
  const [editCursos, setEditCursos] = useState<LearningPathCourse[]>([]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(`/api/admin/learning-paths/${id}`, { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/courses", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([pathRes, coursesRes]) => {
        if (pathRes.path) {
          setPath(pathRes.path);
          setEditNombre(pathRes.path.nombre ?? "");
          setEditDescripcion(pathRes.path.descripcion ?? "");
          setEditCargos(Array.isArray(pathRes.path.cargosTarget) ? pathRes.path.cargosTarget.join(", ") : "");
          setEditInstituciones(Array.isArray(pathRes.path.institucionesTarget) ? pathRes.path.institucionesTarget.join(", ") : "");
          setEditActiva(pathRes.path.activa !== false);
          setEditCursos(Array.isArray(pathRes.path.cursos) ? [...pathRes.path.cursos] : []);
        } else setPath(null);
        const list = Array.isArray(coursesRes.courses) ? coursesRes.courses : [];
        setCourses(list.map((c: { id: string; title: string }) => ({ id: c.id, title: c.title || "Sin título" })));
      })
      .catch(() => setPath(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/learning-paths/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nombre: editNombre.trim() || "Ruta sin nombre",
          descripcion: editDescripcion.trim(),
          cargosTarget: editCargos.split(",").map((s) => s.trim()).filter(Boolean),
          institucionesTarget: editInstituciones.split(",").map((s) => s.trim()).filter(Boolean),
          activa: editActiva,
          cursos: editCursos,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      setPath(data.path);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const addCourse = (courseId: string) => {
    if (!courseId || editCursos.some((c) => c.courseId === courseId)) return;
    setEditCursos((prev) => [...prev, { courseId, orden: prev.length, obligatorio: true }]);
  };

  const removeCourse = (courseId: string) => {
    setEditCursos((prev) => prev.filter((c) => c.courseId !== courseId).map((c, i) => ({ ...c, orden: i })));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--neu-bg)] flex items-center justify-center">
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen bg-[var(--neu-bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--ink)] font-medium">Ruta no encontrada</p>
          <Link href="/admin/rutas" className="text-[var(--primary)] hover:underline mt-2 inline-block">
            Volver a rutas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--neu-bg)]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/rutas" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium">
            <ChevronLeft className="w-4 h-4" />
            Rutas de aprendizaje
          </Link>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Route className="w-6 h-6 text-[var(--primary)]" />
          <h1 className="text-xl font-semibold text-[var(--ink)]">Editar ruta</h1>
        </div>

        {error && <Alert message={error} variant="error" className="mb-4" />}
        {success && <Alert message="Cambios guardados correctamente." variant="info" className="mb-4" />}

        <form onSubmit={handleSave} className="space-y-6">
          <SurfaceCard padding="lg" clickable={false}>
            <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Datos de la ruta</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Nombre</label>
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[var(--neu-bg)] border-none shadow-[var(--neu-shadow-in)] text-[var(--ink)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Descripción</label>
                <textarea
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl bg-[var(--neu-bg)] border-none shadow-[var(--neu-shadow-in)] text-[var(--ink)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Cargos objetivo (separados por coma)</label>
                <input
                  type="text"
                  value={editCargos}
                  onChange={(e) => setEditCargos(e.target.value)}
                  placeholder="Ej: Jefe de proyecto, Coordinador, Analista"
                  className="w-full px-4 py-2 rounded-xl bg-[var(--neu-bg)] border-none shadow-[var(--neu-shadow-in)] text-[var(--ink)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Instituciones objetivo (separadas por coma; vacío = todas)</label>
                <input
                  type="text"
                  value={editInstituciones}
                  onChange={(e) => setEditInstituciones(e.target.value)}
                  placeholder="Ej: SFP, SHCP, INAI"
                  className="w-full px-4 py-2 rounded-xl bg-[var(--neu-bg)] border-none shadow-[var(--neu-shadow-in)] text-[var(--ink)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activa"
                  checked={editActiva}
                  onChange={(e) => setEditActiva(e.target.checked)}
                  className="rounded border-[var(--line)]"
                />
                <label htmlFor="activa" className="text-sm text-[var(--ink)]">Ruta activa (asignación automática en onboarding)</label>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard padding="lg" clickable={false}>
            <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Cursos de la ruta</h2>
            <p className="text-sm text-[var(--ink-muted)] mb-4">
              Los alumnos que coincidan con cargo e institución serán inscritos en la primera cohorte de cada curso, en este orden.
            </p>
            <ul className="space-y-2 mb-4">
              {editCursos.map((c, i) => (
                <li key={c.courseId} className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-[var(--neu-bg)]" style={{ boxShadow: "var(--neu-shadow-in-sm)" }}>
                  <span className="text-[var(--ink)]">
                    {i + 1}. {courses.find((x) => x.id === c.courseId)?.title ?? c.courseId}
                  </span>
                  <button type="button" onClick={() => removeCourse(c.courseId)} className="text-sm text-[var(--coral)] hover:underline">
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <select
                value=""
                onChange={(e) => { const v = e.target.value; if (v) addCourse(v); e.target.value = ""; }}
                className="px-4 py-2 rounded-xl bg-[var(--neu-bg)] border-none shadow-[var(--neu-shadow-in)] text-[var(--ink)]"
              >
                <option value="">Añadir curso…</option>
                {courses.filter((co) => !editCursos.some((c) => c.courseId === co.id)).map((co) => (
                  <option key={co.id} value={co.id}>{co.title}</option>
                ))}
              </select>
            </div>
          </SurfaceCard>

          <div className="flex gap-3">
            <PrimaryButton type="submit" disabled={saving} className="inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? "Guardando…" : "Guardar"}
            </PrimaryButton>
            <SecondaryButton href="/admin/rutas">Cancelar</SecondaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
