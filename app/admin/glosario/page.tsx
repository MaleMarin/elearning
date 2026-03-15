"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard, PrimaryButton } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { ChevronLeft, Plus } from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface Term {
  id: string;
  term: string;
  officialDefinition: string;
}

export default function AdminGlosarioPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState("");
  const [officialDefinition, setOfficialDefinition] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/courses", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCourses(Array.isArray(d.courses) ? d.courses : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setTerms([]);
      return;
    }
    fetch(`/api/glossary/${selectedCourseId}/terms`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTerms(d.terms ?? []))
      .catch(() => setTerms([]));
  }, [selectedCourseId]);

  const handleAddTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !term.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/glossary/${selectedCourseId}/terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          term: term.trim(),
          officialDefinition: officialDefinition.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear");
      setTerms((prev) => [...prev, { id: data.id, term: data.term, officialDefinition: data.officialDefinition ?? "" }]);
      setTerm("");
      setOfficialDefinition("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Admin
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-[var(--ink)] mb-4">Glosario por curso</h1>

        {loading ? (
          <p className="text-[var(--ink-muted)]">Cargando cursos…</p>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--ink)] mb-2">Curso</label>
            <select
              value={selectedCourseId ?? ""}
              onChange={(e) => setSelectedCourseId(e.target.value || null)}
              className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)]"
            >
              <option value="">— Seleccionar curso —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <Alert message={error} variant="error" className="mb-4" />}

        {selectedCourseId && (
          <SurfaceCard padding="lg" clickable={false}>
            <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Términos del curso</h2>
            <form onSubmit={handleAddTerm} className="mb-6 space-y-3">
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Término *"
                required
                className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)]"
              />
              <textarea
                value={officialDefinition}
                onChange={(e) => setOfficialDefinition(e.target.value)}
                placeholder="Definición oficial (base para la cohorte)"
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)]"
              />
              <PrimaryButton type="submit" disabled={submitting}>
                <Plus className="w-4 h-4" />
                Agregar término
              </PrimaryButton>
            </form>
            <ul className="space-y-2 list-none">
              {terms.map((t) => (
                <li key={t.id} className="py-2 px-3 rounded-lg bg-[var(--cream)]/50 border border-[var(--line)]">
                  <p className="font-medium text-[var(--ink)]">{t.term}</p>
                  <p className="text-sm text-[var(--ink-muted)] mt-1">{t.officialDefinition}</p>
                </li>
              ))}
            </ul>
            {terms.length === 0 && (
              <p className="text-sm text-[var(--ink-muted)]">Aún no hay términos. Agrega uno arriba.</p>
            )}
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
