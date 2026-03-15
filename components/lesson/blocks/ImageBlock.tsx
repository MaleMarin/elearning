"use client";

import type { ImageBlock as ImageBlockType } from "@/lib/services/lessonBlocks";

export function ImageBlock({ block }: { block: ImageBlockType }) {
  return (
    <figure className="my-4">
      <img
        src={block.url}
        alt={block.alt ?? block.caption ?? "Imagen"}
        className="rounded-xl border border-[var(--line)] w-full h-auto max-w-2xl"
      />
      {block.caption && (
        <figcaption className="mt-2 text-sm text-[var(--ink-muted)]">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
