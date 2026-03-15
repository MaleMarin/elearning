"use client";

import { useState, useRef } from "react";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { FileUp, Loader2 } from "lucide-react";

export interface GeneratedLessonPreview {
  title: string;
  objective: string;
  blocks: { heading: string; body: string }[];
  quiz: { question: string; correctAnswer: string; wrongOptions: string[]; explanation: string }[];
}

interface AILessonGeneratorProps {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  orderIndex: number;
  onSaved: () => void;
  onError: (msg: string) => void;
}

export function AILessonGenerator({
  courseId,
  moduleId,
  moduleTitle,
  orderIndex,
  onSaved,
  onError,
}: AILessonGeneratorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<GeneratedLessonPreview | null>(null);
  const [editing, setEditing] = useState<GeneratedLessonPreview | null>(null);
  const [saving, setSaving] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (!f) setPreview(null);
  };

  const handleGenerate = async () => {
    if (!file) {
      onError("Selecciona un archivo PDF o PPT.");
      return;
    }
    setGenerating(true);
    onError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/generate-lesson", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar");
      setPreview(data.lesson);
      setEditing(JSON.parse(JSON.stringify(data.lesson)));
      setRemaining(data.remaining ?? null);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Error al generar");
    } finally {
      setGenerating(false);
    }
  };

  const buildContentFromBlocks = (blocks: { heading: string; body: string }[]): string => {
    return blocks.map((b) => `## ${b.heading}\n\n${b.body}`).join("\n\n");
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    onError("");
    try {
      const content = buildContentFromBlocks(editing.blocks);
      const res = await fetch(`/api/admin/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: editing.title,
          summary: editing.objective,
          content,
          order_index: orderIndex,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      setPreview(null);
      setEditing(null);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onSaved();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const updateBlock = (index: number, field: "heading" | "body", value: string) => {
    if (!editing) return;
    const next = [...editing.blocks];
    next[index] = { ...next[index], [field]: value };
    setEditing({ ...editing, blocks: next });
  };

  return (
    <SurfaceCard padding="lg" clickable={false} className="mb-6">
      <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">Generar desde archivo</h3>
      <p className="text-sm text-[var(--ink-muted)] mb-4">
        Sube un PDF o PPT (máx 10 MB). La IA generará título, objetivo, bloques de contenido y 3 preguntas de quiz. Revisa y edita antes de guardar.
      </p>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={handleFileChange}
          className="text-sm"
        />
        <PrimaryButton onClick={handleGenerate} disabled={generating || !file}>
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</> : <><FileUp className="w-4 h-4" /> Generar desde archivo</>}
        </PrimaryButton>
        {remaining != null && <span className="text-xs text-[var(--ink-muted)]">Generaciones hoy: {remaining} restantes</span>}
      </div>

      {editing && (
        <div className="border-t border-[var(--line)] pt-4 mt-4 space-y-4">
          <h4 className="font-medium text-[var(--ink)]">Vista previa (editable)</h4>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Título</label>
            <input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Objetivo de aprendizaje</label>
            <input
              value={editing.objective}
              onChange={(e) => setEditing({ ...editing, objective: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-2">Bloques de contenido</label>
            {editing.blocks.map((b, i) => (
              <div key={i} className="mb-3 p-3 rounded-lg border border-[var(--line)] bg-[var(--cream)]/20">
                <input
                  value={b.heading}
                  onChange={(e) => updateBlock(i, "heading", e.target.value)}
                  placeholder="Título del bloque"
                  className="w-full px-2 py-1 rounded border border-[var(--line)] bg-white text-sm mb-2"
                />
                <textarea
                  value={b.body}
                  onChange={(e) => updateBlock(i, "body", e.target.value)}
                  placeholder="Contenido (Markdown)"
                  rows={3}
                  className="w-full px-2 py-1 rounded border border-[var(--line)] bg-white text-sm resize-none"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--ink-muted)]">Las preguntas de quiz se pueden añadir después en el editor de la lección.</p>
          <div className="flex gap-2">
            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? "Guardando…" : `Guardar lección en "${moduleTitle}"`}
            </PrimaryButton>
            <SecondaryButton onClick={() => { setPreview(null); setEditing(null); }}>Descartar</SecondaryButton>
          </div>
        </div>
      )}
    </SurfaceCard>
  );
}
