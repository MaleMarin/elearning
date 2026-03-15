"use client";

import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import type { AdaptiveResult } from "@/lib/services/adaptivePath";
import { ChevronRight, MapPin } from "lucide-react";

interface RecommendedPathProps {
  path: AdaptiveResult;
  /** Módulos con título para mostrar en la lista. */
  modules: { id: string; title: string }[];
  /** Enlace al siguiente paso (lección o módulo). */
  nextStepHref: string | null;
}

/**
 * "Ruta recomendada para ti" con orden personalizado y siguiente paso.
 * El alumno puede ignorar y elegir su propio orden.
 */
export function RecommendedPath({ path, modules, nextStepHref }: RecommendedPathProps) {
  const order = path.suggestedModuleOrder;
  const moduleMap = new Map(modules.map((m) => [m.id, m.title]));

  return (
    <SurfaceCard padding="lg" clickable={false} className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[var(--ink)]">
        <MapPin className="w-5 h-5 text-[var(--primary)]" aria-hidden />
        <h2 className="text-lg font-semibold">Ruta recomendada para ti</h2>
      </div>
      {path.reason && (
        <p className="text-sm text-[var(--ink-muted)]">{path.reason}</p>
      )}
      <ol className="list-decimal list-inside space-y-1 text-sm text-[var(--ink)]">
        {order.map((moduleId) => (
          <li key={moduleId}>
            <span className="font-medium">{moduleMap.get(moduleId) ?? moduleId}</span>
          </li>
        ))}
      </ol>
      {nextStepHref && (
        <Link
          href={nextStepHref}
          className="btn-primary inline-flex items-center gap-2 w-fit"
        >
          {path.nextStep.label}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </SurfaceCard>
  );
}
