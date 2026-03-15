"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CursoApiResponse } from "@/app/api/curso/route";
import type { ContenidoGenerado } from "@/lib/types/lessonProposal";

type ModuleOption = { id: string; title: string };

export default function ProponerLeccionPage() {
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [titulo, setTitulo] = useState("");
  const [moduleIdSugerido, setModuleIdSugerido] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [experienciaReal, setExperienciaReal] = useState("");
  const [contenidoGenerado, setContenidoGenerado] = useState<ContenidoGenerado | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCurso, setLoadingCurso] = useState(true);

  useEffect(() => {
    setLoadingCurso(true);
    fetch("/api/curso", { credentials: "include" })
      .then((r) => r.json())
      .then((data: CursoApiResponse) => {
        if (data.modules?.length) {
          setModules(data.modules.map((m) => ({ id: m.id, title: m.title })));
          if (!moduleIdSugerido && data.modules[0]) setModuleIdSugerido(data.modules[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCurso(false));
  }, []);

  const handleGenerate = () => {
    if (!experienciaReal.trim()) {
      setError("Escribe tu experiencia real para que el bot pueda estructurar la lección.");
      return;
    }
    setError(null);
    setGenerating(true);
    fetch("/api/propuestas/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ experienciaReal: experienciaReal.trim() }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setContenidoGenerado(data.contenidoGenerado ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al generar"))
      .finally(() => setGenerating(false));
  };

  const handleSubmit = (enviar: boolean) => {
    if (!titulo.trim() || !moduleIdSugerido || !experienciaReal.trim()) {
      setError("Completa título, módulo y experiencia real.");
      return;
    }
    setError(null);
    setSaving(true);
    fetch("/api/propuestas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        experienciaReal: experienciaReal.trim(),
        moduleIdSugerido,
        contenidoGenerado,
        enviar,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        if (enviar) setSent(true);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al guardar"))
      .finally(() => setSaving(false));
  };

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-[var(--success)] bg-[var(--success-soft)] p-6 text-center">
          <h2 className="text-xl font-semibold text-[var(--ink)] mb-2">Propuesta enviada</h2>
          <p className="text-[var(--ink-muted)] mb-4">
            Tu propuesta de lección fue enviada. El equipo la revisará y te notificará si es aprobada o si hay observaciones.
          </p>
          <Link href="/comunidad" className="text-[var(--primary)] font-medium hover:underline">
            Volver a Comunidad
          </Link>
        </div>
      </div>
    );
  }

  if (!loadingCurso && modules.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/comunidad" className="text-[var(--ink-muted)] hover:text-[var(--ink)] text-sm font-medium no-underline">← Comunidad</Link>
        <h1 className="text-2xl font-bold text-[var(--ink)] mt-6 mb-2">Proponer una lección</h1>
        <p className="text-[var(--ink-muted)]">
          Necesitas estar inscrito en un programa con módulos publicados para proponer una lección. Revisa tu curso y vuelve más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/comunidad" className="text-[var(--ink-muted)] hover:text-[var(--ink)] text-sm font-medium no-underline">
          ← Comunidad
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-[var(--ink)] mb-2">Proponer una lección</h1>
      <p className="text-[var(--ink-muted)] mb-6">
        Comparte tu experiencia como servidor público. El bot te ayudará a estructurarla como lección para la comunidad.
      </p>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-[var(--coral-soft)] border border-[var(--coral)] text-[var(--coral)]" role="alert">
          {error}
        </div>
      )}

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">Título de la lección *</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
            placeholder="Ej. Cómo implementamos mesas de simplificación en mi institución"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">Módulo sugerido *</label>
          <select
            value={moduleIdSugerido}
            onChange={(e) => setModuleIdSugerido(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
          >
            <option value="">Seleccionar módulo</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">Descripción breve</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
            placeholder="En una frase, de qué tratará esta lección"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">Tu experiencia real *</label>
          <textarea
            value={experienciaReal}
            onChange={(e) => setExperienciaReal(e.target.value)}
            rows={8}
            required
            className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
            placeholder="Ej: En el IMSS implementamos mesas de simplificación con ciudadanos y áreas. Redujimos pasos en el trámite X de 5 a 2. Lo más importante fue escuchar a quienes usaban el servicio..."
          />
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            Cuenta qué hiciste, qué resultado obtuviste y qué aprendiste. El bot generará objetivo, introducción, desarrollo, actividad y 3 preguntas.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !experienciaReal.trim()}
            className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:pointer-events-none"
          >
            {generating ? "Generando…" : "El bot me ayuda a estructurarla"}
          </button>
        </div>

        {contenidoGenerado && (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-6 space-y-4">
            <h3 className="font-semibold text-[var(--ink)]">Vista previa generada (puedes editar antes de enviar)</h3>
            <div>
              <span className="text-xs text-[var(--muted)]">Objetivo</span>
              <p className="text-[var(--ink)]">{contenidoGenerado.objetivo}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted)]">Introducción</span>
              <p className="text-[var(--ink)] whitespace-pre-wrap">{contenidoGenerado.introduccion}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted)]">Desarrollo</span>
              <p className="text-[var(--ink)] whitespace-pre-wrap">{contenidoGenerado.desarrollo}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted)]">Actividad</span>
              <p className="text-[var(--ink)] whitespace-pre-wrap">{contenidoGenerado.actividad}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted)]">Quiz (3 preguntas)</span>
              <ul className="list-disc list-inside text-[var(--ink)] mt-1 space-y-1">
                {contenidoGenerado.quiz?.map((q, i) => (
                  <li key={i}>{q.question}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={saving || !titulo.trim() || !moduleIdSugerido || !experienciaReal.trim()}
            className="px-5 py-2.5 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-medium hover:bg-[var(--bg)] disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar borrador"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving || !titulo.trim() || !moduleIdSugerido || !experienciaReal.trim()}
            className="px-5 py-2.5 rounded-full bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50"
          >
            {saving ? "Enviando…" : "Enviar propuesta"}
          </button>
        </div>
      </form>
    </div>
  );
}
