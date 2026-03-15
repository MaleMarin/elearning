"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Sparkles, Loader2 } from "lucide-react";

export interface GeneratedCourseStructure {
  name: string;
  description: string;
  modules: { title: string; objective: string; bloom: string }[];
  lessons: { moduleIndex: number; title: string; type: "lectura" | "video" | "quiz" }[];
  evaluation: string;
  bloomByModule: string[];
}

interface CourseStructureGeneratorProps {
  onError: (msg: string) => void;
}

export function CourseStructureGenerator({ onError }: CourseStructureGeneratorProps) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [durationTotal, setDurationTotal] = useState("");
  const [level, setLevel] = useState("intermedio");
  const [generating, setGenerating] = useState(false);
  const [structure, setStructure] = useState<GeneratedCourseStructure | null>(null);
  const [creating, setCreating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      onError("Indica el tema del curso.");
      return;
    }
    setGenerating(true);
    onError("");
    try {
      const res = await fetch("/api/admin/generate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          topic: topic.trim(),
          audience: audience.trim() || "Funcionarios públicos",
          durationTotal: durationTotal.trim() || "8 horas",
          level: level.trim() || "intermedio",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar");
      setStructure(data.structure);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Error");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!structure) return;
    setCreating(true);
    onError("");
    try {
      const courseRes = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: structure.name,
          description: structure.description,
          status: "draft",
        }),
      });
      const courseData = await courseRes.json();
      if (!courseRes.ok) throw new Error(courseData.error ?? "Error al crear curso");
      const courseId = courseData.course?.id ?? courseData.courseId;
      if (!courseId) throw new Error("No se obtuvo id del curso");

      const moduleIds: string[] = [];
      for (let i = 0; i < structure.modules.length; i++) {
        const mod = structure.modules[i];
        const modRes = await fetch(`/api/admin/courses/${courseId}/modules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: mod.title,
            description: mod.objective,
            order_index: i,
            status: "draft",
          }),
        });
        const modData = await modRes.json();
        if (!modRes.ok) throw new Error(modData.error ?? "Error al crear módulo");
        const mid = modData.module?.id;
        if (mid) moduleIds.push(mid);
      }

      for (let i = 0; i < structure.lessons.length; i++) {
        const lec = structure.lessons[i];
        const moduleId = moduleIds[lec.moduleIndex];
        if (!moduleId) continue;
        await fetch(`/api/admin/modules/${moduleId}/lessons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: lec.title,
            summary: "",
            content: "",
            order_index: i,
            status: "draft",
          }),
        });
      }

      router.push(`/admin/cursos/${courseId}`);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setCreating(false);
    }
  };

  return (
    <SurfaceCard padding="lg" clickable={false}>
      <h3 className="text-lg font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[var(--primary)]" />
        Generar con IA
      </h3>
      <p className="text-sm text-[var(--ink-muted)] mb-4">
        Describe el curso y la IA generará nombre, descripción, 4-6 módulos con objetivos SMART, 3-4 lecciones por módulo y evaluación sugerida.
      </p>
      <div className="grid gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">Tema *</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ej. Política digital en salud" className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">Audiencia</label>
          <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ej. Funcionarios de nivel directivo" className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-sm" />
        </div>
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Duración total</label>
            <input value={durationTotal} onChange={(e) => setDurationTotal(e.target.value)} placeholder="8 horas" className="w-32 px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Nivel</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-sm">
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
        </div>
      </div>
      <PrimaryButton onClick={handleGenerate} disabled={generating}>
        {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</> : "Generar estructura"}
      </PrimaryButton>

      {structure && (
        <div className="mt-6 pt-6 border-t border-[var(--line)] space-y-4">
          <h4 className="font-medium text-[var(--ink)]">Vista previa</h4>
          <p><strong>{structure.name}</strong></p>
          <p className="text-sm text-[var(--ink-muted)]">{structure.description}</p>
          <div>
            <p className="text-sm font-medium text-[var(--ink)] mb-1">Módulos ({structure.modules.length})</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {structure.modules.map((m, i) => (
                <li key={i}>{m.title} — {m.bloom}</li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-[var(--ink-muted)]">Lecciones: {structure.lessons.length}. Evaluación: {structure.evaluation}</p>
          <div className="flex gap-2">
            <PrimaryButton onClick={handleCreate} disabled={creating}>
              {creating ? "Creando…" : "Crear curso en Firestore"}
            </PrimaryButton>
            <SecondaryButton onClick={() => setStructure(null)}>Descartar</SecondaryButton>
          </div>
        </div>
      )}
    </SurfaceCard>
  );
}
