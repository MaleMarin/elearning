"use client";

import type { SeparatorBlock as SeparatorBlockType } from "@/lib/services/lessonBlocks";

export function SeparatorBlock({ block }: { block: SeparatorBlockType }) {
  return (
    <hr
      className="my-6 border-0 h-px bg-[var(--line)]"
      aria-hidden
    />
  );
}
