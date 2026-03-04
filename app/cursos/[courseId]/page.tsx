"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui/EmptyState";

interface Module {
  id: string;
  title: string;
  order_index: number;
}

interface Lesson {
  id: string;
  title: string;
  module_id: string;
  order_index: number;
}

export default function CoursePage() {
  const params = useParams();
  const courseId = String(params?.courseId ?? "");
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    const supabase = createClient();

    void (async () => {
      try {
        const { data: course, error: e } = await supabase
          .from("courses")
          .select("id, title")
          .eq("id", courseId)
          .single();
        if (e || !course) {
          setError("Curso no encontrado");
          return;
        }
        setCourseTitle(course.title);

        const { data: mods } = await supabase
          .from("modules")
          .select("id, title, order_index")
          .eq("course_id", courseId)
          .eq("status", "published")
          .order("order_index", { ascending: true });
        const list = mods ?? [];
        setModules(list);
        if (list.length === 0) return;

        const results = await Promise.all(
          list.map((m) =>
            supabase
              .from("lessons")
              .select("id, title, module_id, order_index")
              .eq("module_id", m.id)
              .eq("status", "published")
              .order("order_index", { ascending: true })
          )
        );
        const map: Record<string, Lesson[]> = {};
        results.forEach((r, i) => {
          map[list[i].id] = (r.data ?? []) as Lesson[];
        });
        setLessonsByModule(map);
      } catch {
        setError("Curso no encontrado");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="h-8 bg-gray-100 rounded w-1/3 mb-4 animate-pulse" />
        <div className="card-white p-6 animate-pulse space-y-3">
          <div className="h-5 bg-gray-100 rounded w-full" />
          <div className="h-5 bg-gray-100 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (error || !courseTitle) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Curso</h1>
        <EmptyState
          title="Curso no encontrado"
          description={error ?? "No tienes acceso a este curso o no existe."}
          ctaLabel="Volver a cursos"
          ctaHref="/cursos"
          icon="📚"
        />
      </div>
    );
  }

  const hasContent = modules.some((m) => (lessonsByModule[m.id]?.length ?? 0) > 0);

  if (!hasContent) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-6">{courseTitle}</h1>
        <EmptyState
          title="Aún no hay lecciones publicadas"
          description="El contenido de este curso se publicará pronto. Revisa más tarde o consulta con tu mentor."
          ctaLabel="Volver a cursos"
          ctaHref="/cursos"
          icon="📖"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">{courseTitle}</h1>
      <p className="text-[var(--text-muted)] mb-6">
        Selecciona una lección para ver el contenido y usar el tutor.
      </p>
      <div className="space-y-6">
        {modules.map((mod) => {
          const lessons = lessonsByModule[mod.id] ?? [];
          if (lessons.length === 0) return null;
          return (
            <section key={mod.id} className="card-white p-4">
              <h2 className="font-semibold text-[var(--text)] mb-3">{mod.title}</h2>
              <ul className="space-y-2">
                {lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/cursos/${courseId}/leccion-${l.id}`}
                      className="text-[var(--accent)] hover:underline text-base"
                    >
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
