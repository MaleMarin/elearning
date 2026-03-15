"use client";

import { simpleMarkdownToHtml } from "@/lib/markdown";
import type { QuoteBlock as QuoteBlockType } from "@/lib/services/lessonBlocks";

export function QuoteBlock({ block }: { block: QuoteBlockType }) {
  const html = simpleMarkdownToHtml(block.content);
  return (
    <blockquote className="border-l-4 border-[var(--primary)] pl-4 py-2 my-4 text-[var(--ink)] italic bg-[var(--cream)]/50 rounded-r-xl">
      {html && (
        <div
          className="prose prose-sm max-w-none prose-p:mb-1 last:prose-p:mb-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
      {block.attribution && (
        <cite className="block mt-2 text-sm text-[var(--ink-muted)] not-italic">
          — {block.attribution}
        </cite>
      )}
    </blockquote>
  );
}
