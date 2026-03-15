"use client";

import { BookOpen, FileText, Newspaper, FileBarChart, Globe } from "lucide-react";
import type { BibliographyItem, BibliographyTipo } from "@/lib/types/module-content";

const ICON_MAP: Record<BibliographyTipo, React.ComponentType<{ className?: string }>> = {
  libro: BookOpen,
  articulo: Newspaper,
  paper: FileText,
  reporte: FileBarChart,
  web: Globe,
};

interface BibliographySectionProps {
  items: BibliographyItem[];
  className?: string;
}

export function BibliographySection({ items, className = "" }: BibliographySectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={`space-y-4 ${className}`}
      aria-labelledby="bib-heading"
    >
      <h2 id="bib-heading" className="text-lg font-semibold text-[var(--azul)]">
        Bibliografía recomendada
      </h2>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = ICON_MAP[item.tipo] ?? FileText;
          return (
            <div
              key={item.id}
              className="rounded-[16px] p-4 bg-[var(--neu-bg)] border-none"
              style={{
                boxShadow: "var(--neu-shadow-out-sm)",
              }}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--primary-soft)]">
                  <Icon className="w-5 h-5 text-[var(--azul)]" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[var(--azul)]">{item.titulo}</h3>
                    {item.obligatorio && (
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
                  <p className="text-sm text-[var(--texto-sub)] mt-0.5">
                    {item.autor}
                    {item.año ? ` · ${item.año}` : ""}
                  </p>
                  {item.descripcion && (
                    <p className="text-sm text-[var(--ink)] mt-2 leading-relaxed">{item.descripcion}</p>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[var(--azul)] hover:text-[var(--azul-mid)]"
                    >
                      Ver recurso →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
