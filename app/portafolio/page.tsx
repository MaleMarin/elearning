"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import type { PortfolioProject } from "@/lib/types/portfolio";
import type { CursoApiResponse } from "@/app/api/curso/route";
import { MessageCircle, ArrowRight, Loader2, CheckCircle2, FolderOpen } from "lucide-react";

const ESTADOS: { value: PortfolioProject["estadoProyecto"]; label: string }[] = [
  { value: "idea", label: "Solo idea" },
  { value: "en_progreso", label: "En progreso" },
  { value: "implementado", label: "Implementado" },
  { value: "escalado", label: "Escalado" },
];

type FormState = {
  titulo: string;
  institucion: string;
  problema: string;
  solucion: string;
  resultado: string;
  ciudadanosBeneficiados: string;
  modulos: string[];
  evidencias: string[];
  estadoProyecto: PortfolioProject["estadoProyecto"];
  fechaInicio: string;
  publico: boolean;
};

/** Claves de FormState que se usan en los pasos del wizard. */
type FormFieldKey = keyof Pick<
  FormState,
  "titulo" | "institucion" | "problema" | "solucion" | "resultado" | "ciudadanosBeneficiados" | "modulos" | "evidencias"
>;

const PASOS: { key: string; pregunta: string; hint?: string; fields: readonly FormFieldKey[] }[] = [
  {
    key: "problema",
    pregunta: "¿Qué problema identificaste en tu institución gracias al programa?",
    hint: "Indica también el título del proyecto y la institución.",
    fields: ["titulo", "institucion", "problema"],
  },
  {
    key: "solucion",
    pregunta: "¿Qué solución diseñaste o implementaste?",
    hint: "Describe la solución de forma concreta.",
    fields: ["solucion"],
  },
  {
    key: "resultado",
    pregunta: "¿Cuál fue el resultado o impacto medible? ¿Cuántos ciudadanos o empleados se beneficiaron?",
    hint: "Resultado en una frase y número de beneficiarios.",
    fields: ["resultado", "ciudadanosBeneficiados"],
  },
  {
    key: "modulos",
    pregunta: "¿Qué módulos del programa usaste para llegar a esta solución?",
    hint: "Selecciona los que apliquen.",
    fields: ["modulos"],
  },
  {
    key: "evidencias",
    pregunta: "¿Tienes alguna evidencia? (foto, documento, captura) — puedes pegar URLs.",
    hint: "Una URL por línea.",
    fields: ["evidencias"],
  },
];

const initialForm: FormState = {
  titulo: "",
  institucion: "",
  problema: "",
  solucion: "",
  resultado: "",
  ciudadanosBeneficiados: "",
  modulos: [],
  evidencias: [],
  estadoProyecto: "en_progreso",
  fechaInicio: new Date().toISOString().slice(0, 10),
  publico: false,
};

export default function PortafolioPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [stepIndex, setStepIndex] = useState(0);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [curso, setCurso] = useState<CursoApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [evaluando, setEvaluando] = useState(false);
  const [evaluacion, setEvaluacion] = useState<{ evaluacionClaude: string; scoreImpacto: number; sugerencias?: string[] } | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/portafolio", { credentials: "include" }).then((r) => (r.ok ? r.json() : { projects: [] })),
      fetch("/api/curso", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([portRes, cursoRes]) => {
        if (portRes?.projects) setProjects(portRes.projects);
        if (cursoRes && !("error" in cursoRes)) setCurso(cursoRes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const step = PASOS[stepIndex];
  const isLastStep = stepIndex === PASOS.length - 1;
  const isReview = stepIndex === PASOS.length;

  const canAdvance = useCallback(() => {
    if (!step) return false;
    if (step.fields.includes("problema")) return form.problema.trim().length > 0;
    if (step.fields.includes("solucion")) return form.solucion.trim().length > 0;
    if (step.fields.includes("resultado")) return form.resultado.trim().length > 0;
    if (step.fields.includes("ciudadanosBeneficiados")) return form.ciudadanosBeneficiados.trim().length > 0 && !Number.isNaN(Number(form.ciudadanosBeneficiados));
    if (step.fields.includes("modulos")) return true;
    if (step.fields.includes("evidencias")) return true;
    return false;
  }, [step, form]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      setStepIndex(PASOS.length);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, PASOS.length));
  }, [isLastStep]);

  const handleBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/portafolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          titulo: form.titulo.trim() || "Proyecto de transformación",
          institucion: form.institucion.trim(),
          problema: form.problema.trim(),
          solucion: form.solucion.trim(),
          resultado: form.resultado.trim(),
          ciudadanosBeneficiados: Math.max(0, parseInt(form.ciudadanosBeneficiados, 10) || 0),
          modulos: form.modulos,
          evidencias: form.evidencias.filter(Boolean),
          estadoProyecto: form.estadoProyecto,
          fechaInicio: form.fechaInicio || new Date().toISOString().slice(0, 10),
          publico: form.publico ?? false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      const project = data.project as PortfolioProject;
      setCreatedId(project.id);
      setProjects((prev) => [project, ...prev]);

      setEvaluando(true);
      const evalRes = await fetch("/api/portafolio/evaluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          projectId: project.id,
          titulo: project.titulo,
          institucion: project.institucion,
          problema: project.problema,
          solucion: project.solucion,
          resultado: project.resultado,
          ciudadanosBeneficiados: project.ciudadanosBeneficiados,
          modulos: project.modulos,
        }),
      });
      const evalData = await evalRes.json();
      if (evalRes.ok && evalData.evaluacion) {
        setEvaluacion(evalData.evaluacion);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
      setEvaluando(false);
    }
  }, [form]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" aria-hidden />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <p className="section-label mb-1">Brecha 5</p>
        <h1 className="heading-section">Portafolio de transformación</h1>
        <p className="text-[var(--ink-muted)] mt-2">
          Documenta un proyecto real que implementaste gracias al programa. El bot te guía en 5 pasos.
        </p>
      </div>

      {evaluacion ? (
        <SurfaceCard padding="lg" clickable={false}>
          <div className="flex items-center gap-2 text-[var(--primary)] mb-4">
            <CheckCircle2 className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Proyecto guardado y evaluado</h2>
          </div>
          <p className="text-sm text-[var(--ink-muted)] mb-4">Puntuación de impacto: {evaluacion.scoreImpacto}/100</p>
          <div className="prose prose-sm max-w-none text-[var(--ink)] mb-4 whitespace-pre-wrap">
            {evaluacion.evaluacionClaude}
          </div>
          {evaluacion.sugerencias && evaluacion.sugerencias.length > 0 && (
            <div className="mb-4">
              <p className="font-medium text-sm mb-2">Sugerencias para mejorar</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--ink-muted)]">
                {evaluacion.sugerencias.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-6">
            <PrimaryButton onClick={() => { setEvaluacion(null); setForm(initialForm); setStepIndex(0); }}>
              Documentar otro proyecto
            </PrimaryButton>
            <SecondaryButton href="/portafolio/galeria">Ver galería de egresados</SecondaryButton>
          </div>
        </SurfaceCard>
      ) : isReview ? (
        <SurfaceCard padding="lg" clickable={false}>
          <h2 className="text-lg font-semibold mb-4">Revisión y envío</h2>
          <div className="space-y-2 text-sm mb-4">
            <p><strong>Estado del proyecto:</strong></p>
            <select
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[var(--ink)]"
              value={form.estadoProyecto}
              onChange={(e) => setForm((f) => ({ ...f, estadoProyecto: e.target.value as FormState["estadoProyecto"] }))}
            >
              {ESTADOS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="mt-3"><strong>Fecha de inicio (opcional):</strong></p>
            <input
              type="date"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[var(--ink)]"
              value={form.fechaInicio}
              onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.target.value }))}
            />
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.publico}
                onChange={(e) => setForm((f) => ({ ...f, publico: e.target.checked }))}
                className="rounded border-[var(--line)]"
              />
              <span className="text-sm text-[var(--ink)]">Incluir en la galería pública de egresados</span>
            </label>
          </div>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <div className="flex gap-3">
            <SecondaryButton onClick={handleBack} disabled={saving || evaluando}>
              Atrás
            </SecondaryButton>
            <PrimaryButton onClick={handleSubmit} disabled={saving || evaluando}>
              {evaluando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                  Evaluando con Claude…
                </>
              ) : saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                  Guardando…
                </>
              ) : (
                "Guardar y evaluar con Claude"
              )}
            </PrimaryButton>
          </div>
        </SurfaceCard>
      ) : step ? (
        <SurfaceCard padding="lg" clickable={false}>
          <div className="flex gap-3 mb-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--surface-soft)] flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--ink)]">{step.pregunta}</p>
              {step.hint && <p className="text-sm text-[var(--ink-muted)] mt-1">{step.hint}</p>}
            </div>
          </div>

          <div className="space-y-4">
            {step.fields.includes("titulo") && (
              <input
                type="text"
                placeholder="Título del proyecto"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              />
            )}
            {step.fields.includes("institucion") && (
              <input
                type="text"
                placeholder="Institución"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
                value={form.institucion}
                onChange={(e) => setForm((f) => ({ ...f, institucion: e.target.value }))}
              />
            )}
            {step.fields.includes("problema") && (
              <textarea
                placeholder="Problema que identificaste"
                rows={4}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-muted)] resize-y"
                value={form.problema}
                onChange={(e) => setForm((f) => ({ ...f, problema: e.target.value }))}
              />
            )}
            {step.fields.includes("solucion") && (
              <textarea
                placeholder="Solución que diseñaste o implementaste"
                rows={4}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-muted)] resize-y"
                value={form.solucion}
                onChange={(e) => setForm((f) => ({ ...f, solucion: e.target.value }))}
              />
            )}
            {step.fields.includes("resultado") && (
              <textarea
                placeholder="Resultado o impacto medible"
                rows={2}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-muted)] resize-y"
                value={form.resultado}
                onChange={(e) => setForm((f) => ({ ...f, resultado: e.target.value }))}
              />
            )}
            {step.fields.includes("ciudadanosBeneficiados") && (
              <input
                type="number"
                min={0}
                placeholder="Ciudadanos o empleados beneficiados"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
                value={form.ciudadanosBeneficiados}
                onChange={(e) => setForm((f) => ({ ...f, ciudadanosBeneficiados: e.target.value }))}
              />
            )}
            {step.fields.includes("modulos") && (
              <div className="space-y-2">
                {(curso?.modules ?? []).map((m: { id: string; title: string }) => (
                  <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.modulos.includes(m.title)}
                      onChange={(e) => {
                        setForm((f) => ({
                          ...f,
                          modulos: e.target.checked ? [...f.modulos, m.title] : f.modulos.filter((x) => x !== m.title),
                        }));
                      }}
                      className="rounded border-[var(--line)]"
                    />
                    <span className="text-sm text-[var(--ink)]">{m.title}</span>
                  </label>
                ))}
                {(!curso?.modules || curso.modules.length === 0) && (
                  <p className="text-sm text-[var(--ink-muted)]">No hay módulos cargados. Escribe los que usaste separados por coma:</p>
                )}
                {(!curso?.modules || curso.modules.length === 0) && (
                  <input
                    type="text"
                    placeholder="Ej: Módulo 1, Módulo 2"
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[var(--ink)]"
                    value={form.modulos.join(", ")}
                    onChange={(e) => setForm((f) => ({ ...f, modulos: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
                  />
                )}
              </div>
            )}
            {step.fields.includes("evidencias") && (
              <textarea
                placeholder="Pega una URL por línea (enlaces a fotos, documentos, capturas)"
                rows={3}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-muted)] resize-y"
                value={form.evidencias.join("\n")}
                onChange={(e) => setForm((f) => ({ ...f, evidencias: e.target.value.split(/\n/).map((s) => s.trim()).filter(Boolean) }))}
              />
            )}
          </div>

          <div className="flex gap-3 mt-6">
            {stepIndex > 0 && (
              <SecondaryButton onClick={handleBack}>
                Atrás
              </SecondaryButton>
            )}
            <PrimaryButton onClick={handleNext} disabled={!canAdvance()}>
              {isLastStep ? "Revisar y enviar" : "Siguiente"}
              <ArrowRight className="w-4 h-4 ml-2 inline" />
            </PrimaryButton>
          </div>
        </SurfaceCard>
      ) : null}

      {projects.length > 0 && !evaluacion && (
        <SurfaceCard padding="lg" clickable={false} className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Mis proyectos</h2>
          <ul className="space-y-2">
            {projects.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--line-subtle)] last:border-0">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[var(--ink-muted)]" />
                  <span className="font-medium">{p.titulo || "Sin título"}</span>
                  {p.scoreImpacto > 0 && <span className="text-xs text-[var(--ink-muted)]">({p.scoreImpacto} impacto)</span>}
                </div>
              </li>
            ))}
          </ul>
          <Link href="/portafolio/galeria" className="text-sm text-[var(--primary)] mt-3 inline-block">
            Ver galería de egresados →
          </Link>
        </SurfaceCard>
      )}
    </div>
  );
}
