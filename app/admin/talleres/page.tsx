"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SurfaceCard, PageSection, EmptyState, PrimaryButton, SecondaryButton } from "@/components/ui";
import { ChevronLeft } from "lucide-react";

type RubricCriterion = { id: string; label: string; maxScore: number };
type Workshop = { id: string; moduleId: string; title: string; description: string; rubric?: RubricCriterion[]; peerCount: number; deadline: string | null; reviewDeadline: string | null };
type Course = { id: string; title: string };
type Module = { id: string; title: string; order_index?: number };

export default function AdminTalleresPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courseId, setCourseId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    moduleId: "",
    title: "",
    description: "",
    rubric: [{ id: "c1", label: "Criterio 1", maxScore: 10 }] as RubricCriterion[],
    deadline: "",
    reviewDeadline: "",
    peerCount: 2,
  });
  const [saving, setSaving] = useState(false);

  const fetchWorkshops = useCallback(() => {
    fetch("/api/admin/workshops", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setWorkshops(Array.isArray(d) ? d : []))
      .catch(() => setWorkshops([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  useEffect(() => {
    fetch("/api/admin/courses", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const list = (d as { courses?: Course[] })?.courses ?? (Array.isArray(d) ? d : []);
        setCourses(list);
        if (list[0] && !courseId) setCourseId(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!courseId) { setModules([]); return; }
    fetch(`/api/admin/courses/${courseId}/modules`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setModules((d as { modules?: Module[] }).modules ?? []))
      .catch(() => setModules([]));
  }, [courseId]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      moduleId: modules[0]?.id ?? "",
      title: "",
      description: "",
      rubric: [{ id: "c1", label: "Criterio 1", maxScore: 10 }],
      deadline: "",
      reviewDeadline: "",
      peerCount: 2,
    });
    setShowForm(true);
  };

  const openEdit = async (w: Workshop) => {
    const res = await fetch(`/api/admin/workshops/${w.id}`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    setEditingId(w.id);
    setForm({
      moduleId: data.moduleId ?? w.moduleId,
      title: data.title ?? w.title,
      description: data.description ?? w.description ?? "",
      rubric: (data.rubric ?? w.rubric ?? []).length ? (data.rubric ?? w.rubric) : [{ id: "c1", label: "Criterio 1", maxScore: 10 }],
      deadline: data.deadline ?? w.deadline ?? "",
      reviewDeadline: data.reviewDeadline ?? w.reviewDeadline ?? "",
      peerCount: data.peerCount ?? w.peerCount ?? 2,
    });
    setShowForm(true);
  };

  const addCriterion = () => {
    setForm((f) => ({
      ...f,
      rubric: [...f.rubric, { id: `c-${Date.now()}`, label: `Criterio ${f.rubric.length + 1}`, maxScore: 10 }],
    }));
  };

  const updateCriterion = (idx: number, upd: Partial<RubricCriterion>) => {
    setForm((f) => ({
      ...f,
      rubric: f.rubric.map((r, i) => (i === idx ? { ...r, ...upd } : r)),
    }));
  };

  const removeCriterion = (idx: number) => {
    setForm((f) => ({ ...f, rubric: f.rubric.filter((_, i) => i !== idx) }));
  };

  const saveForm = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        moduleId: form.moduleId || modules[0]?.id,
        title: form.title.trim(),
        description: form.description.trim(),
        rubric: form.rubric,
        deadline: form.deadline.trim() || null,
        reviewDeadline: form.reviewDeadline.trim() || null,
        peerCount: form.peerCount,
      };
      if (editingId) {
        const res = await fetch(`/api/admin/workshops/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (res.ok) { setShowForm(false); fetchWorkshops(); }
      } else {
        const res = await fetch("/api/admin/workshops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (res.ok) { setShowForm(false); fetchWorkshops(); }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/admin" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--ink)] mb-6">
        <ChevronLeft className="w-5 h-5" /> Admin
      </Link>
      <PageSection title="Talleres (Peer Review)" subtitle="Actividades de entrega y evaluación entre pares.">
        <PrimaryButton onClick={openCreate}>Crear taller</PrimaryButton>
      </PageSection>

      {showForm && (
        <div style={{ background: "#e8eaf0", borderRadius: 18, padding: 24, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff", marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0a0f8a", marginBottom: 16 }}>{editingId ? "Editar taller" : "Nuevo taller"}</h3>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--ink)]">Curso</span>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="mt-1 block w-full max-w-md px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm">
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--ink)]">Módulo asociado</span>
              <select value={form.moduleId} onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value }))} className="mt-1 block w-full max-w-md px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm">
                <option value="">Seleccionar</option>
                {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--ink)]">Título</span>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título del taller" className="mt-1 block w-full max-w-md px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--ink)]">Descripción</span>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="mt-1 block w-full max-w-md px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm" />
            </label>
            <div>
              <span className="text-sm font-medium text-[var(--ink)]">Rúbrica (criterios y puntaje máximo)</span>
              <div className="mt-2 space-y-2">
                {form.rubric.map((r, idx) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <input type="text" value={r.label} onChange={(e) => updateCriterion(idx, { label: e.target.value })} placeholder="Etiqueta" className="flex-1 px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-sm" />
                    <input type="number" min={1} max={100} value={r.maxScore} onChange={(e) => updateCriterion(idx, { maxScore: Number(e.target.value) || 10 })} className="w-20 px-2 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-sm" />
                    <button type="button" onClick={() => removeCriterion(idx)} className="text-[var(--error)] text-sm">Quitar</button>
                  </div>
                ))}
                <button type="button" onClick={addCriterion} className="text-sm text-[var(--primary)]">+ Añadir criterio</button>
              </div>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-[var(--ink)]">Fecha límite entrega (ISO)</span>
              <input type="datetime-local" value={(form.deadline || "").slice(0, 16)} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value ? new Date(e.target.value).toISOString() : "" }))} className="mt-1 block w-full max-w-md px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--ink)]">Fecha límite revisión (ISO)</span>
              <input type="datetime-local" value={(form.reviewDeadline || "").slice(0, 16)} onChange={(e) => setForm((f) => ({ ...f, reviewDeadline: e.target.value ? new Date(e.target.value).toISOString() : "" }))} className="mt-1 block w-full max-w-md px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[var(--ink)]">Revisiones por par (peerCount)</span>
              <input type="number" min={1} max={10} value={form.peerCount} onChange={(e) => setForm((f) => ({ ...f, peerCount: Number(e.target.value) || 2 }))} className="mt-1 block w-24 px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm" />
            </label>
            <div className="flex gap-2">
              <PrimaryButton onClick={saveForm} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</PrimaryButton>
              <SecondaryButton onClick={() => setShowForm(false)}>Cancelar</SecondaryButton>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-[var(--text-muted)]">Cargando…</p>
      ) : workshops.length === 0 ? (
        <EmptyState title="Sin talleres" description="Crea el primer taller con el botón Crear taller." />
      ) : (
        <div className="space-y-4">
          {workshops.map((w) => (
            <SurfaceCard key={w.id} padding="md" clickable={false}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-[var(--ink)]">{w.title}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{w.description}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Módulo: {w.moduleId} · Evaluar {w.peerCount} pares</p>
                </div>
                <div className="flex gap-2">
                  <SecondaryButton onClick={() => openEdit(w)}>Editar</SecondaryButton>
                  <Link href={`/curso/taller/${w.id}`} className="text-sm text-[var(--primary)] hover:underline">Ver taller</Link>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </div>
  );
}
