"use client";

import { useState, useEffect } from "react";
import { SurfaceCard } from "@/components/ui";
import { AlertTriangle } from "lucide-react";

interface StaleLesson {
  id: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  updatedAt: string;
}

interface StaleContentAlertProps {
  courseId: string;
}

export function StaleContentAlert({ courseId }: StaleContentAlertProps) {
  const [stale, setStale] = useState<StaleLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/admin/courses/${courseId}/stale-lessons`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setStale(d.lessons ?? []))
      .catch(() => setStale([]))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading || stale.length === 0) return null;

  return (
    <SurfaceCard padding="md" clickable={false} className="mb-6 border-amber-200 bg-amber-50/50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-[var(--ink)]">Contenido desactualizado</h3>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            {stale.length === 1
              ? "1 lección lleva más de 6 meses sin actualizar."
              : `${stale.length} lecciones llevan más de 6 meses sin actualizar.`}
          </p>
          <ul className="mt-2 space-y-1 list-none text-sm">
            {stale.slice(0, 10).map((l) => (
              <li key={l.id} className="text-amber-800">
                {l.title} <span className="text-[var(--ink-muted)]">({l.moduleTitle})</span>
              </li>
            ))}
            {stale.length > 10 && <li className="text-[var(--ink-muted)]">y {stale.length - 10} más…</li>}
          </ul>
        </div>
      </div>
    </SurfaceCard>
  );
}
