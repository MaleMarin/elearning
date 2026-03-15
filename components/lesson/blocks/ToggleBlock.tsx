"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { simpleMarkdownToHtml } from "@/lib/markdown";
import type { ToggleBlock as ToggleBlockType } from "@/lib/services/lessonBlocks";

export function ToggleBlock({ block }: { block: ToggleBlockType }) {
  const [open, setOpen] = useState(false);
  const html = simpleMarkdownToHtml(block.content);
  return (
    <div className="rounded-xl border border-[var(--line)] overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left font-medium text-[var(--ink)] hover:bg-[var(--cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]"
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="w-4 h-4 shrink-0 text-[var(--ink-muted)]" aria-hidden />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0 text-[var(--ink-muted)]" aria-hidden />
        )}
        {block.title}
      </button>
      {open && html && (
        <div
          className="px-4 pb-4 pt-1 border-t border-[var(--line)] prose prose-sm max-w-none text-[var(--ink)]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
