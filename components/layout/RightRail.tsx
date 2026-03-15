"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Video, BookOpen, MessageCircle, ChevronRight } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { SecondaryButton, AccentButton } from "@/components/ui/Buttons";

interface DashboardData {
  cohortId: string | null;
  courseId: string | null;
  userName: string;
  nextSession: { id: string; title: string; scheduled_at: string; meeting_url: string | null } | null;
  nextTask: { id: string; title: string; due_at: string; completed_at: string | null } | null;
  lastPost: { id: string; title: string; body: string; created_at: string; author_name: string | null } | null;
  progress: { lessonsDone: number; lessonsTotal: number };
  modules: unknown[];
  showDemoModules: boolean;
}

/**
 * Panel derecho: Progreso, Comunidad, Próxima sesión con datos reales desde /api/dashboard.
 */
export function RightRail() {
  const pathname = usePathname();
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    setFetchError(false);
    setLoading(true);
    fetch("/api/dashboard", { credentials: "include" })
      .then((r) => {
        if (!r.ok) {
          setFetchError(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d && !("error" in d)) setData(d);
        setFetchError(false);
      })
      .catch(() => {
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setFetchError(false);
    setLoading(true);
    fetch("/api/dashboard", { credentials: "include" })
      .then((r) => {
        if (!r.ok) {
          setFetchError(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d && !("error" in d)) setData(d);
      })
      .catch(() => {
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  }, [pathname]);

  const progressPct =
    data?.progress && data.progress.lessonsTotal > 0
      ? Math.round((data.progress.lessonsDone / data.progress.lessonsTotal) * 100)
      : 0;
  const lessonsDone = data?.progress?.lessonsDone ?? 0;
  const lessonsTotal = data?.progress?.lessonsTotal ?? 0;

  const noCourseAssigned = data && data.cohortId && !data.courseId;

  const displayPct = progressPct || 30;
  const mods = (data?.modules ?? []) as { title?: string }[];
  const currentModuleTitle =
    mods[1]?.title ?? mods[0]?.title ?? "Módulo 2: Innovación centrada en personas";

  return (
    <aside
      className="hidden xl:flex min-h-screen flex-col flex-shrink-0 p-4 gap-4 overflow-y-auto panel-elevation"
      style={{ width: "260px" }}
      aria-label="Panel derecho"
    >
      {/* Tu progreso — skeleton al cargar; error elegante con Reintentar */}
      <SurfaceCard padding="md" size="md" clickable={false} as="section" className="flex-shrink-0" aria-labelledby="rail-progress-heading">
        <h2 id="rail-progress-heading" className="section-label mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Tu progreso
        </h2>
        {loading && !data ? (
          <div className="flex items-center gap-3" aria-busy="true">
            <div className="h-14 w-14 shrink-0 rounded-full bg-[var(--surface-soft)] animate-pulse" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-[var(--surface-soft)] animate-pulse" />
              <div className="h-3 w-32 rounded bg-[var(--surface-soft)] animate-pulse" />
            </div>
          </div>
        ) : fetchError && !data ? (
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[var(--line)] bg-[var(--surface-soft)]">
              <span className="text-sm font-semibold text-[var(--ink-muted)]">— %</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--ink-muted)]">No se pudo cargar el progreso.</p>
              <button
                type="button"
                onClick={refetch}
                className="mt-2 text-sm font-medium text-[var(--primary)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : noCourseAssigned ? (
          <div className="space-y-2">
            <p className="text-[var(--ink-muted)] text-sm">Sin curso asignado.</p>
            <SecondaryButton href="/curso" className="w-full text-sm">Ver curso</SecondaryButton>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <ProgressRing
              value={lessonsTotal > 0 ? progressPct : 30}
              size={56}
              strokeWidth={5}
              label={lessonsTotal > 0 ? `${progressPct}%` : "30"}
              aria-label="Progreso del curso"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[var(--ink)] text-sm">
                {displayPct}% del programa
              </p>
              <p className="text-[var(--ink-muted)] text-xs mt-0.5">{currentModuleTitle}</p>
              <Link
                href="/curso"
                className="text-[var(--primary)] text-sm font-medium mt-1.5 inline-flex items-center gap-0.5 no-underline hover:underline focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded"
              >
                Ver curso <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </SurfaceCard>

      {/* Comunidad — Diseño minimalista: estado corto + una acción */}
      <SurfaceCard padding="md" size="md" clickable={false} as="section" className="flex-shrink-0" aria-labelledby="rail-community-heading">
        <h2 id="rail-community-heading" className="section-label mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Comunidad
        </h2>
        {data?.lastPost ? (
          <>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-2.5 mb-2">
              <p className="font-medium text-[var(--ink)] text-sm line-clamp-1">{data.lastPost.title}</p>
              {data.lastPost.author_name && (
                <p className="text-[var(--ink-muted)] text-xs mt-0.5">{data.lastPost.author_name}</p>
              )}
              <p className="text-[var(--ink-muted)] text-xs mt-0.5 line-clamp-2">{data.lastPost.body}</p>
            </div>
            <SecondaryButton href="/comunidad" className="w-full text-sm">Ver comunidad</SecondaryButton>
          </>
        ) : (
          <div className="space-y-2">
            <p className="text-[var(--ink-muted)] text-sm">Aún no hay publicaciones</p>
            <SecondaryButton href="/comunidad" className="w-full text-sm">Crear post</SecondaryButton>
          </div>
        )}
      </SurfaceCard>

      {/* Próxima sesión — Consistencia: mismo patrón estado + acción */}
      <SurfaceCard padding="md" size="md" clickable={false} as="section" className="flex-shrink-0" aria-labelledby="rail-session-heading">
        <h2 id="rail-session-heading" className="section-label mb-3 flex items-center gap-2">
          <Video className="w-4 h-4" />
          Próxima sesión
        </h2>
        {data?.nextSession ? (
          <>
            <p className="font-semibold text-[var(--ink)] text-sm mb-0.5">{data.nextSession.title}</p>
            <p className="text-[var(--ink-muted)] text-xs mb-3">
              {new Date(data.nextSession.scheduled_at).toLocaleDateString("es", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {data.nextSession.meeting_url ? (
              <AccentButton href={data.nextSession.meeting_url} className="w-full text-sm">
                Entrar a Zoom
              </AccentButton>
            ) : (
              <SecondaryButton href="/sesiones-en-vivo" className="w-full text-sm">Ver sesiones</SecondaryButton>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <p className="text-[var(--ink-muted)] text-sm">Sin sesiones programadas</p>
            <SecondaryButton href="/sesiones-en-vivo" className="w-full text-sm">Ver sesiones</SecondaryButton>
          </div>
        )}
      </SurfaceCard>
    </aside>
  );
}
