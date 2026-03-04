"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Video, BookOpen, MessageCircle, ChevronRight } from "lucide-react";

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
  const [session, setSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/sessions").then((r) => r.json()).then((d) => (d.sessions ?? [])[0] ?? null),
      fetch("/api/community/posts").then((r) => r.json()).then((d) => (d.posts ?? []).slice(0, 2)),
    ]).then(([s, p]) => {
      setSession(s);
      setPosts(p);
    }).catch(() => {});
  }, []);

  const progressPct = DEMO_LESSONS_TOTAL > 0 ? Math.round((DEMO_LESSONS_DONE / DEMO_LESSONS_TOTAL) * 100) : 0;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <aside
      className="w-80 min-h-screen flex flex-col p-4 gap-4 overflow-y-auto panel-elevation"
      aria-label="Panel derecho"
    >
      {/* Próxima sesión */}
      <section className="card-premium p-4">
        <h2 className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
          <Video className="w-4 h-4" />
          Próxima sesión
        </h2>
        {session ? (
          <>
            <p className="font-semibold text-[var(--ink)] text-base mb-1">{session.title}</p>
            <p className="text-[var(--ink-muted)] text-sm mb-3">
              {new Date(session.scheduled_at).toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
            {session.meeting_url ? (
              <a
                href={session.meeting_url}
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
          </>
        ) : (
          <p className="text-[var(--ink-muted)] text-sm">No hay sesiones programadas.</p>
        )}
      </section>

      {/* Tu progreso (ring) */}
      <section className="card-premium p-4">
        <h2 className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Tu progreso
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0 rounded-full p-0.5 shadow-[0_2px_0_0_rgba(255,255,255,0.7)_inset,0_2px_8px_rgba(31,36,48,0.1)]" style={{ background: "linear-gradient(180deg, rgba(31,36,48,0.06) 0%, rgba(31,36,48,0.12) 100%)" }}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <defs>
                <linearGradient id="progress-ring-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                  <stop offset="40%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--amber)" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(31,36,48,0.12)" strokeWidth="8" />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="url(#progress-ring-gradient)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
                style={{ filter: "drop-shadow(0 1px 2px rgba(117,105,222,0.25))" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[var(--ink)]">
              {progressPct}%
            </span>
          </div>
          <div>
            <p className="font-semibold text-[var(--ink)]">
              {DEMO_LESSONS_DONE} de {DEMO_LESSONS_TOTAL} lecciones
            </p>
            <Link href="/cursos" className="text-[var(--primary)] text-sm font-medium mt-1 inline-flex items-center gap-0.5 hover:underline">
              Ver curso <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Avisos / Comunidad preview */}
      <section className="card-premium p-4">
        <h2 className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Comunidad
        </h2>
        {posts.length > 0 ? (
          <ul className="space-y-3">
            {posts.slice(0, 2).map((post) => (
              <li key={post.id}>
                <Link
                  href="/comunidad"
                  className="block p-2 rounded-xl hover:bg-[var(--cream)] transition-colors group"
                >
                  <p className="font-medium text-[var(--ink)] text-sm line-clamp-1 group-hover:text-[var(--primary)]">
                    {post.title}
                  </p>
                  <p className="text-[var(--ink-muted)] text-xs mt-0.5 line-clamp-2">{post.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[var(--ink-muted)] text-sm">Ningún post reciente.</p>
        )}
        <Link
          href="/comunidad"
          className="mt-3 text-[var(--primary)] text-sm font-medium inline-flex items-center gap-0.5 hover:underline"
        >
          Ver comunidad <ChevronRight className="w-4 h-4" />
        </Link>
      </section>
    </aside>
  );
}
