"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { ChevronLeft, MessageCircle, Pencil } from "lucide-react";

type Scenario = { id: string; title: string; characterPrompt: string; openingLine: string; order: number };

export default function AdminRoleplayPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Scenario | null>(null);
  const [form, setForm] = useState({ title: "", characterPrompt: "", openingLine: "", order: 0 });

  useEffect(() => {
    fetch("/api/admin/roleplay/scenarios", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setScenarios(d.scenarios ?? []))
      .catch(() => setScenarios([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/roleplay/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id: editing?.id,
        title: form.title,
        characterPrompt: form.characterPrompt,
        openingLine: form.openingLine,
        order: form.order,
      }),
    });
    const data = await res.json();
    if (!res.ok) return;
    setScenarios((prev) => {
      const next = prev.filter((s) => s.id !== (data.scenario?.id ?? editing?.id));
      if (data.scenario) next.push(data.scenario);
      return next.sort((a, b) => a.order - b.order);
    });
    setEditing(null);
    setForm({ title: "", characterPrompt: "", openingLine: "", order: 0 });
  };

  const startEdit = (s: Scenario) => {
    setEditing(s);
    setForm({ title: s.title, characterPrompt: s.characterPrompt, openingLine: s.openingLine, order: s.order ?? 0 });
  };

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] text-sm mb-6">
          <ChevronLeft className="w-4 h-4" /> Admin
        </Link>
        <h1 className="text-xl font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-[var(--primary)]" />
          Escenarios de roleplay
        </h1>
        <p className="text-sm text-[var(--ink-muted)] mb-6">
          Los alumnos practican conversaciones con el bot. Edita título, personaje y frase de apertura.
        </p>
        {loading ? (
          <p className="text-[var(--ink-muted)]">Cargando…</p>
        ) : editing ? (
          <SurfaceCard padding="lg" clickable={false}>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Título</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Personaje (instrucción para el bot)</label>
                <textarea value={form.characterPrompt} onChange={(e) => setForm((f) => ({ ...f, characterPrompt: e.target.value }))} rows={3} className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Frase de apertura</label>
                <input value={form.openingLine} onChange={(e) => setForm((f) => ({ ...f, openingLine: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white" required />
              </div>
              <div className="flex gap-2">
                <PrimaryButton type="submit">Guardar</PrimaryButton>
                <SecondaryButton type="button" onClick={() => setEditing(null)}>Cancelar</SecondaryButton>
              </div>
            </form>
          </SurfaceCard>
        ) : (
          <ul className="space-y-3">
            {scenarios.map((s) => (
              <li key={s.id}>
                <SurfaceCard padding="md" clickable={false} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-[var(--ink)]">{s.title}</p>
                    <p className="text-sm text-[var(--ink-muted)] line-clamp-2">{s.openingLine}</p>
                  </div>
                  <button type="button" onClick={() => startEdit(s)} className="p-2 rounded-lg hover:bg-[var(--cream)] text-[var(--ink-muted)]">
                    <Pencil className="w-4 h-4" />
                  </button>
                </SurfaceCard>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
