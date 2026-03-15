"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Video, BookOpen, MessageCircle, ChevronRight } from "lucide-react";
import { demoApiData } from "@/lib/supabase/demo-mock";

interface Session {
  id: string;
  title: string;
  scheduled_at: string;
  meeting_url: string | null;
}

interface Post {
  id: string;
  title: string;
  body: string;
  pinned?: boolean;
  created_at: string;
}

const DEMO_LESSONS_TOTAL = 2;
const DEMO_LESSONS_DONE = 1;

export function RightPanel() {
  const [session, setSession] = useState<Session | null>(() => demoApiData.sessions[0] ?? null);
  const [posts, setPosts] = useState<Post[]>(() => demoApiData.posts ?? []);

  useEffect(() => {
    Promise.all([
      fetch("/api/sessions").then((r) => r.json()).then((d) => (d.sessions ?? [])[0] ?? null),
      fetch("/api/community/posts").then((r) => r.json()).then((d) => (d.posts ?? []).slice(0, 2)),
    ]).then(([s, p]) => {
      if (s) setSession(s);
      if (Array.isArray(p) && p.length > 0) setPosts(p);
    }).catch(() => {});
  }, []);

  const progressPct = DEMO_LESSONS_TOTAL > 0 ? Math.round((DEMO_LESSONS_DONE / DEMO_LESSONS_TOTAL) * 100) : 0;
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeDashoffset = ringCircumference - (progressPct / 100) * ringCircumference;

  return (
    <aside
      className="w-80 min-h-screen flex flex-col p-5 gap-6 overflow-y-auto panel-elevation"
      aria-label="Panel derecho"
    >
      {/* 1. Tu progreso */}
      <section className="card-premium p-5" aria-labelledby="panel-progress-heading">
        <h2 id="panel-progress-heading" className="section-label mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Tu progreso
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-20 h-20 shrink-0 rounded-full p-[5px] border border-[rgba(31,36,48,0.08)] shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_4px_16px_rgba(31,36,48,0.06)]" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(243,242,239,0.8) 100%)" }}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80" aria-hidden>
              <defs>
                <linearGradient id="progress-ring-gradient-rp" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00e5a0" />
                  <stop offset="50%" stopColor="#00b87d" />
                  <stop offset="100%" stopColor="#1428d4" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(31,36,48,0.08)" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="url(#progress-ring-gradient-rp)"
                strokeWidth="6"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringStrokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[var(--ink)]">
              {progressPct}%
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[var(--ink)] text-sm">
              {DEMO_LESSONS_DONE} de {DEMO_LESSONS_TOTAL} lecciones
            </p>
            <p className="text-[var(--ink-muted)] text-xs mt-0.5">Sigue a tu ritmo.</p>
            <Link href="/curso" className="link-muted text-sm font-medium mt-2 inline-flex items-center gap-0.5 no-underline hover:text-[var(--primary)]">
              Ver curso <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Comunidad */}
      <section className="card-premium p-5">
        <h2 className="section-label mb-4 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Comunidad
        </h2>
        {posts.length > 0 ? (
          <>
            <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--cream)]/50 p-3 mb-3">
              <p className="font-medium text-[var(--ink)] text-sm line-clamp-1">{posts[0].title}</p>
              <p className="text-[var(--ink-muted)] text-xs mt-1 line-clamp-2">{posts[0].body}</p>
            </div>
            <Link href="/comunidad" className="link-muted text-sm font-medium inline-flex items-center gap-0.5 no-underline hover:text-[var(--primary)]">
              Ver comunidad <ChevronRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <>
            <p className="text-[var(--ink-muted)] text-sm mb-3">Ningún post reciente.</p>
            <Link href="/comunidad" className="btn-ghost w-full text-center text-sm no-underline">
              Ver comunidad
            </Link>
          </>
        )}
      </section>

      {/* 3. Próxima sesión */}
      <section className="card-premium p-5">
        <h2 className="section-label mb-4 flex items-center gap-2">
          <Video className="w-4 h-4" />
          Próxima sesión
        </h2>
        {session ? (
          <>
            <p className="font-semibold text-[var(--ink)] text-sm mb-1">{session.title}</p>
            <p className="text-[var(--ink-muted)] text-xs mb-4">
              {new Date(session.scheduled_at).toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
            {session.meeting_url ? (
              <a
                href={session.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-coral w-full text-center text-sm no-underline inline-flex items-center justify-center gap-2"
              >
                Entrar a Zoom
              </a>
            ) : (
              <Link href="/sesiones-en-vivo" className="btn-ghost w-full text-center text-sm no-underline">
                Ver sesiones
              </Link>
            )}
          </>
        ) : (
          <>
            <p className="text-[var(--ink-muted)] text-sm mb-3">No hay sesiones programadas.</p>
            <Link href="/sesiones-en-vivo" className="btn-ghost w-full text-center text-sm no-underline">
              Ver sesiones
            </Link>
          </>
        )}
      </section>
    </aside>
  );
}
