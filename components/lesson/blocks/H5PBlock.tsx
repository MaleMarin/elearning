"use client";

import { H5PPlayer } from "@/components/lesson/H5PPlayer";
import type { H5PBlock as H5PBlockType } from "@/lib/services/lessonBlocks";
import type { H5PContentPayload } from "@/lib/services/h5p";

interface H5PBlockProps {
  block: H5PBlockType;
  /** Contenido H5P ya cargado (evita request extra). */
  content?: H5PContentPayload | null;
  /** Para tracking xAPI (p. ej. video pausado). */
  lessonId?: string;
}

export function H5PBlock({ block, content, lessonId }: H5PBlockProps) {
  if (!content) {
    return (
      <div className="rounded-xl border border-[var(--line)] p-6 text-[var(--text-muted)]">
        Contenido interactivo no disponible (ID: {block.contentId}).
      </div>
    );
  }
  return <H5PPlayer content={content} title="Contenido interactivo" lessonId={lessonId} />;
}
