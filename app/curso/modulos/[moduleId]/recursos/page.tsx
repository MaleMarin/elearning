"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SurfaceCard, EmptyState } from "@/components/ui";
import { ResourceLibrary } from "@/components/learning/ResourceLibrary";
import { DidYouKnow } from "@/components/community/DidYouKnow";
import { ChevronLeft } from "lucide-react";

export default function ModuloRecursosPage() {
  const params = useParams();
  const moduleId = String(params?.moduleId ?? "");
  const [moduleTitle, setModuleTitle] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!moduleId) {
      setNotFound(true);
      return;
    }
    fetch("/api/curso")
      .then((r) => r.json())
      .then((d: { modules?: { id: string; title: string }[] }) => {
        const mod = d?.modules?.find((m) => m.id === moduleId);
        if (mod) setModuleTitle(mod.title);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [moduleId]);

  if (notFound || !moduleId) {
    return (
      <div className="max-w-2xl w-full">
        <EmptyState
          title="Módulo no encontrado"
          description="No tienes acceso a este módulo o no existe."
          ctaLabel="Volver al curso"
          ctaHref="/curso"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full space-y-6">
      <nav className="text-sm text-[var(--ink-muted)]" aria-label="Breadcrumb">
        <Link href="/curso" className="hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded">
          Curso
        </Link>
        {" · "}
        <span className="text-[var(--ink)] font-medium">
          Recursos{moduleTitle ? ` · ${moduleTitle}` : ""}
        </span>
      </nav>

      <div className="flex items-center gap-4">
        <Link
          href="/curso"
          className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden />
          Volver al curso
        </Link>
      </div>

      <SurfaceCard padding="lg" clickable={false}>
        <h1 className="text-xl font-semibold text-[var(--ink)] mb-2">
          Biblioteca de recursos
        </h1>
        <p className="text-sm text-[var(--ink-muted)] mb-4">
          Material complementario del módulo. Marca como revisado al abrir cada recurso.
        </p>
        <ResourceLibrary moduleId={moduleId} />
        <DidYouKnow moduleId={moduleId} />
      </SurfaceCard>
    </div>
  );
}
