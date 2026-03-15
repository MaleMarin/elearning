"use client";

import { useState } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { CourseStructureGenerator } from "@/components/admin/CourseStructureGenerator";
import { ChevronLeft, Sparkles } from "lucide-react";

export default function AdminGenerarCursoPage() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin/cursos"
            className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Cursos
          </Link>
        </div>
        <h1 className="text-xl font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[var(--primary)]" />
          Nuevo curso con IA
        </h1>
        <p className="text-sm text-[var(--ink-muted)] mb-6">
          Indica tema, audiencia, duración y nivel. La IA generará la estructura completa (módulos, lecciones, evaluación). Revisa y crea el curso con un clic.
        </p>
        {error && <Alert message={error} variant="error" className="mb-4" />}
        <CourseStructureGenerator onError={setError} />
      </div>
    </div>
  );
}
