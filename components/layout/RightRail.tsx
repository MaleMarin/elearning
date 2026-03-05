"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Video, BookOpen, MessageCircle, ChevronRight } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { SecondaryButton } from "@/components/ui/Buttons";

interface DashboardData {
  cohortId: string | null;
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
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setData(d);
      })
      .catch(() => {});
  }, []);

  const progressPct =
    data?.progress && data.progress.lessonsTotal > 0
      ? Math.round((data.progress.lessonsDone / data.progress.lessonsTotal) * 100)
      : 0;

  return (
    <>
      <aside
        className="w-80 min-h-screen flex flex-col p-5 gap-6 overflow-y-auto panel-elevation"
        aria-label="Panel derecho"
      >
      <SurfaceCard padding="md" size="md" clickable={false} as="section" className="flex-shrink-0" aria-labelledby="rail-progress-heading">
        <h2 id="rail-progress-heading" className="section-label mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Tu progreso
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <ProgressRing value={progressPct} size={80} strokeWidth={6} label={`${progressPct}%`} />
          <div className="min-w-0">
            <p className="font-semibold text-[var(--ink)] text-sm">
              {data?.progress
                ? `${data.progress.lessonsDone} de ${data.progress.lessonsTotal} lecciones`
                : "—"}
            </p>
            <p className="text-[var(--ink-muted)] text-xs mt-0.5">Sigue a tu ritmo.</p>
            <Link
              href="/curso"
              className="link-muted text-sm font-medium mt-2 inline-flex items-center gap-0.5 no-underline hover:text-[var(--primary)]"
            >
              Ver curso <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard padding="md" size="md" clickable={false} as="section" className="flex-shrink-0" aria-labelledby="rail-community-heading">
        <h2 id="rail-community-heading" className="section-label mb-4 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Comunidad
        </h2>
        {data?.lastPost ? (
          <>
            <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--cream)]/50 p-3 mb-3">
              <p className="font-medium text-[var(--ink)] text-sm line-clamp-1">{data.lastPost.title}</p>
              {data.lastPost.author_name && (
                <p className="text-[var(--ink-muted)] text-xs mt-1">{data.lastPost.author_name}</p>
              )}
              <p className="text-[var(--ink-muted)] text-xs mt-1 line-clamp-2">{data.lastPost.body}</p>
            </div>
            <SecondaryButton href="/comunidad" className="w-full text-sm">
              Ver comunidad
            </SecondaryButton>
          </>
        ) : (
          <>
            <p className="text-[var(--ink-muted)] text-sm mb-3">
              Sé la primera persona en publicar en tu cohorte.
            </p>
            <SecondaryButton href="/comunidad" className="w-full text-sm">
              Crear post
            </SecondaryButton>
          </>
        )}
      </SurfaceCard>

      <SurfaceCard padding="md" size="md" clickable={false} as="section" className="flex-shrink-0" aria-labelledby="rail-session-heading">
        <h2 id="rail-session-heading" className="section-label mb-4 flex items-center gap-2">
          <Video className="w-4 h-4" />
          Próxima sesión
        </h2>
        {data?.nextSession ? (
          <>
            <p className="font-semibold text-[var(--ink)] text-sm mb-1">{data.nextSession.title}</p>
            <p className="text-[var(--ink-muted)] text-xs mb-4">
              {new Date(data.nextSession.scheduled_at).toLocaleDateString("es", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {data.nextSession.meeting_url ? (
              <a
                href={data.nextSession.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full min-h-[44px] px-4 rounded-full font-medium bg-[var(--coral)] text-white no-underline hover:bg-[var(--coral-hover)] text-sm"
              >
                Entrar a Zoom
              </a>
            ) : (
              <SecondaryButton href="/sesiones-en-vivo" className="w-full text-sm">
                Ver sesiones
              </SecondaryButton>
            )}
          </>
        ) : (
          <>
            <p className="text-[var(--ink-muted)] text-sm mb-4">
              Cuando programen la próxima sesión, aparecerá aquí.
            </p>
            <SecondaryButton href="/sesiones-en-vivo" className="w-full text-sm">
              Ver sesiones
            </SecondaryButton>
          </>
        )}
      </SurfaceCard>
      </aside>
    </>
  );
}
