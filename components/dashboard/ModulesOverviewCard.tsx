"use client";

import { BookOpen } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ListRow } from "@/components/ui/ListRow";
import { EmptyState } from "@/components/ui/EmptyState";

interface ModuleItem {
  id: string;
  title: string;
  order_index: number;
  course_id?: string;
}

interface ModulesOverviewCardProps {
  modules: ModuleItem[];
  showDemoModules: boolean;
}

export function ModulesOverviewCard({ modules }: ModulesOverviewCardProps) {
  const list = modules;
  const courseId = modules[0]?.course_id ?? null;

  if (list.length === 0) {
    return (
      <SurfaceCard padding="lg" clickable={false} as="section" aria-labelledby="modules-heading">
        <h2 id="modules-heading" className="text-base font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--primary)]" />
          Tu curso
        </h2>
        <EmptyState
          title="Contenido en preparación"
          description="Tu contenido aparecerá aquí cuando el equipo publique el curso."
          ctaLabel="Ir a curso"
          ctaHref="/curso"
        />
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard padding="lg" clickable={false} as="section" aria-labelledby="modules-heading">
      <h2 id="modules-heading" className="text-base font-semibold text-[var(--ink)] mb-5 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-[var(--primary)]" />
        Tus módulos
      </h2>
      <ul className="space-y-1">
        {list.map((mod, i) => (
          <li key={mod.id}>
            <ListRow
              href="/curso"
              left={
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-[var(--neutral-soft)] text-[var(--muted)] group-hover:bg-[var(--primary-soft)] group-hover:text-[var(--primary)] transition-colors"
                  aria-hidden
                >
                  {i + 1}
                </span>
              }
              title={mod.title}
            />
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}
