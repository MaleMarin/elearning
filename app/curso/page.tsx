"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SurfaceCard,
  PrimaryButton,
  EmptyState,
  ListRow,
  PageSection,
} from "@/components/ui";
import type { CursoApiResponse } from "@/app/api/curso/route";
import type { ProgramaApiResponse } from "@/app/api/curso/programa/route";
import { ModuleCard } from "@/components/curso/ModuleCard";
import { ModuleProgramView } from "@/components/modules";
import { getDemoMode } from "@/lib/env";
import { ChevronRight, List, LayoutList } from "lucide-react";

function Skeleton() {
  return (
    <div className="max-w-2xl space-y-4" aria-busy="true">
      <div className="h-8 w-48 rounded-xl bg-[var(--surface-soft)] animate-pulse" />
      <SurfaceCard padding="md" clickable={false}>
        <div className="space-y-3">
          <div className="h-5 rounded bg-[var(--surface-soft)] animate-pulse w-3/4" />
          <div className="h-4 rounded bg-[var(--surface-soft)] animate-pulse w-full" />
          <div className="h-4 rounded bg-[var(--surface-soft)] animate-pulse w-1/2" />
        </div>
      </SurfaceCard>
      <SurfaceCard padding="md" clickable={false}>
        <div className="space-y-2">
          <div className="h-4 rounded bg-[var(--surface-soft)] animate-pulse w-1/3" />
          <div className="h-12 rounded-xl bg-[var(--surface-soft)] animate-pulse" />
          <div className="h-12 rounded-xl bg-[var(--surface-soft)] animate-pulse" />
        </div>
      </SurfaceCard>
    </div>
  );
}

type CursoView = "modulos" | "programa";

export default function CursoPage() {
  const router = useRouter();
  const [data, setData] = useState<CursoApiResponse | null>(null);
  const [programaData, setProgramaData] = useState<ProgramaApiResponse | null>(null);
  const [programaLoading, setProgramaLoading] = useState(false);
  const [view, setView] = useState<CursoView>("modulos");
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
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

  useEffect(() => {
    if (!data?.course?.id) return;
    fetch(`/api/progress?courseId=${encodeURIComponent(data.course.id)}`)
      .then((r) => r.json())
      .then((d: { completedLessonIds?: string[] }) => {
        if (d && Array.isArray(d.completedLessonIds)) setCompletedLessonIds(d.completedLessonIds);
      })
      .catch(() => {});
  }, [data?.course?.id]);

  useEffect(() => {
    if (view !== "programa") return;
    setProgramaLoading(true);
    fetch("/api/curso/programa", { credentials: "include" })
      .then((r) => r.json())
      .then((d: ProgramaApiResponse & { error?: string }) => {
        if (d && !("error" in d)) setProgramaData(d);
        else setProgramaData(null);
      })
      .catch(() => setProgramaData(null))
      .finally(() => setProgramaLoading(false));
  }, [view]);

  useEffect(() => {
    if (getDemoMode() || !data?.course?.id) return;
    fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        action: "course_view",
        resourceId: data.course.id,
        resourceName: data.course.title ?? "",
      }),
    }).catch(() => {});
  }, [data?.course?.id, data?.course?.title]);

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

  const hasContent = data.modules.some((m) => m.lessonCount > 0);
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

  const moduleAccess = data.moduleAccess ?? {};
  const moduleLockReasons = data.moduleLockReasons ?? {};
  const firstUnlockedModule = data.modules.find((m) => m.lessonCount > 0 && moduleAccess[m.id] !== "locked");
  const firstLessonIdUnlocked = firstUnlockedModule?.lessons[0]?.id ?? data.firstLessonId;
  const firstHref = firstLessonIdUnlocked ? `/curso/lecciones/${firstLessonIdUnlocked}` : "/curso";
  const lessonById = new Map(data.lessons.map((l) => [l.id, l]));
  const useModuleCards = Object.keys(moduleAccess).length > 0;

  return (
    <div className="max-w-2xl w-full space-y-8">
      <PageSection
        id="curso-header"
        title={data.course.title}
        subtitle={data.course.description ?? undefined}
      >
        <PrimaryButton
          href={firstHref}
          className="inline-flex items-center gap-2 w-fit min-h-[48px]"
          aria-label={firstLessonIdUnlocked ? "Continuar al contenido" : "Comenzar"}
        >
          {firstLessonIdUnlocked ? "Continuar" : "Comenzar"}
          <ChevronRight className="w-4 h-4" aria-hidden />
        </PrimaryButton>
      </PageSection>

      <div
        className="rounded-[16px] p-1 bg-[var(--neu-bg)] border-none flex gap-1 w-fit"
        style={{ boxShadow: "var(--neu-shadow-in-sm)" }}
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={view === "modulos"}
          onClick={() => setView("modulos")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            view === "modulos" ? "bg-[var(--surface)] text-[var(--azul)]" : "text-[var(--ink)] hover:bg-[var(--surface-soft)]"
          }`}
          style={view === "modulos" ? { boxShadow: "var(--neu-shadow-out-sm)" } : undefined}
        >
          <List className="w-4 h-4" aria-hidden />
          Módulos y lecciones
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "programa"}
          onClick={() => setView("programa")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            view === "programa" ? "bg-[var(--surface)] text-[var(--azul)]" : "text-[var(--ink)] hover:bg-[var(--surface-soft)]"
          }`}
          style={view === "programa" ? { boxShadow: "var(--neu-shadow-out-sm)" } : undefined}
        >
          <LayoutList className="w-4 h-4" aria-hidden />
          Programa completo
        </button>
      </div>

      {view === "modulos" && (
      <PageSection id="modulos" title="Módulos y lecciones">
        <div className="space-y-4">
          {data.modules.map((mod, modIndex) => {
            if (mod.lessonCount === 0) return null;
            if (useModuleCards) {
              return (
                <ModuleCard
                  key={mod.id}
                  module={mod}
                  accessStatus={moduleAccess[mod.id] ?? "available"}
                  courseId={data.course!.id}
                  firstLessonId={mod.lessons[0]?.id ?? null}
                  lockReason={moduleLockReasons[mod.id]}
                />
              );
            }
            const moduleLabel = `Módulo ${modIndex + 1}: ${mod.title}`;
            return (
              <SurfaceCard key={mod.id} padding="md" clickable={false}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-[var(--ink)]">{moduleLabel}</h3>
                  <span className="text-xs text-[var(--ink-muted)]">
                    {(() => {
                      const done = mod.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
                      return `${done}/${mod.lessonCount} completadas`;
                    })()}
                  </span>
                </div>
                <ul className="space-y-2" role="list">
                  {mod.lessons.map((l) => {
                    const meta = lessonById.get(l.id);
                    const durationLabel = meta?.estimated_minutes != null && meta.estimated_minutes > 0
                      ? `~${meta.estimated_minutes} min`
                      : null;
                    const isCommunity = (l as { source_community?: boolean }).source_community ?? meta?.source_community;
                    const subtitleParts = [durationLabel, isCommunity ? "Comunidad" : null].filter(Boolean);
                    return (
                      <li key={l.id}>
                        <ListRow
                          href={`/curso/lecciones/${l.id}`}
                          title={l.title}
                          subtitle={subtitleParts.length > 0 ? subtitleParts.join(" · ") : undefined}
                          badge={
                            completedLessonIds.includes(l.id)
                              ? { variant: "completado", label: "Completado" }
                              : { variant: "pendiente", label: "Pendiente" }
                          }
                          className="min-h-[48px] rounded-xl"
                        />
                      </li>
                    );
                  })}
                </ul>
              </SurfaceCard>
            );
          })}
        </div>
      </PageSection>
      )}

      {view === "programa" && (
        <div className="max-w-2xl">
          {programaLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-6 w-40 rounded bg-[var(--surface-soft)]" />
              <div className="h-24 rounded-[16px] bg-[var(--surface-soft)]" />
              <div className="h-24 rounded-[16px] bg-[var(--surface-soft)]" />
            </div>
          ) : programaData?.modules && programaData.modules.length > 0 ? (
            <ModuleProgramView
              modules={programaData.modules}
              onModuleClick={(id) => router.push(`/curso/modulos/${id}`)}
            />
          ) : (
            <p className="text-sm text-[var(--texto-sub)]">No hay módulos en el programa.</p>
          )}
        </div>
      )}
    </div>
  );
}
