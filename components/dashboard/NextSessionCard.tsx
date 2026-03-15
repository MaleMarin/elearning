"use client";

import { Video, Calendar, Clock } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { SecondaryButton, AccentButton } from "@/components/ui/Buttons";

export interface SessionData {
  id: string;
  title: string;
  scheduled_at: string;
  meeting_url: string | null;
}

interface NextSessionCardProps {
  session: SessionData | null;
}

export function NextSessionCard({ session }: NextSessionCardProps) {
  return (
    <SurfaceCard padding="lg" clickable={false} as="section" aria-labelledby="next-session-heading">
      <h2 id="next-session-heading" className="text-base font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
        <Video className="w-4 h-4 text-[var(--primary)]" />
        Próxima sesión
      </h2>
      {session ? (
        <>
          <p className="font-semibold text-[var(--ink)] text-base mb-2">{session.title}</p>
          <div className="flex flex-wrap items-center gap-3 text-[var(--ink-muted)] text-sm mb-5">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(session.scheduled_at).toLocaleDateString("es", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {new Date(session.scheduled_at).toLocaleTimeString("es", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {session.meeting_url ? (
            <AccentButton href={session.meeting_url} className="w-full sm:w-auto">
              Entrar a Zoom
            </AccentButton>
          ) : (
            <SecondaryButton href="/sesiones-en-vivo">Ver sesiones</SecondaryButton>
          )}
        </>
      ) : (
        <div className="py-2">
          <p className="text-[var(--ink-muted)] text-sm mb-4">
            Cuando el mentor programe la próxima sesión, aparecerá aquí.
          </p>
          <SecondaryButton href="/sesiones-en-vivo">Ver sesiones</SecondaryButton>
        </div>
      )}
    </SurfaceCard>
  );
}
