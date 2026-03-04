"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEMO_MODULES, DEMO_COURSE_ID, DEMO_NEXT_LESSON, demoApiData } from "@/lib/supabase/demo-mock";
import { Play, Video, CheckSquare, BookOpen, ChevronRight } from "lucide-react";

interface Session {
  id: string;
  title: string;
  scheduled_at: string;
  meeting_url: string | null;
}

interface Task {
  id: string;
  title: string;
  due_at: string;
  completed_at: string | null;
}

const LESSONS_TOTAL = 2;
const LESSONS_DONE = 1;

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Estudiante");

  useEffect(() => {
    Promise.all([
      fetch("/api/sessions").then((r) => r.json()).then((d) => d.sessions ?? []),
      fetch("/api/tasks").then((r) => r.json()).then((d) => d.tasks ?? []),
    ])
      .then(([s, t]) => {
        const sessionsData = Array.isArray(s) && s.length > 0 ? s : demoApiData.sessions;
        const tasksData = Array.isArray(t) && t.length > 0 ? t : demoApiData.tasks;
        setSessions(sessionsData);
        setTasks(tasksData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().auth.getUser().then(({ data }) => {
        const u = data.user;
        if (u?.email === "demo@demo.com") setUserName("Estudiante");
        else if (u?.user_metadata?.full_name) setUserName(String(u.user_metadata.full_name));
        else if (u?.email) setUserName(u.email.split("@")[0]);
      });
    }).catch(() => {});
  }, []);

  const nextSession = sessions[0];
  const nextTask = tasks.filter((t) => !t.completed_at)[0];
  const hasAny = nextSession || nextTask;
  const progressPct = LESSONS_TOTAL > 0 ? Math.round((LESSONS_DONE / LESSONS_TOTAL) * 100) : 0;

  if (loading) {
    return (
      <div className="max-w-3xl relative z-10">
        <div className="card-premium p-8 animate-pulse">
          <div className="h-8 bg-[var(--line)] rounded w-1/3 mb-4" />
          <div className="h-4 bg-[var(--line)] rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!hasAny && !nextSession && !nextTask) {
    return (
      <div className="max-w-3xl relative z-10">
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-6">Inicio</h1>
        <EmptyState
          title="Aún no tienes actividades asignadas"
          description="Cuando te inscribas en un programa verás aquí tu próxima sesión, tarea o lección."
          ctaLabel="Ver cursos"
          ctaHref="/cursos"
          icon="📅"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl relative z-10 space-y-8">
      {/* Header + Hero */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--ink)]">
            Bienvenido/a, {userName}
          </h1>
          <p className="text-[var(--ink-muted)] mt-1">
            Retoma tu curso y revisa tus próximas actividades.
          </p>
        </div>
        <Link
          href={`/cursos/${DEMO_COURSE_ID}`}
          className="btn-coral shrink-0 inline-flex items-center gap-2"
        >
          <Play className="w-5 h-5" />
          Continuar
        </Link>
      </header>

      {/* Continuar donde quedaste */}
      <section className="card-premium p-6">
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">
          Continuar donde quedaste
        </h2>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--ink-muted)]">Progreso</span>
            <span className="font-medium text-[var(--ink)]">{progressPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <p className="text-[var(--ink)] font-medium mb-1">
          Siguiente: {DEMO_NEXT_LESSON.title}
        </p>
        <p className="text-[var(--ink-muted)] text-sm mb-4">{DEMO_NEXT_LESSON.summary}</p>
        <Link
          href={`/cursos/${DEMO_COURSE_ID}/leccion-${DEMO_NEXT_LESSON.id}`}
          className="btn-primary inline-flex items-center gap-2"
        >
          Seguir con el curso
          <ChevronRight className="w-5 h-5" />
        </Link>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Próxima sesión */}
        {nextSession && (
          <section className="card-premium p-5">
            <h2 className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
              <Video className="w-4 h-4" />
              Próxima sesión
            </h2>
            <p className="font-semibold text-[var(--ink)] mb-1">{nextSession.title}</p>
            <p className="text-[var(--ink-muted)] text-sm mb-4">
              {new Date(nextSession.scheduled_at).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
            {nextSession.meeting_url ? (
              <a
                href={nextSession.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-coral w-full text-center text-sm"
              >
                Entrar a Zoom
              </a>
            ) : (
              <Link href="/sesiones" className="btn-ghost w-full text-center text-sm">
                Ver sesiones
              </Link>
            )}
          </section>
        )}

        {/* Próxima tarea */}
        {nextTask && (
          <section className="card-premium p-5">
            <h2 className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Próxima tarea
            </h2>
            <p className="font-semibold text-[var(--ink)] mb-1">{nextTask.title}</p>
            <p className="text-[var(--ink-muted)] text-sm mb-4">
              Vence: {new Date(nextTask.due_at).toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" })}
            </p>
            <Link href="/tareas" className="btn-ghost w-full text-center text-sm">
              Ver tareas
            </Link>
          </section>
        )}
      </div>

      {/* Tus módulos */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Tus módulos
        </h2>
        <ul className="space-y-2">
          {DEMO_MODULES.map((mod, i) => (
            <li key={mod.id}>
              <Link
                href={`/cursos/${DEMO_COURSE_ID}`}
                className="card-premium p-4 flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[var(--cream-dark)] flex items-center justify-center text-sm font-semibold text-[var(--ink-muted)]">
                    {i + 1}
                  </span>
                  <span className="font-medium text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors">
                    {mod.title}
                  </span>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full ${i === 0 ? "bg-[var(--primary)]/15 text-[var(--primary)]" : "bg-[var(--cream-dark)] text-[var(--ink-muted)]"}`}>
                  {i === 0 ? "En curso" : "Pendiente"}
                </span>
                <ChevronRight className="w-5 h-5 text-[var(--ink-muted)] group-hover:text-[var(--primary)] shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
