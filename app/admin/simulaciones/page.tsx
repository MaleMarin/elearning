"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { ChevronLeft, Plus, Pencil, Trash2, GitBranch } from "lucide-react";
import type { MicroSimulation, SimulationOption } from "@/lib/services/simulations";

export default function AdminSimulacionesPage() {
  const [simulations, setSimulations] = useState<MicroSimulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MicroSimulation | null>(null);
  const [form, setForm] = useState({
    scenario: "",
    options: [{ text: "", outcome: "" }],
    reflection: "",
    moduleId: "",
    lessonId: "",
    order: 0,
  });

  const load = () => {
    fetch("/api/admin/simulaciones", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSimulations(d.simulations ?? []))
      .catch(() => setSimulations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, { text: "", outcome: "" }] }));
  const removeOption = (i: number) =>
    setForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));
  const updateOption = (i: number, field: "text" | "outcome", value: string) =>
    setForm((f) => ({
      ...f,
      options: f.options.map((o, idx) => (idx === i ? { ...o, [field]: value } : o)),
    }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const options = form.options.filter((o) => o.text.trim() || o.outcome.trim());
    if (options.length === 0) {
      options.push({ text: "Opción", outcome: "Consecuencia" });
    }
    const body = {
      id: editing?.id,
      scenario: form.scenario,
      options,
      reflection: form.reflection,
      moduleId: form.moduleId.trim() || null,
      lessonId: form.lessonId.trim() || null,
      order: form.order,
    };
    const url = editing ? `/api/admin/simulaciones/${editing.id}` : "/api/admin/simulaciones";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) return;
    load();
    setFormOpen(false);
    setEditing(null);
    setForm({ scenario: "", options: [{ text: "", outcome: "" }], reflection: "", moduleId: "", lessonId: "", order: 0 });
  };

  const startEdit = (s: MicroSimulation) => {
    setEditing(s);
    setForm({
      scenario: s.scenario,
      options: s.options?.length ? s.options : [{ text: "", outcome: "" }],
      reflection: s.reflection ?? "",
      moduleId: s.moduleId ?? "",
      lessonId: s.lessonId ?? "",
      order: s.order ?? 0,
    });
    setFormOpen(true);
  };

  const deleteOne = async (id: string) => {
    if (!confirm("¿Eliminar esta micro-simulación?")) return;
    await fetch(`/api/admin/simulaciones/${id}`, { method: "DELETE", credentials: "include" });
    load();
  };

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] text-sm mb-6">
          <ChevronLeft className="w-4 h-4" /> Admin
        </Link>
        <h1 className="text-xl font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-[var(--primary)]" />
          Micro-simulaciones
        </h1>
        <p className="text-sm text-[var(--ink-muted)] mb-6">
          Escenarios de decisión de ~2 min. Asocia cada una a un módulo (o lección) para que aparezca en el curso.
        </p>
        {loading ? (
          <p className="text-[var(--ink-muted)]">Cargando…</p>
        ) : formOpen ? (
          <SurfaceCard padding="lg" clickable={false}>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Escenario</label>
                <textarea
                  value={form.scenario}
                  onChange={(e) => setForm((f) => ({ ...f, scenario: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white"
                  placeholder="Eres jefe de división. Tu equipo rechaza..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-2">Opciones (texto y consecuencia)</label>
                {form.options.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-start">
                    <input
                      value={opt.text}
                      onChange={(e) => updateOption(i, "text", e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl border border-[var(--line)] bg-white"
                      placeholder="Texto de la opción"
                    />
                    <input
                      value={opt.outcome}
                      onChange={(e) => updateOption(i, "outcome", e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl border border-[var(--line)] bg-white"
                      placeholder="Consecuencia"
                    />
                    <button type="button" onClick={() => removeOption(i)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addOption} className="text-sm text-[var(--primary)] hover:underline">
                  + Añadir opción
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Pregunta de reflexión</label>
                <input
                  value={form.reflection}
                  onChange={(e) => setForm((f) => ({ ...f, reflection: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white"
                  placeholder="¿Qué habría cambiado si...?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">ID módulo (opcional)</label>
                  <input
                    value={form.moduleId}
                    onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">ID lección (opcional)</label>
                  <input
                    value={form.lessonId}
                    onChange={(e) => setForm((f) => ({ ...f, lessonId: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <PrimaryButton type="submit">Guardar</PrimaryButton>
                <SecondaryButton type="button" onClick={() => { setFormOpen(false); setEditing(null); }}>
                  Cancelar
                </SecondaryButton>
              </div>
            </form>
          </SurfaceCard>
        ) : (
          <>
            <PrimaryButton onClick={() => { setFormOpen(true); setEditing(null); setForm({ scenario: "", options: [{ text: "", outcome: "" }], reflection: "", moduleId: "", lessonId: "", order: 0 }); }} className="mb-4 inline-flex gap-2">
              <Plus className="w-4 h-4" /> Nueva micro-simulación
            </PrimaryButton>
            <ul className="space-y-3">
              {simulations.map((s) => (
                <li key={s.id}>
                  <SurfaceCard padding="md" clickable={false} className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--ink)] line-clamp-2">{s.scenario}</p>
                      <p className="text-sm text-[var(--ink-muted)] mt-1">
                        {s.options?.length ?? 0} opciones
                        {(s.moduleId || s.lessonId) && ` · ${s.moduleId ? `Módulo ${s.moduleId}` : ""} ${s.lessonId ? `Lección ${s.lessonId}` : ""}`}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button type="button" onClick={() => startEdit(s)} className="p-2 rounded-lg hover:bg-[var(--cream)] text-[var(--ink-muted)]">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => deleteOne(s.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </SurfaceCard>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
