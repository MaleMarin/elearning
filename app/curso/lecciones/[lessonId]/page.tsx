"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SurfaceCard, PrimaryButton, SecondaryButton, EmptyState } from "@/components/ui";
import { simpleMarkdownToHtml } from "@/lib/markdown";
import type { CursoLeccionApiResponse } from "@/app/api/curso/lecciones/[lessonId]/route";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CursoLeccionPage() {
  const params = useParams();
  const lessonId = String(params?.lessonId ?? "");
  const [api, setApi] = useState<CursoLeccionApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonId) {
      setLoading(false);
      return;
    }
    fetch(`/api/curso/lecciones/${lessonId}`)
      .then((r) => r.json())
      .then((d: CursoLeccionApiResponse) => setApi(d))
      .catch(() => setApi(null))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return (
      <div className="max-w-3xl w-full">
        <div className="h-6 w-48 rounded bg-[var(--line-subtle)] animate-pulse mb-4" />
        <SurfaceCard padding="lg" clickable={false}>
          <div className="h-5 rounded bg-[var(--line-subtle)] animate-pulse w-full mb-2" />
          <div className="h-4 rounded bg-[var(--line-subtle)] animate-pulse w-4/5" />
        </SurfaceCard>
      </div>
    );
  }

  if (!api || api.notFound || !api.lesson) {
    return (
      <div className="max-w-2xl w-full">
        <EmptyState
          title="Lección no disponible"
          description="No tienes acceso a esta lección o no está publicada."
          ctaLabel="Volver al curso"
          ctaHref="/curso"
        />
      </div>
    );
  }

  const { lesson, courseId, prevLessonId, nextLessonId } = api;
  const contentHtml = lesson.content ? simpleMarkdownToHtml(lesson.content) : "";

  return (
    <div className="max-w-3xl w-full space-y-6">
      <nav className="text-sm text-[var(--ink-muted)]" aria-label="Breadcrumb">
        <Link href="/curso" className="hover:text-[var(--primary)]">
          Curso
        </Link>
        {" · "}
        <span className="text-[var(--ink)] font-medium">{lesson.title}</span>
      </nav>

      <h1 className="text-2xl font-bold text-[var(--ink)]">{lesson.title}</h1>
      {lesson.summary && (
        <p className="text-[var(--ink-muted)]">{lesson.summary}</p>
      )}

      {lesson.video_embed_url && (
        <div className="rounded-xl overflow-hidden border border-[var(--line-subtle)] bg-black aspect-video">
          <iframe
            src={lesson.video_embed_url}
            title={`Video: ${lesson.title}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <SurfaceCard padding="lg" clickable={false}>
        {contentHtml ? (
          <div
            className="prose prose-neutral max-w-none text-[var(--ink)] prose-p:mb-3 prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <p className="text-[var(--ink-muted)]">Sin contenido adicional.</p>
        )}
      </SurfaceCard>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[var(--line)]">
        <div>
          {prevLessonId ? (
            <SecondaryButton href={`/curso/lecciones/${prevLessonId}`}>
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </SecondaryButton>
          ) : (
            <SecondaryButton href="/curso">Volver al curso</SecondaryButton>
          )}
        </div>
        <div>
          {nextLessonId ? (
            <PrimaryButton href={`/curso/lecciones/${nextLessonId}`}>
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </PrimaryButton>
          ) : (
            <PrimaryButton href="/curso">Volver al curso</PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
