"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChecklistBlock as ChecklistBlockType } from "@/lib/services/lessonBlocks";

interface ChecklistBlockProps {
  block: ChecklistBlockType;
  lessonId: string;
  /** Estado inicial por item (itemId -> checked). Si no se pasa, se pide al API. */
  initialState?: Record<string, boolean>;
  onToggle?: (itemId: string, checked: boolean) => void;
}

export function ChecklistBlock({
  block,
  lessonId,
  initialState,
  onToggle,
}: ChecklistBlockProps) {
  const [state, setState] = useState<Record<string, boolean>>(initialState ?? {});

  useEffect(() => {
    if (initialState !== undefined) {
      setState(initialState);
      return;
    }
    fetch(`/api/lesson/checklist?lessonId=${encodeURIComponent(lessonId)}&blockId=${encodeURIComponent(block.id)}`)
      .then((r) => r.json())
      .then((d: { state?: Record<string, boolean> }) => setState(d?.state ?? {}))
      .catch(() => {});
  }, [lessonId, block.id, initialState]);

  const handleChange = useCallback(
    (itemId: string, checked: boolean) => {
      setState((prev) => ({ ...prev, [itemId]: checked }));
      onToggle?.(itemId, checked);
      fetch("/api/lesson/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId, blockId: block.id, itemId, checked }),
      }).catch(() => {});
    },
    [lessonId, block.id, onToggle]
  );

  return (
    <ul className="list-none my-4 space-y-2" role="list">
      {block.items.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          <input
            type="checkbox"
            id={`${block.id}-${item.id}`}
            checked={state[item.id] ?? item.checked ?? false}
            onChange={(e) => handleChange(item.id, e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-[var(--line)] text-[var(--primary)] focus:ring-[var(--primary)]"
            aria-label={item.text}
          />
          <label
            htmlFor={`${block.id}-${item.id}`}
            className={`text-[var(--ink)] cursor-pointer flex-1 ${state[item.id] ?? item.checked ? "line-through text-[var(--ink-muted)]" : ""}`}
          >
            {item.text}
          </label>
        </li>
      ))}
    </ul>
  );
}
