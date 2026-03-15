"use client";

import { useState, useEffect } from "react";
import { EmptyState } from "@/components/ui/EmptyState";

interface Session {
  id: string;
  cohort_id: string;
  title: string;
  scheduled_at: string;
  meeting_url: string | null;
}

export default function SesionesPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Sesiones en vivo</h1>
        <div className="card-white p-6 animate-pulse">
          <div className="h-5 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Sesiones en vivo</h1>
        <EmptyState
          title="Sin sesiones programadas"
          description="Te avisaremos por WhatsApp y email cuando el facilitador programe una sesión."
          ctaLabel="Activar recordatorios"
          ctaHref="/perfil#notificaciones"
          icon="📅"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Sesiones en vivo</h1>
      <p className="text-[var(--text-muted)] mb-6">
        Próximas sesiones. Haz clic en &quot;Unirse&quot; para entrar al enlace de la videollamada.
      </p>
      <ul className="space-y-4">
        {sessions.map((s) => (
          <li key={s.id} className="card-white p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium text-[var(--text)]">{s.title}</p>
              <p className="text-base text-[var(--text-muted)]">
                {new Date(s.scheduled_at).toLocaleString("es")}
                {s.meeting_url && (
                  <>
                    {" · "}
                    <a href={s.meeting_url} className="text-[var(--accent)] underline" target="_blank" rel="noopener noreferrer">
                      Unirse
                    </a>
                  </>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
