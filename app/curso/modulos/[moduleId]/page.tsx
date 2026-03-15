"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen, ListTodo, HelpCircle, Video, Home, Award, CheckSquare } from "lucide-react";
import {
  BibliographySection,
  PodcastSection,
  VideoSection,
  LiveRecordingPlayer,
  ModuleAccessGate,
  ModuleLanding,
} from "@/components/modules";
import ModuleNPS from "@/components/learning/ModuleNPS";
import { EmptyState, PrimaryButton } from "@/components/ui";
import type { ModuleContentApiResponse } from "@/app/api/modules/[moduleId]/content/route";

const TABS = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "contenido", label: "Contenido", icon: BookOpen },
  { id: "lecciones", label: "Lecciones", icon: ListTodo },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
  { id: "grabacion", label: "Grabación", icon: Video },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ModuloPage() {
  const params = useParams();
  const moduleId = String(params?.moduleId ?? "");
  const [data, setData] = useState<ModuleContentApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("inicio");
  const [npsDone, setNpsDone] = useState(false);

  useEffect(() => {
    if (!moduleId) {
      setLoading(false);
      return;
    }
    fetch(`/api/modules/${encodeURIComponent(moduleId)}/content`, { credentials: "include" })
      .then((r) => r.json())
      .then((d: ModuleContentApiResponse & { error?: string }) => {
        if (d && !("error" in d)) setData(d);
        else setData(null);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) {
    return (
      <div className="max-w-3xl w-full animate-pulse space-y-4">
        <div className="h-6 w-48 rounded bg-[var(--surface-soft)]" />
        <div className="h-12 rounded-xl bg-[var(--surface-soft)]" />
        <div className="h-64 rounded-xl bg-[var(--surface-soft)]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl w-full">
        <EmptyState
          title="Módulo no encontrado"
          description="No tienes acceso a este módulo o no existe."
          ctaLabel="Volver al curso"
          ctaHref="/curso"
        />
      </div>
    );
  }

  const { module: mod, content, access, lessons = [], allLessonsCompleted = false, quizId } = data;
  const canShowContentTab = access.canSeeContent;
  const canShowExercises = access.canSeeExercises;

  return (
    <div className="max-w-3xl w-full space-y-6">
      <nav className="text-sm text-[var(--texto-sub)]" aria-label="Breadcrumb">
        <Link
          href="/curso"
          className="hover:text-[var(--azul)] focus-visible:ring-2 focus-visible:ring-[var(--azul)] rounded"
        >
          Mi curso
        </Link>
        <span className="mx-1">›</span>
        <span className="text-[var(--ink)] font-medium">
          Módulo {mod.order} — {mod.title}
        </span>
      </nav>

      <div
        className="rounded-[16px] p-1 bg-[var(--neu-bg)] border-none flex flex-wrap gap-1"
        style={{ boxShadow: "var(--neu-shadow-in-sm)" }}
        role="tablist"
        aria-label="Secciones del módulo"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const disabled =
            (tab.id === "lecciones" && !canShowExercises) ||
            (tab.id === "quiz" && (!quizId || !allLessonsCompleted));
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              disabled={disabled}
              onClick={() => !disabled && setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                disabled
                  ? "text-[var(--texto-sub)] opacity-60 cursor-not-allowed"
                  : isActive
                    ? "bg-[var(--surface)] text-[var(--azul)]"
                    : "text-[var(--ink)] hover:bg-[var(--surface-soft)]"
              }`}
              style={isActive ? { boxShadow: "var(--neu-shadow-out-sm)" } : undefined}
            >
              <Icon className="w-4 h-4" aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id="panel-inicio" aria-labelledby="tab-inicio" hidden={activeTab !== "inicio"}>
        {activeTab === "inicio" && (
          <ModuleLanding
            module={mod}
            lessons={lessons}
            firstLessonId={lessons[0]?.id}
            canSeeExercises={canShowExercises}
          />
        )}
      </div>

      <div role="tabpanel" id="panel-contenido" aria-labelledby="tab-contenido" hidden={activeTab !== "contenido"}>
        {activeTab === "contenido" && (
          canShowContentTab ? (
            <div className="space-y-8">
              <BibliographySection items={content.bibliography} />
              <PodcastSection items={content.podcasts} />
              <VideoSection items={content.videos} />
              {content.bibliography.length === 0 && content.podcasts.length === 0 && content.videos.length === 0 && (
                <p className="text-sm text-[var(--texto-sub)]">No hay contenido teórico configurado para este módulo.</p>
              )}
            </div>
          ) : (
            <ModuleAccessGate canSeeExercises={false} reason={access.reason}>
              <span />
            </ModuleAccessGate>
          )
        )}
      </div>

      <div role="tabpanel" id="panel-lecciones" aria-labelledby="tab-lecciones" hidden={activeTab !== "lecciones"}>
        {activeTab === "lecciones" && (
          <ModuleAccessGate canSeeExercises={canShowExercises} reason={access.reason}>
            <div className="space-y-2">
              {lessons.length === 0 ? (
                <p className="text-sm text-[var(--texto-sub)]">No hay lecciones en este módulo.</p>
              ) : (
                <ul className="space-y-2">
                  {lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/curso/lecciones/${l.id}`}
                        className="flex items-center justify-between gap-2 rounded-[16px] p-4 bg-[var(--neu-bg)] border-none text-[var(--ink)] hover:bg-[var(--surface-soft)]"
                        style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
                      >
                        <span className="font-medium">{l.title}</span>
                        <ChevronLeft className="w-4 h-4 rotate-180 text-[var(--texto-sub)]" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ModuleAccessGate>
        )}
      </div>

      <div role="tabpanel" id="panel-quiz" aria-labelledby="tab-quiz" hidden={activeTab !== "quiz"}>
        {activeTab === "quiz" && (
          <>
            {!quizId ? (
              <p className="text-sm text-[var(--texto-sub)]">Este módulo no tiene quiz configurado.</p>
            ) : !allLessonsCompleted ? (
              <div
                className="rounded-[16px] p-6 bg-[var(--neu-bg)] text-center"
                style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
              >
                <p className="font-medium text-[var(--ink)]">Completa las lecciones para desbloquear el quiz.</p>
                <p className="text-sm text-[var(--texto-sub)] mt-1">
                  Debes terminar todas las lecciones de este módulo para acceder al quiz.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-[16px] p-6 bg-[var(--neu-bg)]" style={{ boxShadow: "var(--neu-shadow-out-sm)" }}>
                  <p className="font-medium text-[var(--ink)] mb-3">Quiz del módulo</p>
                  <Link
                    href={`/curso/quiz/${quizId}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--azul)] text-white font-medium hover:opacity-90"
                  >
                    Ir al quiz →
                  </Link>
                </div>
                {!npsDone && (
                  <ModuleNPS
                    moduloId={moduleId}
                    moduloTitulo={mod.title}
                    onComplete={() => setNpsDone(true)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div role="tabpanel" id="panel-grabacion" aria-labelledby="tab-grabacion" hidden={activeTab !== "grabacion"}>
        {activeTab === "grabacion" && <LiveRecordingPlayer recording={content.liveRecording} />}
      </div>
    </div>
  );
}
