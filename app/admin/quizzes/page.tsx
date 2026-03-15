"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SurfaceCard, PageSection, PrimaryButton, SecondaryButton, EmptyState, Alert } from "@/components/ui";
import { ChevronLeft, Plus, BarChart3 } from "lucide-react";

type Quiz = {
  id: string;
  courseId: string;
  title: string;
  questionCount: number;
  passingScore: number;
  timeLimit: number;
  maxAttempts: number;
  moduleId: string | null;
  createdAt: string;
  updatedAt: string;
};

type Course = { id: string; title: string };

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ courseId: "", title: "", questionCount: 5, passingScore: 60, timeLimit: 0, maxAttempts: 0, randomizeQuestions: true, randomizeOptions: true, showExplanations: true, moduleId: "" });
  const [stats, setStats] = useState<Record<string, { totalAttempts: number; passedCount: number; passPercent: number }>>({});

  const load = useCallback(async () => {
    const params = filterCourse ? `?courseId=${encodeURIComponent(filterCourse)}` : "";
    const res = await fetch(`/api/admin/quiz/quizzes${params}`, { credentials: "include" });
    const data = await res.json();
    if (Array.isArray(data)) setQuizzes(data);
    else if (data?.error) setQuizzes([]);
  }, [filterCourse]);

  useEffect(() => {
    fetch("/api/admin/courses", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCourses(Array.isArray(d?.courses) ? d.courses : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const loadStats = useCallback((quizId: string) => {
    fetch(`/api/admin/quiz/quizzes/${quizId}/stats`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setStats((prev) => ({ ...prev, [quizId]: d })))
      .catch(() => {});
  }, []);

  useEffect(() => {
    quizzes.forEach((q) => loadStats(q.id));
  }, [quizzes, loadStats]);

  const openCreate = () => {
    setForm({ courseId: courses[0]?.id ?? "", title: "", questionCount: 5, passingScore: 60, timeLimit: 0, maxAttempts: 0, randomizeQuestions: true, randomizeOptions: true, showExplanations: true, moduleId: "" });
    setModalOpen(true);
  };

  const saveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/quiz/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        courseId: form.courseId,
        title: form.title.trim(),
        questionCount: form.questionCount,
        passingScore: form.passingScore,
        timeLimit: form.timeLimit,
        maxAttempts: form.maxAttempts,
        randomizeQuestions: form.randomizeQuestions,
        randomizeOptions: form.randomizeOptions,
        showExplanations: form.showExplanations,
        moduleId: form.moduleId || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Error"); return; }
    setQuizzes((prev) => [data, ...prev]);
    setModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link href="/admin" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--ink)]">
          <ChevronLeft className="w-5 h-5" /> Admin
        </Link>
        <PrimaryButton onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo quiz
        </PrimaryButton>
      </div>
      <PageSection title="Quizzes" subtitle="Configura quizzes que toman preguntas del banco por curso/módulo.">
        <></>
      </PageSection>
      <div className="mb-4">
        <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]">
          <option value="">Todos los cursos</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>
      {error && <Alert message={error} variant="error" className="mb-4" />}
      {loading ? (
        <p className="text-[var(--text-muted)]">Cargando…</p>
      ) : quizzes.length === 0 ? (
        <EmptyState title="Sin quizzes" description="Crea un quiz y asócialo a un curso." />
      ) : (
        <div className="space-y-4">
          {quizzes.map((q) => (
            <SurfaceCard key={q.id} padding="md" clickable={false}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-[var(--ink)]">{q.title}</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {q.questionCount} preguntas · Aprobación {q.passingScore}% · Límite {q.timeLimit || "sin"} min · Máx intentos {q.maxAttempts || "∞"}
                  </p>
                  {stats[q.id] && (
                    <p className="text-sm text-[var(--primary)] mt-1 flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      {stats[q.id].totalAttempts} intentos · {stats[q.id].passPercent.toFixed(0)}% aprobados
                    </p>
                  )}
                </div>
                <Link href={`/curso/quiz/${q.id}`} className="text-sm text-[var(--primary)] hover:underline">
                  Ver quiz
                </Link>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="bg-[var(--surface)] rounded-card-lg p-6 max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">Nuevo quiz</h3>
            <form onSubmit={saveQuiz} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Curso *</label>
                <select value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]">
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Título *</label>
                <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">Nº preguntas</label>
                  <input type="number" min={1} value={form.questionCount} onChange={(e) => setForm((f) => ({ ...f, questionCount: Number(e.target.value) || 1 }))} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">% aprobación</label>
                  <input type="number" min={0} max={100} value={form.passingScore} onChange={(e) => setForm((f) => ({ ...f, passingScore: Number(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">Límite (min, 0=sin)</label>
                  <input type="number" min={0} value={form.timeLimit} onChange={(e) => setForm((f) => ({ ...f, timeLimit: Number(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">Máx intentos (0=∞)</label>
                  <input type="number" min={0} value={form.maxAttempts} onChange={(e) => setForm((f) => ({ ...f, maxAttempts: Number(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]" />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.randomizeQuestions} onChange={(e) => setForm((f) => ({ ...f, randomizeQuestions: e.target.checked }))} /> Preguntas aleatorias</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.showExplanations} onChange={(e) => setForm((f) => ({ ...f, showExplanations: e.target.checked }))} /> Mostrar explicaciones</label>
              </div>
              <div className="flex gap-2 pt-2">
                <PrimaryButton type="submit">Crear quiz</PrimaryButton>
                <SecondaryButton type="button" onClick={() => setModalOpen(false)}>Cancelar</SecondaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
