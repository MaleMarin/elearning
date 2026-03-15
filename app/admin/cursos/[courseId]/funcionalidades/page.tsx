"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FeatureFlagsPanel } from "@/components/admin/FeatureFlagsPanel";
import type { CourseFeatures } from "@/lib/types/course-features";
import { DEFAULT_COURSE_FEATURES } from "@/lib/types/course-features";

export default function AdminCursoFuncionalidadesPage() {
  const params = useParams();
  const courseId = String(params?.courseId ?? "");
  const [features, setFeatures] = useState<CourseFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/admin/courses/${courseId}/features`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setFeatures({ ...DEFAULT_COURSE_FEATURES });
        } else {
          setFeatures(data.features ?? { ...DEFAULT_COURSE_FEATURES });
        }
      })
      .catch(() => {
        setError("Error al cargar");
        setFeatures({ ...DEFAULT_COURSE_FEATURES });
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center">
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/admin/cursos/${courseId}`}
            className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al curso
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-[var(--ink)] mb-2">
          Funcionalidades del curso
        </h1>
        <p className="text-[var(--ink-muted)] mb-8">
          Activa o desactiva funcionalidades para este curso. Los alumnos solo verán lo que esté activado.
        </p>
        {features && (
          <FeatureFlagsPanel
            courseId={courseId}
            initialFeatures={features}
            onSaved={() => setError(null)}
          />
        )}
        {error && (
          <p className="text-sm text-[var(--coral)] mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
