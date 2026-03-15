"use client";

import { useState, useCallback } from "react";
import { SurfaceCard, PrimaryButton } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { FeatureToggle } from "./FeatureToggle";
import type { CourseFeatures } from "@/lib/types/course-features";
import { DEFAULT_COURSE_FEATURES } from "@/lib/types/course-features";

export interface FeatureFlagsPanelProps {
  courseId: string;
  initialFeatures: CourseFeatures;
  onSaved?: () => void;
}

/** Definición de cada feature: id, label, descripción. */
const FEATURE_META: { id: keyof CourseFeatures; label: string; desc: string }[] = [
  { id: "audioLecciones", label: "Audio de lecciones", desc: "El alumno puede escuchar cada lección en voz" },
  { id: "vozRespuestas", label: "Respuestas por voz", desc: "Responder actividades con grabación de voz" },
  { id: "diarioAprendizaje", label: "Diario de aprendizaje", desc: "Reflexión escrita al final de cada lección" },
  { id: "cartaFuturo", label: "Carta al yo futuro", desc: "Actividad de carta al yo futuro" },
  { id: "checkInBienestar", label: "Check-in de bienestar", desc: "Check-in diario de bienestar" },
  { id: "checkInCognitivo", label: "Check-in cognitivo", desc: "Energía, foco y tiempo" },
  { id: "simuladorPolitica", label: "Simulador de política pública", desc: "Simulador de política pública" },
  { id: "portafolioTransformacion", label: "Portafolio de transformación", desc: "Portafolio de proyectos" },
  { id: "peerReview", label: "Revisión entre pares", desc: "Revisión entre pares con rúbricas" },
  { id: "evaluacionFinal", label: "Evaluación final", desc: "Quiz final para certificado" },
  { id: "puntos", label: "Sistema de puntos", desc: "Puntos por actividades completadas" },
  { id: "badges", label: "Badges", desc: "Badges desbloqueables" },
  { id: "misionesSemanales", label: "Misiones semanales", desc: "Misiones semanales" },
  { id: "leaderboard", label: "Ranking de la cohorte", desc: "Leaderboard de la cohorte" },
  { id: "foro", label: "Foro", desc: "Foro de la cohorte" },
  { id: "miColega", label: "Mi colega", desc: "Aprender en pareja" },
  { id: "mentores", label: "Mentores", desc: "Red de mentores" },
  { id: "retosCohorte", label: "Retos de cohorte", desc: "Retos colaborativos" },
  { id: "laboratorio", label: "El Laboratorio", desc: "Zona de exploración completa" },
  { id: "trivia", label: "Trivia semanal", desc: "Trivia semanal" },
  { id: "habitasHumano", label: "Hábitas Humano", desc: "Juego de vocabulario" },
  { id: "simulaciones", label: "Micro-simulaciones", desc: "Micro-simulaciones" },
  { id: "whatsapp", label: "WhatsApp", desc: "Recordatorios por WhatsApp" },
  { id: "pushNotifications", label: "Notificaciones push", desc: "Notificaciones push" },
  { id: "spacedRepetition", label: "Repaso espaciado", desc: "Repasos programados" },
  { id: "sesionesEnVivo", label: "Sesiones en vivo", desc: "Sesiones de video" },
  { id: "grabaciones", label: "Grabaciones", desc: "Grabaciones de sesiones" },
  { id: "bibliografia", label: "Bibliografía", desc: "Bibliografía por módulo" },
  { id: "podcasts", label: "Podcasts", desc: "Podcasts recomendados" },
  { id: "certificado", label: "Certificado", desc: "Certificado al completar" },
  { id: "qrVerificacion", label: "Verificación con QR", desc: "Verificación pública con QR" },
];

const SECTIONS: { title: string; ids: (keyof CourseFeatures)[] }[] = [
  {
    title: "Aprendizaje",
    ids: ["audioLecciones", "vozRespuestas", "diarioAprendizaje", "cartaFuturo", "checkInBienestar", "checkInCognitivo"],
  },
  {
    title: "Evaluación",
    ids: ["simuladorPolitica", "portafolioTransformacion", "peerReview", "evaluacionFinal"],
  },
  {
    title: "Gamificación",
    ids: ["puntos", "badges", "misionesSemanales", "leaderboard"],
  },
  {
    title: "Comunidad",
    ids: ["foro", "miColega", "mentores", "retosCohorte"],
  },
  {
    title: "El Laboratorio",
    ids: ["laboratorio", "trivia", "habitasHumano", "simulaciones"],
  },
  {
    title: "Notificaciones",
    ids: ["whatsapp", "pushNotifications", "spacedRepetition"],
  },
  {
    title: "Contenido",
    ids: ["sesionesEnVivo", "grabaciones", "bibliografia", "podcasts"],
  },
  {
    title: "Certificado",
    ids: ["certificado", "qrVerificacion"],
  },
];

/** Plantillas predefinidas. */
const PLANTILLAS: Record<
  string,
  { label: string; desc: string; features: Partial<CourseFeatures> }
> = {
  completo: {
    label: "Programa completo",
    desc: "Todas las funcionalidades activas — recomendado para programas largos",
    features: Object.fromEntries(
      (Object.keys(DEFAULT_COURSE_FEATURES) as (keyof CourseFeatures)[]).map((k) => [k, true])
    ) as unknown as CourseFeatures,
  },
  basico: {
    label: "Curso básico",
    desc: "Solo lecciones, quiz y certificado — ideal para cursos técnicos cortos",
    features: {
      ...DEFAULT_COURSE_FEATURES,
      evaluacionFinal: true,
      certificado: true,
      sesionesEnVivo: true,
      grabaciones: true,
    },
  },
  ciberseguridad: {
    label: "Ciberseguridad",
    desc: "Enfocado en evaluación y certificación — sin gamificación ligera",
    features: {
      ...DEFAULT_COURSE_FEATURES,
      audioLecciones: true,
      diarioAprendizaje: true,
      evaluacionFinal: true,
      certificado: true,
      qrVerificacion: true,
      peerReview: true,
      whatsapp: true,
      sesionesEnVivo: true,
      grabaciones: true,
      spacedRepetition: true,
      bibliografia: true,
      checkInBienestar: true,
      badges: true,
      miColega: true,
      mentores: true,
      retosCohorte: true,
      portafolioTransformacion: true,
      foro: true,
      podcasts: true,
      pushNotifications: true,
    },
  },
  onboarding: {
    label: "Onboarding rápido",
    desc: "Para cursos de inducción cortos — sin gamificación profunda",
    features: {
      ...DEFAULT_COURSE_FEATURES,
      audioLecciones: true,
      diarioAprendizaje: true,
      certificado: true,
      foro: true,
      sesionesEnVivo: true,
      grabaciones: true,
      evaluacionFinal: true,
      laboratorio: false,
      simuladorPolitica: false,
      portafolioTransformacion: false,
      retosCohorte: false,
      misionesSemanales: false,
    },
  },
};

const metaById = new Map(FEATURE_META.map((m) => [m.id, m]));

export function FeatureFlagsPanel({ courseId, initialFeatures, onSaved }: FeatureFlagsPanelProps) {
  const [features, setFeatures] = useState<CourseFeatures>({ ...initialFeatures });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateFeature = useCallback((id: string, value: boolean) => {
    setFeatures((prev) => ({ ...prev, [id]: value }));
    setError(null);
  }, []);

  const applyPlantilla = useCallback((key: string) => {
    const p = PLANTILLAS[key];
    if (!p) return;
    setFeatures((prev) => ({ ...prev, ...p.features }));
    setError(null);
  }, []);

  const saveFeatures = useCallback(async () => {
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/features`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      setSuccess(true);
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [courseId, features, onSaved]);

  return (
    <div className="space-y-8">
      <SurfaceCard padding="lg" clickable={false} className="rounded-2xl">
        <h3 className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wide mb-3">
          Plantillas
        </h3>
        <p className="text-sm text-[var(--ink-muted)] mb-4">
          Aplica una plantilla como punto de partida y ajusta después.
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PLANTILLAS).map(([key, p]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPlantilla(key)}
              className="px-4 py-2 rounded-xl bg-[var(--neu-bg)] text-[var(--ink)] text-sm font-medium shadow-[var(--neu-shadow-out-sm)] hover:shadow-[var(--neu-glow)] hover:-translate-y-0.5 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </SurfaceCard>

      {error && <Alert message={error} variant="error" />}
      {success && <Alert message="Configuración guardada." variant="info" />}

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <SurfaceCard key={section.title} padding="lg" clickable={false} className="rounded-2xl">
            <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">{section.title}</h2>
            <div className="space-y-2">
              {section.ids.map((id) => {
                const meta = metaById.get(id);
                if (!meta) return null;
                return (
                  <FeatureToggle
                    key={id}
                    id={id}
                    label={meta.label}
                    desc={meta.desc}
                    value={features[id]}
                    onChange={updateFeature}
                  />
                );
              })}
            </div>
          </SurfaceCard>
        ))}
      </div>

      <div className="flex justify-end">
        <PrimaryButton onClick={saveFeatures} disabled={saving}>
          {saving ? "Guardando…" : "Guardar configuración"}
        </PrimaryButton>
      </div>
    </div>
  );
}
