"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { AILessonGenerator } from "@/components/admin/AILessonGenerator";
import { YouTubeImporter } from "@/components/admin/YouTubeImporter";
import { ChevronLeft, FileText } from "lucide-react";

type Module = { id: string; title: string; order_index: number };

export default function AdminGenerarLeccionPage() {
  const params = useParams();
  const courseId = String(params?.courseId ?? "");
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/admin/courses/${courseId}/modules`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const list = (d.modules ?? []).sort((a: Module, b: Module) => a.order_index - b.order_index);
        setModules(list);
        if (list.length > 0 && !selectedModule) setSelectedModule(list[0]);
      })
      .catch(() => setError("Error al cargar módulos"))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    modules.forEach((m) => {
      fetch(`/api/admin/modules/${m.id}/lessons`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => setLessonCounts((prev) => ({ ...prev, [m.id]: (d.lessons ?? []).length })))
        .catch(() => {});
    });
  }, [modules]);

  const orderIndex = selectedModule ? (lessonCounts[selectedModule.id] ?? 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center">
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/admin/cursos/${courseId}`}
            className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Curso
          </Link>
        </div>
        <h1 className="text-xl font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
          <FileText className="w-6 h-6 text-[var(--primary)]" />
          Generar lección desde archivo
        </h1>
        <p className="text-sm text-[var(--ink-muted)] mb-6">
          Sube un PDF o PPT y la IA generará una lección con bloques y preguntas. Elige el módulo donde se creará la lección.
        </p>

        {error && <Alert message={error} variant="error" className="mb-4" />}

        {modules.length === 0 ? (
          <SurfaceCard padding="lg" clickable={false}>
            <p className="text-[var(--ink-muted)]">Este curso no tiene módulos. Crea al menos un módulo desde la página del curso.</p>
            <Link href={`/admin/cursos/${courseId}`} className="text-[var(--primary)] font-medium mt-2 inline-block">Ir al curso</Link>
          </SurfaceCard>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--ink)] mb-2">Módulo destino</label>
              <select
                value={selectedModule?.id ?? ""}
                onChange={(e) => setSelectedModule(modules.find((m) => m.id === e.target.value) ?? null)}
                className="w-full max-w-md px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)]"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({(lessonCounts[m.id] ?? 0)} lecciones)
                  </option>
                ))}
              </select>
            </div>
            {selectedModule && (
              <>
                <AILessonGenerator
                  courseId={courseId}
                  moduleId={selectedModule.id}
                  moduleTitle={selectedModule.title}
                  orderIndex={orderIndex}
                  onSaved={() => {
                    setLessonCounts((prev) => ({ ...prev, [selectedModule.id]: (prev[selectedModule.id] ?? 0) + 1 }));
                  }}
                  onError={setError}
                />
                <YouTubeImporter
                  courseId={courseId}
                  moduleId={selectedModule.id}
                  moduleTitle={selectedModule.title}
                  orderIndex={orderIndex}
                  onSaved={() => {
                    setLessonCounts((prev) => ({ ...prev, [selectedModule.id]: (prev[selectedModule.id] ?? 0) + 1 }));
                  }}
                  onError={setError}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
