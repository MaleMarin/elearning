"use client";

import type { VideoEmbedBlock as VideoEmbedBlockType } from "@/lib/services/lessonBlocks";

function normalizeEmbedUrl(url: string): string {
  const u = url.trim();
  if (u.includes("youtube.com/watch?v=")) {
    const match = u.match(/v=([^&]+)/);
    const id = match?.[1];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  if (u.includes("youtu.be/")) {
    const id = u.split("youtu.be/")[1]?.split("?")[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  if (u.includes("loom.com/share/")) {
    const match = u.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    const id = match?.[1];
    if (id) return `https://www.loom.com/embed/${id}`;
  }
  return u;
}

export function VideoEmbedBlock({ block }: { block: VideoEmbedBlockType }) {
  const embedUrl = normalizeEmbedUrl(block.url);
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--line-subtle)] bg-[var(--ink)] aspect-video my-4">
      <iframe
        src={embedUrl}
        title="Video embebido"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
