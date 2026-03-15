"use client";

import { simpleMarkdownToHtml } from "@/lib/markdown";
import type { ListBlock as ListBlockType } from "@/lib/services/lessonBlocks";

export function ListBlock({ block }: { block: ListBlockType }) {
  const Tag = block.ordered ? "ol" : "ul";
  const listClass = block.ordered
    ? "list-decimal list-inside space-y-1 my-3"
    : "list-disc list-inside space-y-1 my-3";
  return (
    <Tag className={`text-[var(--ink)] ${listClass}`}>
      {block.items.map((item, i) => (
        <li key={i}>
          <span dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(item) }} />
        </li>
      ))}
    </Tag>
  );
}
