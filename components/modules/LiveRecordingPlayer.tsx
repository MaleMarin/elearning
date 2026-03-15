"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui";
import type { LiveRecording } from "@/lib/types/module-content";

interface LiveRecordingPlayerProps {
  recording: LiveRecording | null;
  className?: string;
}

const YOUTUBE_EMBED = (id: string) => `https://www.youtube.com/embed/${id}`;

export function LiveRecordingPlayer({ recording, className = "" }: LiveRecordingPlayerProps) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  if (!recording) {
    return (
      <div className={className}>
        <EmptyState
          icon="📹"
          title="Sin grabación disponible aún"
          description="Cuando se programe una sesión en vivo para este módulo, la grabación aparecerá aquí."
        />
      </div>
    );
  }

  const hasVideo = recording.youtubeId || recording.storageUrl;

  return (
    <section
      className={`space-y-4 ${className}`}
      aria-labelledby="recording-heading"
    >
      <h2 id="recording-heading" className="text-lg font-semibold text-[var(--azul)]">
        Grabación de sesión en vivo
      </h2>
      <div
        className="rounded-[16px] p-4 bg-[var(--neu-bg)] border-none"
        style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
      >
        <p className="text-sm text-[var(--texto-sub)]">
          Sesión del {recording.sessionDate}
        </p>
        <p className="text-sm text-[var(--ink)] mt-1">
          Facilitador: {recording.facilitador}
        </p>
        {recording.duracion && (
          <p className="text-sm text-[var(--texto-sub)]">{recording.duracion}</p>
        )}

        {hasVideo && (
          <div className="mt-4 rounded-xl overflow-hidden bg-black/5">
            {recording.youtubeId ? (
              <div className="aspect-video">
                <iframe
                  src={YOUTUBE_EMBED(recording.youtubeId)}
                  title={recording.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : recording.storageUrl ? (
              <video
                src={recording.storageUrl}
                controls
                className="w-full"
                preload="metadata"
              >
                Tu navegador no soporta la reproducción de video.
              </video>
            ) : null}
          </div>
        )}

        {recording.transcripcion && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setTranscriptOpen((o) => !o)}
              className="text-sm font-medium text-[var(--azul)] hover:text-[var(--azul-mid)]"
            >
              {transcriptOpen ? "Ocultar transcripción" : "Ver transcripción"}
            </button>
            {transcriptOpen && (
              <div
                className="mt-2 p-4 rounded-xl bg-[var(--surface-soft)] text-sm text-[var(--ink)] leading-relaxed whitespace-pre-wrap"
                style={{ boxShadow: "var(--neu-shadow-in-sm)" }}
              >
                {recording.transcripcion}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
