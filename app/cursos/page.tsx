"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

interface CourseRow {
  id: string;
  title: string;
  status: string;
}

export default function CursosPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses ?? []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Curso</h1>
        <div className="card-white p-6 animate-pulse">
          <div className="h-5 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  const published = courses.filter((c) => c.status === "published");

  if (published.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Curso</h1>
        <EmptyState
          title="No hay cursos disponibles"
          description="Aún no tienes inscripción a un curso o no hay lecciones publicadas. Cuando te asignen un programa podrás ver el contenido aquí."
          ctaLabel="Volver al inicio"
          ctaHref="/"
          icon="📚"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Curso</h1>
      <p className="text-[var(--text-muted)] mb-6">
        Tus cursos. Entra a una lección para usar el tutor.
      </p>
      <ul className="space-y-3">
        {published.map((c) => (
          <li key={c.id}>
            <Link
              href={`/cursos/${c.id}`}
              className="card-white p-4 block hover:shadow-md transition-shadow text-[var(--text)] font-medium"
            >
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
