"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  SurfaceCard,
  PrimaryButton,
  SecondaryButton,
  EmptyState,
  PageSection,
  Badge,
  Toast,
  ProgressBar,
} from "@/components/ui";
import { simpleMarkdownToHtml } from "@/lib/markdown";
import type { CursoLeccionApiResponse } from "@/app/api/curso/lecciones/[lessonId]/route";
import { H5PPlayer } from "@/components/lesson/H5PPlayer";
import { LessonContent } from "@/components/lesson/LessonContent";
import { QASection } from "@/components/lessons/QASection";
import { LearningJournal } from "@/components/lesson/LearningJournal";
import { AudioPlayer } from "@/components/lessons/AudioPlayer";
import { getPlainTextFromBlocks } from "@/lib/services/lessonBlocks";
import { MicroSimulation } from "@/components/learning/MicroSimulation";
import { getDemoMode } from "@/lib/env";
import type { MicroSimulation as SimType } from "@/lib/services/simulations";
import { prefetchNextModules } from "@/lib/offline/prefetch";
import { addPendingProgress } from "@/lib/offline/sync-manager";
import LessonComplete from "@/components/learning/LessonComplete";
import FlashcardDeck from "@/components/learning/FlashcardDeck";
import LessonNotes from "@/components/lessons/LessonNotes";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export default function CursoLeccionPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = String(params?.lessonId ?? "");
  const [api, setApi] = useState<CursoLeccionApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [showLessonComplete, setShowLessonComplete] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [simulation, setSimulation] = useState<SimType | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<"contenido" | "preguntas">("contenido");
  const contentRef = useRef<HTMLDivElement>(null);
  const [flashcards, setFlashcards] = useState<{ frente: string; reverso: string }[]>([]);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flashcardsGenerating, setFlashcardsGenerating] = useState(false);
  const [contentMode, setContentMode] = useState<"leer" | "escuchar" | "ver">("leer");

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const windowHeight = typeof window !== "undefined" ? window.innerHeight : 600;
      const scrollable = rect.height - windowHeight;
      if (scrollable <= 0) {
        setReadingProgress(1);
        return;
      }
      const ratio = Math.max(0, Math.min(1, -rect.top / scrollable));
      setReadingProgress(ratio);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [api?.lesson?.title]);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((me: { uid?: string } | null) => { if (me?.uid) setUserId(me.uid); })
      .catch(() => {});
  }, []);

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

  useEffect(() => {
    if (!api?.module) return;
    const moduleIndex = Math.max(0, (api.module.index ?? 1) - 1);
    prefetchNextModules(moduleIndex).catch(() => {});
  }, [api?.module?.index]);

  useEffect(() => {
    if (getDemoMode() || !api?.lesson?.title || !lessonId) return;
    fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        action: "lesson_view",
        resourceId: lessonId,
        resourceName: api.lesson?.title ?? "",
      }),
    }).catch(() => {});
    fetch("/api/xapi/lesson-started", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ lessonId, lessonTitle: api.lesson?.title ?? "" }),
    }).catch(() => {});
  }, [lessonId, api?.lesson?.title]);

  useEffect(() => {
    if (!lessonId) return;
    const paramsLesson = new URLSearchParams({ lessonId });
    fetch(`/api/simulations?${paramsLesson}`)
      .then((r) => r.json())
      .then(async (d: { simulation?: SimType | null }) => {
        if (d.simulation) {
          setSimulation(d.simulation);
          return;
        }
        setSimulation(null);
      })
      .catch(() => setSimulation(null));
  }, [lessonId]);

  useEffect(() => {
    if (!api?.module?.id || simulation !== null) return;
    const paramsModule = new URLSearchParams({ moduleId: api.module.id });
    fetch(`/api/simulations?${paramsModule}`)
      .then((r) => r.json())
      .then((d: { simulation?: SimType | null }) => {
        if (d.simulation) setSimulation(d.simulation);
      })
      .catch(() => {});
  }, [api?.module?.id, simulation]);

  useEffect(() => {
    if (!api?.courseId || !lessonId) return;
    fetch(`/api/progress?courseId=${encodeURIComponent(api.courseId)}`)
      .then((r) => r.json())
      .then((d: { completedLessonIds?: string[] }) => {
        if (d && Array.isArray(d.completedLessonIds)) {
          setCompletedLessonIds(d.completedLessonIds);
          setIsCompleted(d.completedLessonIds.includes(lessonId));
        }
      })
      .catch(() => {});
  }, [api?.courseId, lessonId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((p: { contentMode?: "leer" | "escuchar" | "ver" } | null) => {
        if (p?.contentMode && ["leer", "escuchar", "ver"].includes(p.contentMode))
          setContentMode(p.contentMode);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!lessonId) return;
    setFlashcardsLoading(true);
    fetch(`/api/flashcards?lessonId=${encodeURIComponent(lessonId)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d: { flashcards?: { frente: string; reverso: string }[] }) => {
        setFlashcards(Array.isArray(d?.flashcards) ? d.flashcards : []);
      })
      .catch(() => setFlashcards([]))
      .finally(() => setFlashcardsLoading(false));
  }, [lessonId]);

  const handleGenerarFlashcards = useCallback(() => {
    if (!api?.lesson || flashcardsGenerating) return;
    setFlashcardsGenerating(true);
    const useBlocksHere = Array.isArray(api.lesson.blocks) && api.lesson.blocks.length > 0;
    const lessonContent = useBlocksHere && api.lesson.blocks
      ? [api.lesson.title, getPlainTextFromBlocks(api.lesson.blocks)].filter(Boolean).join("\n\n")
      : (api.lesson.content ?? api.lesson.title ?? "");
    fetch("/api/flashcards/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ lessonId, lessonContent, numCards: 5 }),
    })
      .then((r) => r.json())
      .then((d: { flashcards?: { frente: string; reverso: string }[] }) => {
        if (Array.isArray(d?.flashcards)) setFlashcards(d.flashcards);
      })
      .catch(() => {})
      .finally(() => setFlashcardsGenerating(false));
  }, [api?.lesson, flashcardsGenerating, lessonId]);

  const markComplete = useCallback(() => {
    if (!api?.courseId || completing) return;
    setCompleting(true);
    fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ courseId: api.courseId, lessonId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d && d.ok && Array.isArray(d.completedLessonIds)) {
          setIsCompleted(true);
          setCompletedLessonIds(d.completedLessonIds);
          setToast("¡Bien! Completaste esta lección.");
          if (d.justCompletedAll) {
            router.push("/curso/evaluacion-final");
            return;
          }
          setShowLessonComplete(true);
          if (!getDemoMode()) {
            fetch("/api/audit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                action: "lesson_complete",
                resourceId: lessonId,
                resourceName: api.lesson?.title ?? "",
              }),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          addPendingProgress(api.courseId!, lessonId);
          setIsCompleted(true);
          setCompletedLessonIds((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
          setToast("Guardado localmente. Se sincronizará cuando vuelva la conexión.");
        }
      })
      .finally(() => setCompleting(false));
  }, [api?.courseId, api?.lesson?.title, lessonId, completing]);

  const markPending = useCallback(() => {
    if (!api?.courseId || completing) return;
    setCompleting(true);
    fetch("/api/progress/uncomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: api.courseId, lessonId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d && d.ok) setIsCompleted(false);
      })
      .finally(() => setCompleting(false));
  }, [api?.courseId, lessonId, completing]);

  if (loading) {
    return (
      <div className="max-w-3xl w-full space-y-6">
        <div className="h-5 w-32 rounded bg-[var(--surface-soft)] animate-pulse" />
        <SurfaceCard padding="lg" clickable={false}>
          <div className="space-y-3">
            <div className="h-6 rounded bg-[var(--surface-soft)] animate-pulse w-3/4" />
            <div className="h-4 rounded bg-[var(--surface-soft)] animate-pulse w-full" />
          </div>
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

  const { lesson, module: moduleContext, prevLessonId, nextLessonId, totalLessons, lessonIndex } = api;
  const useBlocks = Array.isArray(lesson.blocks) && lesson.blocks.length > 0;
  const contentHtml = !useBlocks && lesson.content ? simpleMarkdownToHtml(lesson.content) : "";
  const progressValue = completedLessonIds.length;
  const h5pContentById = lesson.h5pContent && lesson.h5pContentId
    ? { [lesson.h5pContentId]: lesson.h5pContent }
    : {};
  const estimatedLabel = lesson.estimated_minutes != null && lesson.estimated_minutes > 0
    ? `~${lesson.estimated_minutes} min`
    : null;

  return (
    <>
      {showLessonComplete && (
        <LessonComplete
          lessonTitle={lesson.title}
          xp={10}
          onContinue={() => setShowLessonComplete(false)}
        />
      )}
      <div className="max-w-3xl w-full space-y-6">
        <nav className="text-sm text-[var(--ink-muted)]" aria-label="Breadcrumb">
          <Link href="/curso" className="hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded">
            Curso
          </Link>
          {" · "}
          <span className="text-[var(--ink)] font-medium">{lesson.title}</span>
        </nav>

      {/* Barra de progreso de lectura (scroll). */}
      <div
        className="h-1 bg-[var(--line)] rounded-full overflow-hidden mb-2"
        role="progressbar"
        aria-valuenow={Math.round(readingProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de lectura"
      >
        <div
          className="h-full bg-[var(--primary)] transition-all duration-200"
          style={{ width: `${readingProgress * 100}%` }}
        />
      </div>

      {/* Visibilidad de estado: el alumno sabe dónde está y cuánto falta. */}
      {totalLessons > 0 && (
        <div className="space-y-2" role="region" aria-label="Progreso del curso">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-[var(--ink-muted)]">
              Lección {lessonIndex} de {totalLessons}
              {estimatedLabel && (
                <span className="ml-2" aria-label="Duración estimada">
                  · {estimatedLabel}
                </span>
              )}
            </span>
          </div>
          <ProgressBar
            value={progressValue}
            max={totalLessons}
            aria-label={`Progreso: ${progressValue} de ${totalLessons} lecciones completadas`}
          />
        </div>
      )}

      {moduleContext && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--ink-muted)]" aria-hidden>
            Módulo {moduleContext.index} de {moduleContext.totalModules} · {moduleContext.title}
          </span>
          {isCompleted ? (
            <Badge variant="completado">Completada</Badge>
          ) : (
            <Badge variant="en-curso">En curso</Badge>
          )}
          {lesson.source_community && (
            <Badge variant="en-curso">Comunidad</Badge>
          )}
        </div>
      )}

      <div className="flex gap-2 rounded-xl p-1 bg-[var(--neu-bg)] shadow-[var(--neu-shadow-in-sm)] w-fit" role="tablist" aria-label="Secciones de la lección">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "contenido"}
          onClick={() => setTab("contenido")}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: tab === "contenido" ? "var(--azul)" : "transparent",
            color: tab === "contenido" ? "#fff" : "var(--ink-muted)",
            boxShadow: tab === "contenido" ? "var(--neu-shadow-in-sm)" : "none",
          }}
        >
          Contenido
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "preguntas"}
          onClick={() => setTab("preguntas")}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: tab === "preguntas" ? "var(--azul)" : "transparent",
            color: tab === "preguntas" ? "#fff" : "var(--ink-muted)",
            boxShadow: tab === "preguntas" ? "var(--neu-shadow-in-sm)" : "none",
          }}
        >
          Preguntas
        </button>
      </div>

      <PageSection
        id="leccion-titulo"
        title={lesson.title}
        subtitle={lesson.summary ?? undefined}
      >
        {null}
      </PageSection>

      {tab === "preguntas" ? (
        <QASection lessonId={lessonId} userId={userId} />
      ) : (
        <>
      <section
        role="region"
        aria-label="Aprendizaje por voz: escuchar lección (TTS) y responder por voz en la reflexión (STT)"
      >
        <AudioPlayer
          text={
            useBlocks && lesson.blocks?.length
              ? [lesson.title, getPlainTextFromBlocks(lesson.blocks)].filter(Boolean).join("\n\n")
              : [lesson.title, lesson.content].filter(Boolean).join("\n\n") || ""
          }
          storageId={lessonId}
          title={lesson.title}
          autoplay={contentMode === "escuchar"}
        />
      </section>

      {(() => {
        const hasVideo = !!(lesson.video_url || lesson.video_embed_url);
        const videoBlock = lesson.video_url ? (
          <div key="v" className="rounded-xl overflow-hidden border border-[var(--line-subtle)] bg-[var(--ink)] aspect-video">
            <video controls style={{ width: "100%", borderRadius: 12 }} className="w-full h-full">
              <source src={lesson.video_url} type="video/mp4" />
              {(lesson as { subtitulos_url?: string | null }).subtitulos_url && (
                <track
                  kind="subtitles"
                  src={(lesson as { subtitulos_url?: string }).subtitulos_url!}
                  srcLang="es"
                  label="Español"
                  default
                />
              )}
              Tu navegador no soporta video HTML5.
            </video>
          </div>
        ) : lesson.video_embed_url ? (
          <div key="v" className="rounded-xl overflow-hidden border border-[var(--line-subtle)] bg-[var(--ink)] aspect-video">
            <iframe
              src={lesson.video_embed_url}
              title={`Video: ${lesson.title}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null;

        const textBlock = (
          <SurfaceCard key="text" padding="lg" clickable={false} ref={contentRef}>
            {useBlocks ? (
              <LessonContent
                blocks={lesson.blocks ?? []}
                lessonId={lessonId}
                h5pContentById={h5pContentById}
              />
            ) : contentHtml ? (
              <div
                className="reading-width prose prose-neutral text-[var(--ink)] prose-p:mb-3 prose-p:leading-relaxed prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              <p className="text-[var(--ink-muted)]">Sin contenido adicional.</p>
            )}
          </SurfaceCard>
        );

        if (!hasVideo) return textBlock;
        if (contentMode === "ver") {
          return (
            <>
              {videoBlock}
              <details className="mt-4 rounded-xl border border-[var(--line)] overflow-hidden">
                <summary className="px-4 py-3 font-medium text-[var(--ink)] cursor-pointer bg-[var(--surface-soft)]">
                  Ver texto y contenido
                </summary>
                <div className="p-4">{textBlock}</div>
              </details>
            </>
          );
        }
        return (
          <>
            {textBlock}
            <details className="mt-4 rounded-xl border border-[var(--line)] overflow-hidden">
              <summary className="px-4 py-3 font-medium text-[var(--ink)] cursor-pointer bg-[var(--surface-soft)]">
                Ver video
              </summary>
              <div className="p-4">{videoBlock}</div>
            </details>
          </>
        );
      })()}

      {lesson.h5pContent && !useBlocks && (
        <SurfaceCard padding="lg" clickable={false}>
          <H5PPlayer content={lesson.h5pContent} title="Contenido interactivo" />
        </SurfaceCard>
      )}

      {simulation && (
        <MicroSimulation simulation={simulation} />
      )}

      <div className="flex flex-wrap items-center gap-3">
        {isCompleted ? (
          <>
            <span className="inline-flex items-center gap-2 text-sm text-[var(--success)] font-medium">
              <CheckCircle className="w-4 h-4" aria-hidden />
              Completada
            </span>
            <SecondaryButton
              type="button"
              onClick={markPending}
              disabled={completing}
              className="min-h-[48px]"
            >
              Marcar como pendiente
            </SecondaryButton>
          </>
        ) : (
          <PrimaryButton
            type="button"
            onClick={markComplete}
            disabled={completing}
            className="min-h-[48px]"
          >
            Marcar como completada
          </PrimaryButton>
        )}
      </div>

      <LearningJournal lessonId={lessonId} userId={userId} />

      <SurfaceCard padding="lg" clickable={false} className="mt-6">
        <h3 className="text-base font-semibold text-[var(--ink)] mb-3">Flashcards</h3>
        {flashcardsLoading ? (
          <p className="text-sm text-[var(--ink-muted)]">Cargando…</p>
        ) : flashcards.length > 0 ? (
          <FlashcardDeck cards={flashcards} />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[var(--ink-muted)]">Genera tarjetas de repaso con IA a partir del contenido de esta lección.</p>
            <button
              type="button"
              onClick={handleGenerarFlashcards}
              disabled={flashcardsGenerating}
              className="px-4 py-2 rounded-xl bg-[var(--azul)] text-white font-medium text-sm hover:opacity-90 disabled:opacity-60"
            >
              {flashcardsGenerating ? "Generando…" : "Generar flashcards con IA"}
            </button>
          </div>
        )}
      </SurfaceCard>

      <LessonNotes lessonId={lessonId} />
        </>
      )}

      <nav className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[var(--line)]" aria-label="Navegación de lección">
        <SecondaryButton
          href={prevLessonId ? `/curso/lecciones/${prevLessonId}` : undefined}
          disabled={!prevLessonId}
          className="min-h-[48px]"
          aria-disabled={!prevLessonId}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden />
          Anterior
        </SecondaryButton>
        <PrimaryButton
          href={nextLessonId ? `/curso/lecciones/${nextLessonId}` : undefined}
          disabled={!nextLessonId}
          className="min-h-[48px]"
          aria-disabled={!nextLessonId}
        >
          Siguiente
          <ChevronRight className="w-4 h-4" aria-hidden />
        </PrimaryButton>
      </nav>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <Toast
            message={toast}
            variant="success"
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
      </div>
    </>
  );
}
