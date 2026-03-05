"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  EmptyState,
  ListRow,
} from "@/components/ui";
import type { CursoApiResponse } from "@/app/api/curso/route";
import { BookOpen, ChevronRight } from "lucide-react";

function Skeleton() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="h-8 w-48 rounded-lg bg-[var(--line-subtle)] animate-pulse" />
      <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--surface)] p-5 space-y-3">
        <div className="h-5 rounded bg-[var(--line-subtle)] animate-pulse w-3/4" />
        <div className="h-4 rounded bg-[var(--line-subtle)] animate-pulse w-full" />
        <div className="h-4 rounded bg-[var(--line-subtle)] animate-pulse w-1/2" />
      </div>
      <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--surface)] p-4 space-y-2">
        <div className="h-4 rounded bg-[var(--line-subtle)] animate-pulse w-1/3" />
        <div className="h-12 rounded-lg bg-[var(--line-subtle)] animate-pulse" />
        <div className="h-12 rounded-lg bg-[var(--line-subtle)] animate-pulse" />
      </div>
    </div>
  );
}

export default function CursoPage() {
  const router = useRouter();
  const [data, setData] = useState<CursoApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/curso")
      .then((r) => r.json())
      .then((d: CursoApiResponse) => {
        if (d && !("error" in d)) setData(d);
        else setData(null);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl w-full">
        <Skeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl w-full">
        <EmptyState
          title="Error al cargar"
          description="No se pudo cargar tu curso. Intenta de nuevo."
          ctaLabel="Volver a inicio"
          ctaHref="/inicio"
        />
      </div>
    );
  }

  if (!data.hasEnrollment) {
    router.replace("/no-inscrito");
    return null;
  }

  if (!data.course) {
    return (
      <div className="max-w-2xl w-full">
        <EmptyState
          title="Tu curso aparecerá aquí cuando esté asignado"
          description="Cuando te asignen un programa, verás el contenido en esta página. Si crees que deberías tener acceso, contacta a soporte."
          ctaLabel="Contactar soporte"
          ctaHref="/soporte"
          icon="📚"
        />
      </div>
    );
  }

  const hasContent = data.modules.length > 0 && data.lessons.length > 0;
  if (!hasContent) {
    return (
      <div className="max-w-2xl w-full">
        <EmptyState
          title="El contenido se está preparando"
          description="Tu curso ya está asignado; los módulos y lecciones se publicarán pronto. Revisa más tarde o vuelve al inicio."
          ctaLabel="Volver a inicio"
          ctaHref="/inicio"
          icon="📖"
        />
      </div>
    );
  }

  const lessonsByModule = data.lessons.reduce<Record<string, typeof data.lessons>>((acc, l) => {
    if (!acc[l.module_id]) acc[l.module_id] = [];
    acc[l.module_id].push(l);
    return acc;
  }, {});

  const firstHref = data.firstLessonId ? `/curso/lecciones/${data.firstLessonId}` : "/curso";

  return (
    <div className="max-w-2xl w-full space-y-6">
      <SurfaceCard padding="lg" clickable={false} className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--ink)]">{data.course.title}</h1>
          {data.course.description && (
            <p className="text-[var(--ink-muted)] text-sm mt-1">{data.course.description}</p>
          )}
        </div>
        <PrimaryButton href={firstHref} className="inline-flex items-center gap-2 w-fit">
          {data.firstLessonId ? "Continuar" : "Comenzar"}
          <ChevronRight className="w-4 h-4" />
        </PrimaryButton>
      </SurfaceCard>

      <section aria-labelledby="modulos-heading">
        <h2 id="modulos-heading" className="text-base font-semibold text-[var(--ink)] mb-3">
          Módulos y lecciones
        </h2>
        <div className="space-y-4">
          {data.modules.map((mod) => {
            const modLessons = lessonsByModule[mod.id] ?? [];
            if (modLessons.length === 0) return null;
            return (
              <SurfaceCard key={mod.id} padding="md" clickable={false}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-[var(--ink)]">{mod.title}</h3>
                  <span className="text-xs text-[var(--ink-muted)]">
                    {modLessons.length} {modLessons.length === 1 ? "lección" : "lecciones"}
                  </span>
                </div>
                <ul className="space-y-1">
                  {modLessons.map((l) => (
                    <li key={l.id}>
                      <ListRow
                        href={`/curso/lecciones/${l.id}`}
                        title={l.title}
                        subtitle={
                          l.estimated_minutes != null
                            ? `${l.estimated_minutes} min`
                            : undefined
                        }
                      />
                    </li>
                  ))}
                </ul>
              </SurfaceCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
