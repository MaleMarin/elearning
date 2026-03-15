"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SurfaceCard, PageSection, PrimaryButton, SecondaryButton, EmptyState, Alert } from "@/components/ui";
import { ChevronLeft, Plus, Pencil, Trash2 } from "lucide-react";

type Question = {
  id: string;
  courseId: string;
  moduleId: string | null;
  question: string;
  type: string;
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: string;
  tags: string[];
  createdAt: string;
};

type Course = { id: string; title: string };

export default function AdminBancoPreguntasPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState({ courseId: "", moduleId: "", question: "", type: "multiple_choice" as const, options: ["", "", ""], correctAnswer: "", explanation: "", difficulty: "medium" as const, tags: "" });

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterCourse) params.set("courseId", filterCourse);
    if (filterDifficulty) params.set("difficulty", filterDifficulty);
    const res = await fetch(`/api/admin/quiz/questions?${params}`, { credentials: "include" });
    const data = await res.json();
    if (Array.isArray(data)) setQuestions(data);
  }, [filterCourse, filterDifficulty]);

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

  const openCreate = () => {
    setEditing(null);
    setForm({ courseId: courses[0]?.id ?? "", moduleId: "", question: "", type: "multiple_choice", options: ["", "", ""], correctAnswer: "", explanation: "", difficulty: "medium", tags: "" });
    setModalOpen(true);
  };

  const saveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      courseId: form.courseId,
      moduleId: form.moduleId || null,
      question: form.question.trim(),
      type: form.type,
      options: form.options.filter(Boolean),
      correctAnswer: form.correctAnswer.trim(),
      explanation: form.explanation.trim(),
      difficulty: form.difficulty,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    if (editing) {
      const res = await fetch(`/api/admin/quiz/questions/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error"); return; }
      setQuestions((prev) => prev.map((q) => (q.id === editing.id ? data : q)));
    } else {
      const res = await fetch("/api/admin/quiz/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error"); return; }
      setQuestions((prev) => [data, ...prev]);
    }
    setModalOpen(false);
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    const res = await fetch(`/api/admin/quiz/questions/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link href="/admin" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--ink)]">
          <ChevronLeft className="w-5 h-5" /> Admin
        </Link>
        <PrimaryButton onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Nueva pregunta
        </PrimaryButton>
      </div>
      <PageSection title="Banco de preguntas" subtitle="Crea preguntas y úsalas en quizzes por curso/módulo.">
        <></>
      </PageSection>
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]">
          <option value="">Todos los cursos</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]">
          <option value="">Todas las dificultades</option>
          <option value="easy">Fácil</option>
          <option value="medium">Media</option>
          <option value="hard">Difícil</option>
        </select>
      </div>
      {error && <Alert message={error} variant="error" className="mb-4" />}
      {loading ? (
        <p className="text-[var(--text-muted)]">Cargando…</p>
      ) : questions.length === 0 ? (
        <EmptyState title="Sin preguntas" description="Crea la primera pregunta para usar en quizzes." />
      ) : (
        <SurfaceCard padding="none" clickable={false}>
          <ul className="divide-y divide-[var(--line)]">
            {questions.map((q) => (
              <li key={q.id} className="p-4 flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--ink)] truncate">{q.question}</p>
                  <p className="text-sm text-[var(--text-muted)]">{q.type} · {q.difficulty}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setEditing(q); setForm({ courseId: q.courseId, moduleId: q.moduleId ?? "", question: q.question, type: q.type as "multiple_choice", options: q.options.length ? q.options : ["", "", ""], correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : String(q.correctAnswer), explanation: q.explanation, difficulty: q.difficulty as "medium", tags: q.tags.join(", ") }); setModalOpen(true); }} className="p-2 rounded-lg border border-[var(--line)] text-[var(--ink)]">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => deleteQuestion(q.id)} className="p-2 rounded-lg border border-[var(--line)] text-[var(--error)]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setModalOpen(false)}>
          <div className="bg-[var(--surface)] rounded-card-lg p-6 max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">{editing ? "Editar pregunta" : "Nueva pregunta"}</h3>
            <form onSubmit={saveQuestion} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Curso *</label>
                <select value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))} required className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]">
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Pregunta *</label>
                <textarea value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} required rows={2} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Tipo</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "multiple_choice" }))} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]">
                  <option value="multiple_choice">Opción múltiple</option>
                  <option value="true_false">Verdadero/Falso</option>
                  <option value="short_answer">Respuesta corta</option>
                </select>
              </div>
              {form.type === "multiple_choice" && (
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">Opciones (una por línea)</label>
                  <textarea value={form.options.join("\n")} onChange={(e) => setForm((f) => ({ ...f, options: e.target.value.split("\n").map((s) => s.trim()) }))} rows={4} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] font-mono text-sm" placeholder="Opción A\nOpción B" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Respuesta correcta *</label>
                <input type="text" value={form.correctAnswer} onChange={(e) => setForm((f) => ({ ...f, correctAnswer: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]" placeholder="Texto de la opción correcta o índice 0,1,2..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Explicación</label>
                <textarea value={form.explanation} onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Dificultad</label>
                <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as "medium" }))} className="w-full px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]">
                  <option value="easy">Fácil</option>
                  <option value="medium">Media</option>
                  <option value="hard">Difícil</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <PrimaryButton type="submit">Guardar</PrimaryButton>
                <SecondaryButton type="button" onClick={() => setModalOpen(false)}>Cancelar</SecondaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
