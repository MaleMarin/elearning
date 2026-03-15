"use client";

import { BookOpen, FileText, Globe } from "lucide-react";

export interface BibliographySuggestions {
  book?: { title: string; author: string; year?: string; url?: string };
  paper?: { title: string; org: string; url?: string };
  case?: { title: string; country: string; description: string };
}

interface BibliographyCardProps {
  data: BibliographySuggestions;
  className?: string;
}

export function BibliographyCard({ data, className = "" }: BibliographyCardProps) {
  const hasAny = data.book || data.paper || data.case;
  if (!hasAny) return null;

  return (
    <div
      className={`rounded-xl border border-[var(--line)] bg-[var(--cream)]/30 p-4 space-y-4 ${className}`}
      role="region"
      aria-label="Sugerencias para profundizar"
    >
      <p className="text-sm font-medium text-[var(--ink)]">
        Sugerencias para profundizar en el tema
      </p>
      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3">
        {data.book && (
          <a
            href={data.book.url ?? "#"}
            target={data.book.url ? "_blank" : undefined}
            rel={data.book.url ? "noopener noreferrer" : undefined}
            className="flex flex-col gap-2 p-3 rounded-xl border border-[var(--line)] bg-white hover:bg-[var(--cream)]/50 transition-colors text-left"
          >
            <BookOpen className="w-5 h-5 text-[var(--primary)] shrink-0" aria-hidden />
            <span className="text-xs font-medium text-[var(--ink-muted)] uppercase">Libro</span>
            <p className="font-medium text-[var(--ink)] text-sm">{data.book.title}</p>
            <p className="text-xs text-[var(--ink-muted)]">
              {data.book.author}
              {data.book.year && ` (${data.book.year})`}
            </p>
          </a>
        )}
        {data.paper && (
          <a
            href={data.paper.url ?? "#"}
            target={data.paper.url ? "_blank" : undefined}
            rel={data.paper.url ? "noopener noreferrer" : undefined}
            className="flex flex-col gap-2 p-3 rounded-xl border border-[var(--line)] bg-white hover:bg-[var(--cream)]/50 transition-colors text-left"
          >
            <FileText className="w-5 h-5 text-[var(--primary)] shrink-0" aria-hidden />
            <span className="text-xs font-medium text-[var(--ink-muted)] uppercase">Paper / Informe</span>
            <p className="font-medium text-[var(--ink)] text-sm">{data.paper.title}</p>
            <p className="text-xs text-[var(--ink-muted)]">{data.paper.org}</p>
          </a>
        )}
        {data.case && (
          <div className="flex flex-col gap-2 p-3 rounded-xl border border-[var(--line)] bg-white text-left">
            <Globe className="w-5 h-5 text-[var(--primary)] shrink-0" aria-hidden />
            <span className="text-xs font-medium text-[var(--ink-muted)] uppercase">Caso práctico</span>
            <p className="font-medium text-[var(--ink)] text-sm">{data.case.title}</p>
            <p className="text-xs text-[var(--ink-muted)]">{data.case.country}</p>
            <p className="text-xs text-[var(--ink)] mt-1">{data.case.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const BIBLIOGRAPHY_REGEX = /```bibliography\s*([\s\S]*?)```/;

/**
 * Extrae el JSON de sugerencias bibliográficas de un mensaje del asistente.
 * Retorna null si no hay bloque ```bibliography.
 */
export function parseBibliographyFromMessage(messageText: string): BibliographySuggestions | null {
  const match = messageText.match(BIBLIOGRAPHY_REGEX);
  if (!match) return null;
  try {
    const json = match[1].trim();
    const parsed = JSON.parse(json) as BibliographySuggestions;
    return parsed;
  } catch {
    return null;
  }
}

/** Quita el bloque ```bibliography ... ``` del texto para no mostrar JSON crudo al usuario. */
export function stripBibliographyBlock(messageText: string): string {
  return messageText.replace(BIBLIOGRAPHY_REGEX, "").replace(/\n{3,}/g, "\n\n").trim();
}
