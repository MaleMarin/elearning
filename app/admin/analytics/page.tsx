"use client";

import React, { useState, useEffect } from "react";
import { PageSection, SurfaceCard } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";

type CompletionByLesson = {
  lessonId: string;
  title: string;
  started: number;
  completed: number;
  rate: number;
};

type VideoAbandon = { second: number; count: number };

type QuestionErrors = {
  questionId: string;
  errors: number;
  total: number;
};

type AtRisk = { userId: string; lastActivity: string };

type RoiSummary = {
  totalStarts: number;
  totalCompletions: number;
  uniqueLearners: number;
  completionRate: number;
} | null;

type AnalyticsData = {
  error?: string;
  roi?: RoiSummary;
  completionByLesson: CompletionByLesson[];
  videoAbandonBySecond: VideoAbandon[];
  questionsByErrors: QuestionErrors[];
  avgTimePerModule: number | null;
  atRisk: AtRisk[];
};

function AnalyticsView({ d, maxAbandon }: { d: AnalyticsData; maxAbandon: number }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSection
          title="Analytics xAPI"
          subtitle="Tasa de completación por lección, segundo de video donde más se abandona, preguntas con más errores y alumnos en riesgo."
        >
          <></>
        </PageSection>
        <Link
          href="/admin"
          className="text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Volver al admin
        </Link>
      </div>

      {d.error && (
        <Alert
          variant="warning"
          title="xAPI"
          message={
            d.error === "xAPI no configurado"
              ? "Configura XAPI_ENDPOINT, XAPI_KEY y XAPI_SECRET en .env para ver datos del LRS. LRS gratuito: cloud.scorm.com (hasta 5,000 statements/mes)."
              : d.error
          }
        />
      )}

      {d.roi && (
        <SurfaceCard padding="lg" as="section">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Resumen ROI (LRS)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-[var(--ink)]">{d.roi.uniqueLearners}</p>
              <p className="text-sm text-[var(--ink-muted)]">Alumnos únicos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--ink)]">{d.roi.totalStarts}</p>
              <p className="text-sm text-[var(--ink-muted)]">Inicios de lección</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--ink)]">{d.roi.totalCompletions}</p>
              <p className="text-sm text-[var(--ink-muted)]">Completados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--primary)]">{d.roi.completionRate}%</p>
              <p className="text-sm text-[var(--ink-muted)]">Tasa de completación</p>
            </div>
          </div>
        </SurfaceCard>
      )}

      <SurfaceCard padding="lg" as="section">
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">
          Tasa de completación por lección
        </h2>
        {d.completionByLesson.length === 0 ? (
          <p className="text-[var(--ink-muted)] text-sm">Aún no hay datos de inicio/completado.</p>
        ) : (
          <div className="space-y-3">
            {d.completionByLesson.slice(0, 20).map((row) => (
              <div key={row.lessonId} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--ink)] truncate" title={row.title}>
                    {row.title}
                  </p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {row.completed} / {row.started} completaron
                  </p>
                </div>
                <div className="w-24 h-6 rounded bg-[var(--line)] overflow-hidden flex">
                  <div
                    className="h-full bg-[var(--primary)] transition-all"
                    style={{ width: `${Math.min(100, row.rate)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-[var(--ink)] w-10 text-right">
                  {row.rate}%
                </span>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard padding="lg" as="section">
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">
          Segundo de video donde más se abandona (pausas)
        </h2>
        {d.videoAbandonBySecond.length === 0 ? (
          <p className="text-[var(--ink-muted)] text-sm">Aún no hay datos de pausas de video.</p>
        ) : (
          <div className="flex items-end gap-0.5 h-32">
            {d.videoAbandonBySecond.slice(0, 40).map((row) => (
              <div
                key={row.second}
                className="flex-1 min-w-0 flex flex-col justify-end group"
                title={`${row.second}s: ${row.count} pausas`}
              >
                <div
                  className="w-full bg-[var(--primary)] rounded-t opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${(row.count / maxAbandon) * 100}%`, minHeight: row.count ? 4 : 0 }}
                />
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-[var(--ink-muted)] mt-2">
          Eje X: segundo del video (0 → 40 primeros). Altura: número de pausas.
        </p>
      </SurfaceCard>

      <SurfaceCard padding="lg" as="section">
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">
          Preguntas con más errores
        </h2>
        {d.questionsByErrors.length === 0 ? (
          <p className="text-[var(--ink-muted)] text-sm">Aún no hay respuestas de quiz.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="text-left py-2 font-medium text-[var(--ink-muted)]">Pregunta ID</th>
                  <th className="text-right py-2 font-medium text-[var(--ink-muted)]">Errores</th>
                  <th className="text-right py-2 font-medium text-[var(--ink-muted)]">Total respuestas</th>
                </tr>
              </thead>
              <tbody>
                {d.questionsByErrors.slice(0, 15).map((row) => (
                  <tr key={row.questionId} className="border-b border-[var(--line-subtle)]">
                    <td className="py-2 font-mono text-[var(--ink)]">{row.questionId}</td>
                    <td className="py-2 text-right text-[var(--ink)]">{row.errors}</td>
                    <td className="py-2 text-right text-[var(--ink-muted)]">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard padding="lg" as="section">
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">
          Tiempo promedio por módulo
        </h2>
        <p className="text-[var(--ink-muted)] text-sm">
          {d.avgTimePerModule != null
            ? `${d.avgTimePerModule.toFixed(1)} min`
            : "No disponible (requiere envío de duración en statements)."}
        </p>
      </SurfaceCard>

      <SurfaceCard padding="lg" as="section">
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">
          Alumnos en riesgo (sin completar y sin actividad reciente)
        </h2>
        {d.atRisk.length === 0 ? (
          <p className="text-[var(--ink-muted)] text-sm">
            Ninguno detectado: todos han completado al menos una lección o tienen actividad en los últimos 7 días.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="text-left py-2 font-medium text-[var(--ink-muted)]">Usuario (ID)</th>
                  <th className="text-right py-2 font-medium text-[var(--ink-muted)]">Última actividad</th>
                </tr>
              </thead>
              <tbody>
                {d.atRisk.map((row) => (
                  <tr key={row.userId} className="border-b border-[var(--line-subtle)]">
                    <td className="py-2 font-mono text-[var(--ink)]">{row.userId}</td>
                    <td className="py-2 text-right text-[var(--ink-muted)]">
                      {row.lastActivity ? new Date(row.lastActivity).toLocaleDateString("es") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics/xapi", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData({ completionByLesson: [], videoAbandonBySecond: [], questionsByErrors: [], avgTimePerModule: null, atRisk: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageSection title="Analytics xAPI" subtitle="Tasa de completación, video y preguntas desde el LRS.">
          <></>
        </PageSection>
        <SurfaceCard padding="lg" className="animate-pulse">
          <div className="h-64 rounded bg-[var(--surface-soft)]" />
        </SurfaceCard>
      </div>
    );
  }

  const defaultData: AnalyticsData = {
    roi: null,
    completionByLesson: [],
    videoAbandonBySecond: [],
    questionsByErrors: [],
    avgTimePerModule: null,
    atRisk: [],
  };
  const d = data ?? defaultData;
  const abandonCounts = d.videoAbandonBySecond.map((x) => x.count);
  const maxAbandon = abandonCounts.length > 0 ? Math.max(1, ...abandonCounts) : 1;

  return <AnalyticsView d={d} maxAbandon={maxAbandon} />;
}
