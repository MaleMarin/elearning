"use client";

import { simpleMarkdownToHtml } from "@/lib/markdown";
import type { CalloutBlock as CalloutBlockType, CalloutVariant } from "@/lib/services/lessonBlocks";

const VARIANTS: Record<
  CalloutVariant,
  { icon: string; label: string; className: string }
> = {
  tip: {
    icon: "💡",
    label: "Tip",
    className: "bg-[var(--surface-soft)] border-[var(--line)] text-[var(--ink)]",
  },
  important: {
    icon: "⚠️",
    label: "Importante",
    className: "bg-amber-50 border-amber-200 text-amber-900",
  },
  remember: {
    icon: "📌",
    label: "Recuerda",
    className: "bg-blue-50 border-blue-200 text-blue-900",
  },
};

export function CalloutBlock({ block }: { block: CalloutBlockType }) {
  const v = VARIANTS[block.variant] ?? VARIANTS.tip;
  const title = block.title ?? v.label;
  const html = simpleMarkdownToHtml(block.content);
  return (
    <div
      className={`rounded-xl border p-4 ${v.className}`}
      role="note"
      aria-label={title}
    >
      <p className="font-semibold text-sm flex items-center gap-2 mb-2">
        <span aria-hidden>{v.icon}</span>
        {title}
      </p>
      {html && (
        <div
          className="text-sm prose prose-sm max-w-none prose-p:mb-2 last:prose-p:mb-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
