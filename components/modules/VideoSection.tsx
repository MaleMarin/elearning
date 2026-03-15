"use client";

import { useState } from "react";
import type { VideoItem } from "@/lib/types/module-content";

interface VideoSectionProps {
  items: VideoItem[];
  className?: string;
}

const YOUTUBE_THUMB = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
const YOUTUBE_EMBED = (id: string) => `https://www.youtube.com/embed/${id}?autoplay=1`;

function VideoCard({ item }: { item: VideoItem }) {
  const [embedOpen, setEmbedOpen] = useState(false);

  return (
    <div
      className="rounded-[16px] overflow-hidden bg-[var(--neu-bg)] border-none"
      style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
    >
      <div className="aspect-video bg-[var(--surface-soft)] relative">
        {embedOpen ? (
          <iframe
            src={YOUTUBE_EMBED(item.youtubeId)}
            title={item.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEmbedOpen(true)}
            className="absolute inset-0 w-full h-full flex items-center justify-center group"
            aria-label={`Reproducir: ${item.titulo}`}
          >
            <img
              src={YOUTUBE_THUMB(item.youtubeId)}
              alt=""
              className="w-full h-full object-cover"
            />
            <span
              className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
              aria-hidden
            >
              <span className="w-16 h-16 rounded-full bg-[var(--azul)] flex items-center justify-center text-white shadow-lg">
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-[var(--ink)]">{item.titulo}</h3>
          {item.esObligatorio && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-[20px]"
              style={{
                background: "rgba(0,229,160,0.12)",
                color: "#00b87d",
                border: "0.5px solid rgba(0,229,160,0.3)",
              }}
            >
              Obligatorio
            </span>
          )}
        </div>
        {(item.canal || item.duracion) && (
          <p className="text-sm text-[var(--texto-sub)] mt-0.5">
            {[item.canal, item.duracion].filter(Boolean).join(" · ")}
          </p>
        )}
        {item.descripcion && (
          <p className="text-sm text-[var(--ink)] mt-2 leading-relaxed">{item.descripcion}</p>
        )}
      </div>
    </div>
  );
}

export function VideoSection({ items, className = "" }: VideoSectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={`space-y-4 ${className}`}
      aria-labelledby="video-heading"
    >
      <h2 id="video-heading" className="text-lg font-semibold text-[var(--azul)]">
        Videos del módulo
      </h2>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {items.map((item) => (
          <VideoCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
