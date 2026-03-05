"use client";

import { useState, useEffect } from "react";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { NextSessionCard } from "@/components/dashboard/NextSessionCard";
import { NextTaskCard } from "@/components/dashboard/NextTaskCard";
import { ModulesOverviewCard } from "@/components/dashboard/ModulesOverviewCard";
import type { DashboardResponse } from "@/app/api/dashboard/route";

export default function InicioPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl w-full space-y-6">
        <div className="h-48 rounded-2xl bg-[var(--surface)] border border-[var(--line)] animate-pulse" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="h-40 rounded-2xl bg-[var(--surface)] border border-[var(--line)] animate-pulse" />
          <div className="h-40 rounded-2xl bg-[var(--surface)] border border-[var(--line)] animate-pulse" />
        </div>
        <div className="h-56 rounded-2xl bg-[var(--surface)] border border-[var(--line)] animate-pulse" />
      </div>
    );
  }

  const d = data ?? {
    cohortId: null,
    userName: "Estudiante",
    nextSession: null,
    nextTask: null,
    lastPost: null,
    progress: { lessonsDone: 0, lessonsTotal: 0 },
    modules: [],
    showDemoModules: false,
    nextLessonHref: null,
    nextLessonTitle: null,
    nextLessonSummary: null,
  };

  const progressPct =
    d.progress.lessonsTotal > 0
      ? Math.round((d.progress.lessonsDone / d.progress.lessonsTotal) * 100)
      : 0;

  return (
    <div className="max-w-4xl w-full space-y-6">
      <DashboardHero
        userName={d.userName}
        progressPct={progressPct}
        nextLessonTitle={d.nextLessonTitle}
        nextLessonSummary={d.nextLessonSummary}
        nextLessonHref={d.nextLessonHref}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <NextSessionCard session={d.nextSession} />
        <NextTaskCard task={d.nextTask} />
      </div>

      <ModulesOverviewCard modules={d.modules} showDemoModules={d.showDemoModules} />
    </div>
  );
}
