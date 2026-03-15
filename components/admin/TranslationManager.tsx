"use client";

import { useState } from "react";
import { SurfaceCard, PrimaryButton } from "@/components/ui";
import { Languages, Loader2 } from "lucide-react";

interface TranslationManagerProps {
  courseId: string;
}

export function TranslationManager({ courseId }: TranslationManagerProps) {
  const [targetLang, setTargetLang] = useState<"en" | "pt">("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ translated: number; errors: string[] } | null>(null);

  const handleTranslate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/translate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ courseId, targetLanguage: targetLang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setResult({ translated: data.translated ?? 0, errors: data.errors ?? [] });
    } catch (e) {
      setResult({ translated: 0, errors: [e instanceof Error ? e.message : "Error"] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SurfaceCard padding="lg" clickable={false} className="mb-6">
      <h3 className="text-lg font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
        <Languages className="w-5 h-5 text-[var(--primary)]" />
        Traducir curso
      </h3>
      <p className="text-sm text-[var(--ink-muted)] mb-4">
        Genera traducciones del curso (título, descripción, módulos y lecciones) con IA. El alumno puede elegir idioma en su perfil.
      </p>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value as "en" | "pt")}
          className="px-4 py-2 rounded-xl border border-[var(--line)] bg-white text-[var(--ink)]"
        >
          <option value="en">English</option>
          <option value="pt">Português</option>
        </select>
        <PrimaryButton onClick={handleTranslate} disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Traduciendo…</> : "Traducir curso"}
        </PrimaryButton>
      </div>
      {result && (
        <div className="text-sm">
          <p className="text-[var(--ink)]">Traducidas: {result.translated} lecciones (+ curso y módulos).</p>
          {result.errors.length > 0 && (
            <p className="text-amber-700 mt-1">Errores: {result.errors.join("; ")}</p>
          )}
        </div>
      )}
    </SurfaceCard>
  );
}
