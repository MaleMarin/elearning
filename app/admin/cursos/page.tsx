"use client";

import { useState, useEffect, useCallback } from "react";

const IS_DEV = process.env.NODE_ENV === "development";
import Link from "next/link";
import {
  SurfaceCard,
  PageSection,
  PrimaryButton,
  SecondaryButton,
  EmptyState,
  Alert,
} from "@/components/ui";
import { CourseGrid, type CourseGridItem } from "@/components/admin/CourseGrid";
import { Plus, ChevronLeft, BookOpen, RefreshCw, Sparkles } from "lucide-react";

type Course = {
  id: string;
  title: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export default function AdminCursosPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [duplicateLoadingId, setDuplicateLoadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`/api/admin/courses?_=${Date.now()}`, { cache: "no-store", credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.status === 401) {
          setError("Debes iniciar sesión");
          setCourses([]);
          return;
        }
        if (res.status === 403) {
          setError("No tienes permisos de admin");
          setCourses([]);
          return;
        }
        if (!res.ok) {
          setError((data as { error?: string })?.error ?? `Error ${res.status}`);
          setCourses([]);
          return;
        }
        const list = Array.isArray((data as { courses?: Course[] }).courses)
          ? (data as { courses: Course[] }).courses
          : [];
        setCourses(list);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error de red");
          setCourses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/courses?_=${Date.now()}`, { cache: "no-store", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setError("Debes iniciar sesión");
        setCourses([]);
        return;
      }
      if (res.status === 403) {
        setError("No tienes permisos de admin");
        setCourses([]);
        return;
      }
      if (!res.ok) {
        setError(data?.error ?? `Error ${res.status}`);
        setCourses([]);
        return;
      }
      setCourses(Array.isArray(data.courses) ? data.courses : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = createTitle.trim();
    if (!title || createSubmitting) return;

    setCreateSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, status: "draft", description: null }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "Error al crear");
        return;
      }

      if (data.course) {
        setCourses((prev) => [data.course, ...prev]);
      } else {
        await loadCourses();
      }
      setCreateTitle("");
      setCreateOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleTogglePublish = async (c: Course) => {
    if (togglingId) return;
    setTogglingId(c.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/courses/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: c.status === "published" ? "draft" : "published" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al actualizar");
      setCourses((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: data.course.status } : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDuplicate = async (c: CourseGridItem) => {
    if (duplicateLoadingId) return;
    setDuplicateLoadingId(c.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/courses/${c.id}/duplicate`, { method: "POST", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Error al duplicar");
      await loadCourses();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al duplicar");
    } finally {
      setDuplicateLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        <PageSection
          title="Cursos"
          subtitle="Crea y edita cursos, módulos y lecciones. Asigna cursos a grupos."
        >
          {error !== null && (
            <div className="mb-6">
              <Alert
                message={IS_DEV ? error : error.length > 80 ? `${error.slice(0, 80)}…` : error}
                variant="error"
              />
              <SecondaryButton onClick={loadCourses} className="mt-3 inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </SecondaryButton>
            </div>
          )}

          <SurfaceCard padding="lg" clickable={false} className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-[var(--ink)]">Crear curso</h3>
              {!createOpen ? (
                <>
                  <SecondaryButton href="/admin/cursos/generar">
                    <Sparkles className="w-4 h-4" />
                    Generar con IA
                  </SecondaryButton>
                  <PrimaryButton onClick={() => setCreateOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Crear curso
                  </PrimaryButton>
                </>
              ) : (
                <SecondaryButton onClick={() => setCreateOpen(false)}>Cancelar</SecondaryButton>
              )}
            </div>
            {createOpen && (
              <form onSubmit={handleCreate} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">Título *</label>
                  <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    required
                    placeholder="Nombre del curso"
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] input-premium"
                  />
                </div>
                <PrimaryButton type="submit" disabled={createSubmitting || !createTitle.trim()}>
                  {createSubmitting ? "Creando…" : "Crear"}
                </PrimaryButton>
              </form>
            )}
          </SurfaceCard>

          {loading ? (
            <div className="space-y-2" aria-hidden>
              <div className="h-4 rounded bg-[var(--line-subtle)] animate-pulse w-full max-w-md" />
              <div className="h-4 rounded bg-[var(--line-subtle)] animate-pulse w-3/4 max-w-sm" />
            </div>
          ) : courses.length === 0 ? (
            <EmptyState
              title="Aún no hay cursos creados"
              description="Crea tu primer curso para añadir módulos y lecciones."
              ctaLabel="Crear curso"
              onCtaClick={() => setCreateOpen(true)}
            />
          ) : (
            <CourseGrid
              courses={courses as CourseGridItem[]}
              togglingId={togglingId}
              duplicateLoadingId={duplicateLoadingId}
              onTogglePublish={handleTogglePublish}
              onDuplicate={handleDuplicate}
            />
          )}
        </PageSection>
      </div>
    </div>
  );
}
