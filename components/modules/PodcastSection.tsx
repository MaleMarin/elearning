"use client";

import { Mic } from "lucide-react";
import type { PodcastItem } from "@/lib/types/module-content";

interface PodcastSectionProps {
  items: PodcastItem[];
  className?: string;
}

export function PodcastSection({ items, className = "" }: PodcastSectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={`space-y-4 ${className}`}
      aria-labelledby="podcast-heading"
    >
      <h2 id="podcast-heading" className="text-lg font-semibold text-[var(--azul)]">
        Podcasts recomendados
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-[16px] p-4 bg-[var(--neu-bg)] border-none flex gap-4"
            style={{
              boxShadow: "var(--neu-shadow-out-sm)",
            }}
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center overflow-hidden">
              {item.imagen ? (
                <img
                  src={item.imagen}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Mic className="w-7 h-7 text-[var(--azul)]" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[var(--ink)]">{item.titulo}</h3>
              {item.programa && (
                <p className="text-sm text-[var(--texto-sub)]">{item.programa}</p>
              )}
              {item.duracion && (
                <span
                  className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--surface-soft)]"
                  style={{ boxShadow: "var(--neu-shadow-in-sm)" }}
                >
                  {item.duracion}
                </span>
              )}
              {item.descripcion && (
                <p className="text-sm text-[var(--ink)] mt-2 leading-relaxed">{item.descripcion}</p>
              )}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[var(--azul)] hover:text-[var(--azul-mid)]"
              >
                Escuchar →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
