"use client";

import type { HeadingBlock as HeadingBlockType } from "@/lib/services/lessonBlocks";

export function HeadingBlock({ block }: { block: HeadingBlockType }) {
  const Tag = block.level === 2 ? "h2" : "h3";
  return (
    <Tag className="text-[var(--ink)] font-semibold mt-6 mb-2 first:mt-0">
      {block.content}
    </Tag>
  );
}
