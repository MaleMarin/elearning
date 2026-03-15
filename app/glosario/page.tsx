"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard, EmptyState } from "@/components/ui";
import { GlossaryTerm } from "@/components/glossary/GlossaryTerm";
import { ChevronLeft } from "lucide-react";

interface Term {
  id: string;
  term: string;
  officialDefinition: string;
  order?: number;
}

export default function GlosarioPage() {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch("/api/curso", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { course?: { id: string; title: string }; error?: string }) => {
        if (d?.course?.id) {
          setCourseId(d.course.id);
          setCourseTitle(d.course.title ?? null);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true));
  }, []);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/glossary/${courseId}/terms`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTerms(d.terms ?? []))
      .catch(() => setTerms([]))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (notFound) {
    return (
      <div className="max-w-2xl w-full">
        <EmptyState
          title="Sin curso asignado"
          description="El glosario está disponible cuando tienes un curso asignado."
          ctaLabel="Volver a inicio"
          ctaHref="/inicio"
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
        <span className="text-[var(--ink)] font-medium">Glosario</span>
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
          Glosario colaborativo
        </h1>
        <p className="text-sm text-[var(--ink-muted)] mb-4">
          {courseTitle ? `Términos del curso: ${courseTitle}. Puedes proponer definiciones y votar la mejor.` : "Términos clave del curso."}
        </p>

        {loading ? (
          <p className="text-[var(--ink-muted)]">Cargando términos…</p>
        ) : terms.length === 0 ? (
          <p className="text-[var(--ink-muted)]">Aún no hay términos en el glosario. El administrador puede agregarlos.</p>
        ) : (
          <ul className="space-y-4 list-none">
            {terms.map((t) => (
              <li key={t.id}>
                {courseId && (
                  <GlossaryTerm
                    courseId={courseId}
                    termId={t.id}
                    term={t.term}
                    officialDefinition={t.officialDefinition}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </SurfaceCard>
    </div>
  );
}
