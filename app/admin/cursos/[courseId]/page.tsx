"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  Badge,
  EmptyState,
} from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { TranslationManager } from "@/components/admin/TranslationManager";
import { StaleContentAlert } from "@/components/admin/StaleContentAlert";
import { CoAuthorManager } from "@/components/admin/CoAuthorManager";
import { ChevronLeft, Plus, Pencil, ListOrdered, Users, Sliders } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string | null;
  status: string;
};
type Module = {
  id: string;
  title: string;
  order_index: number;
  status: string;
};
type CohortCourse = { id: string; cohort_id: string; course_id: string; cohort_name?: string };
type Cohort = { id: string; name: string };

export default function AdminCursoEditPage() {
  const params = useParams();
  const courseId = String(params?.courseId ?? "");
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [cohortCourses, setCohortCourses] = useState<CohortCourse[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [moduleOpen, setModuleOpen] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleSubmitting, setModuleSubmitting] = useState(false);
  const [assignCohortId, setAssignCohortId] = useState("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [coAuthors, setCoAuthors] = useState<string[]>([]);
  const [coAuthorDetails, setCoAuthorDetails] = useState<{ id: string; full_name: string; email: string | null }[]>([]);

  useEffect(() => {
    if (!courseId) return;
    Promise.all([
      fetch(`/api/admin/courses/${courseId}`).then((r) => r.json()),
      fetch(`/api/admin/courses/${courseId}/modules`).then((r) => r.json()),
      fetch(`/api/admin/courses/${courseId}/cohorts`).then((r) => r.json()),
      fetch("/api/admin/cohorts").then((r) => r.json()),
    ])
      .then(([courseRes, modulesRes, cohortsRes, allCohorts]) => {
        if (courseRes.course) {
          setCourse(courseRes.course);
          setEditTitle(courseRes.course.title);
          setEditDescription(courseRes.course.description ?? "");
          setEditStatus(courseRes.course.status);
          setCoAuthors(Array.isArray(courseRes.course.coAuthors) ? courseRes.course.coAuthors : []);
        }
        if (Array.isArray(courseRes.coAuthorDetails)) setCoAuthorDetails(courseRes.coAuthorDetails);
        setModules(modulesRes.modules ?? []);
        setCohortCourses(cohortsRes.cohortCourses ?? []);
        setCohorts(Array.isArray(allCohorts) ? allCohorts : []);
      })
      .catch(() => setError("Error al cargar"))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
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
      setCourse(data.course);
      if (Array.isArray(data.course?.coAuthors)) setCoAuthors(data.course.coAuthors);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setModuleSubmitting(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: moduleTitle.trim(),
          order_index: modules.length,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear módulo");
      setModules((prev) => [...prev, data.module]);
      setModuleTitle("");
      setModuleOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear módulo");
    } finally {
      setModuleSubmitting(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignCohortId) return;
    setError(null);
    setAssignSubmitting(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/cohorts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cohortId: assignCohortId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Error al asignar");
      }
      const data = await res.json();
      const cohort = cohorts.find((c) => c.id === assignCohortId);
      setCohortCourses((prev) => [
        ...prev,
        { ...data.link, cohort_name: cohort?.name ?? assignCohortId },
      ]);
      setAssignCohortId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al asignar");
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleUnassign = async (cohortId: string) => {
    try {
      await fetch(`/api/admin/courses/${courseId}/cohorts?cohortId=${cohortId}`, {
        method: "DELETE",
      });
      setCohortCourses((prev) => prev.filter((cc) => cc.cohort_id !== cohortId));
    } catch {
      setError("Error al desasignar");
    }
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center">
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      </div>
    );
  }

  const assignedIds = new Set(cohortCourses.map((cc) => cc.cohort_id));
  const availableCohorts = cohorts.filter((c) => !assignedIds.has(c.id));

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/cursos"
            className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Cursos
          </Link>
        </div>

        {error && <Alert message={error} variant="error" className="mb-4" />}

        <SurfaceCard padding="lg" clickable={false} className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Datos del curso</h2>
          <form onSubmit={handleSaveCourse} className="space-y-4">
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
            <PrimaryButton type="submit" disabled={saving}>Guardar curso</PrimaryButton>
          </form>
        </SurfaceCard>

        <div className="mb-8">
          <SurfaceCard padding="md" clickable={false} className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--ink)] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[var(--primary)]" />
                Funcionalidades
              </h2>
              <p className="text-sm text-[var(--ink-muted)] mt-1">
                Activa o desactiva qué verán los alumnos en este curso (laboratorio, gamificación, etc.).
              </p>
            </div>
            <SecondaryButton href={`/admin/cursos/${courseId}/funcionalidades`}>
              Configurar
            </SecondaryButton>
          </SurfaceCard>
        </div>

        <div className="mb-8">
          <CoAuthorManager
            courseId={courseId}
            coAuthors={coAuthors}
            coAuthorDetails={coAuthorDetails}
            canManage={true}
            onUpdate={async (next) => {
              const res = await fetch(`/api/admin/courses/${courseId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ coAuthors: next }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error ?? "Error");
              setCoAuthors((data.course?.coAuthors as string[]) ?? next);
              const res2 = await fetch(`/api/admin/courses/${courseId}`);
              const data2 = await res2.json();
              if (Array.isArray(data2.coAuthorDetails)) setCoAuthorDetails(data2.coAuthorDetails);
            }}
          />
        </div>

        <TranslationManager courseId={courseId} />
        <StaleContentAlert courseId={courseId} />

        <SurfaceCard padding="lg" clickable={false} className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-[var(--ink)] flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-[var(--primary)]" />
              Módulos
            </h2>
            {!moduleOpen ? (
              <PrimaryButton onClick={() => setModuleOpen(true)}>
                <Plus className="w-4 h-4" />
                Añadir módulo
              </PrimaryButton>
            ) : (
              <SecondaryButton onClick={() => setModuleOpen(false)}>Cerrar</SecondaryButton>
            )}
          </div>
          {moduleOpen && (
            <form onSubmit={handleAddModule} className="mb-6 p-4 rounded-xl bg-[var(--bg)] space-y-3">
              <input
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="Título del módulo"
                className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
              />
              <PrimaryButton type="submit" disabled={moduleSubmitting || !moduleTitle.trim()}>
                Crear módulo
              </PrimaryButton>
            </form>
          )}
          {modules.length === 0 ? (
            <p className="text-[var(--ink-muted)] text-sm">Aún no hay módulos. Añade uno arriba.</p>
          ) : (
            <ul className="space-y-2">
              {modules
                .sort((a, b) => a.order_index - b.order_index)
                .map((m) => (
                  <li key={m.id}>
                    <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-[var(--bg)] border border-[var(--line-subtle)]">
                      <span className="font-medium text-[var(--ink)]">{m.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={m.status === "published" ? "completado" : "pendiente"}>
                          {m.status === "published" ? "Publicado" : "Borrador"}
                        </Badge>
                        <SecondaryButton href={`/admin/cursos/${courseId}/modulos/${m.id}`}>
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

        <SurfaceCard padding="lg" clickable={false}>
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--primary)]" />
            Asignar a grupo
          </h2>
          {availableCohorts.length > 0 ? (
            <form onSubmit={handleAssign} className="flex flex-wrap gap-3 items-end mb-4">
              <div className="min-w-[200px]">
                <label className="block text-xs font-medium text-[var(--ink-muted)] mb-1">Grupo</label>
                <select
                  value={assignCohortId}
                  onChange={(e) => setAssignCohortId(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
                >
                  <option value="">Seleccionar…</option>
                  {availableCohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <PrimaryButton type="submit" disabled={assignSubmitting || !assignCohortId}>
                Asignar
              </PrimaryButton>
            </form>
          ) : null}
          {cohortCourses.length === 0 ? (
            <p className="text-[var(--ink-muted)] text-sm">Este curso no está asignado a ningún grupo.</p>
          ) : (
            <ul className="space-y-2">
              {cohortCourses.map((cc) => (
                <li
                  key={cc.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg)] border border-[var(--line-subtle)]"
                >
                  <span className="font-medium text-[var(--ink)]">{cc.cohort_name ?? cc.cohort_id}</span>
                  <button
                    type="button"
                    onClick={() => handleUnassign(cc.cohort_id)}
                    className="text-sm text-[var(--coral)] hover:underline"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}
