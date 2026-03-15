"use client";

import { simpleMarkdownToHtml } from "@/lib/markdown";
import type { TextBlock as TextBlockType } from "@/lib/services/lessonBlocks";

export function TextBlock({ block }: { block: TextBlockType }) {
  const html = simpleMarkdownToHtml(block.content);
  if (!html) return null;
  return (
    <div
      className="reading-width prose prose-neutral text-[var(--ink)] prose-p:mb-3 prose-p:leading-relaxed prose-strong:font-semibold prose-a:text-[var(--primary)] prose-a:underline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
