"use client";

import type { CodeBlock as CodeBlockType } from "@/lib/services/lessonBlocks";

export function CodeBlock({ block }: { block: CodeBlockType }) {
  return (
    <div className="my-4 rounded-xl border border-[var(--line)] overflow-hidden">
      {block.language && (
        <div className="px-3 py-1.5 text-xs text-[var(--ink-muted)] bg-[var(--cream)] border-b border-[var(--line)]">
          {block.language}
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm text-[var(--ink)] bg-[var(--surface-soft)] m-0">
        <code>{block.code}</code>
      </pre>
    </div>
  );
}
