"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  SurfaceCard,
  PageSection,
  PrimaryButton,
  EmptyState,
} from "@/components/ui";
import { ChevronLeft, Download } from "lucide-react";

type Stats = {
  diagnostic: {
    byExperience: Record<string, number>;
    byMotivation: Record<string, number>;
    total: number;
  };
  quiz: { averageScore: number; totalAttempts: number; passedCount: number; passPercent: number };
  nps: { average: number; promoterCount: number; passiveCount: number; detractorCount: number; total: number };
  blockAverages: { methodology: number; content: number; platform: number };
  comments: { userId: string; comment: string; completedAt: string }[];
};

const COMMENTS_PER_PAGE = 10;

function BarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <ul className="space-y-3">
      {entries.map(([label, value]) => (
        <li key={label} className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text)] truncate max-w-[80%]">{label}</span>
            <span className="text-[var(--text-muted)] tabular-nums">{value}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--line)] overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
      {entries.length === 0 && (
        <li className="text-sm text-[var(--text-muted)]">Sin datos</li>
      )}
    </ul>
  );
}

export default function AdminEvaluacionesPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentPage, setCommentPage] = useState(0);
  const [exporting, setExporting] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/evaluations/stats", { credentials: "include" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Error al cargar estadísticas");
      }
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/evaluations/export", { credentials: "include" });
      if (!res.ok) throw new Error("Error al exportar");
      const rows = (await res.json()) as Record<string, string>[];
      if (rows.length === 0) {
        const headers = [
          "userId", "diagnosticExperience", "diagnosticMotivation", "diagnosticChallenges",
          "diagnosticExpectation", "diagnosticAvailability", "diagnosticSkipped", "diagnosticCompletedAt",
          "quizScore", "quizTotal", "quizPassed", "quizCompletedAt",
          "surveyMethodologyAvg", "surveyContentAvg", "surveyPlatformAvg", "surveyNps", "surveyComment", "surveyCompletedAt",
        ];
        const csv = headers.join(",") + "\n";
        downloadCsv(csv, "evaluaciones.csv");
        return;
      }
      const headers = Object.keys(rows[0]);
      const escape = (v: string) => {
        const s = String(v ?? "");
        if (/[,"\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(","))];
      downloadCsv(lines.join("\n"), "evaluaciones.csv");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-[var(--text-muted)]">Cargando estadísticas…</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <SurfaceCard padding="md" className="border border-[var(--error)]">
          <p className="text-[var(--error)]">{error}</p>
          <Link href="/admin" className="text-[var(--primary)] mt-2 inline-block">Volver al admin</Link>
        </SurfaceCard>
      </div>
    );
  }

  const s = stats!;
  const commentList = s.comments ?? [];
  const totalCommentPages = Math.ceil(commentList.length / COMMENTS_PER_PAGE);
  const paginatedComments = commentList.slice(
    commentPage * COMMENTS_PER_PAGE,
    (commentPage + 1) * COMMENTS_PER_PAGE
  );

  function downloadCsv(content: string, filename: string) {
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--ink)]"
        >
          <ChevronLeft className="w-5 h-5" />
          Admin
        </Link>
        <PrimaryButton onClick={handleExportCsv} disabled={exporting}>
          {exporting ? "Exportando…" : "Exportar CSV"}
          <Download className="w-4 h-4 ml-2 inline" />
        </PrimaryButton>
      </div>

      <PageSection title="Evaluaciones" subtitle="Diagnósticos, quiz final y encuesta de cierre.">
        <></>
      </PageSection>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <SurfaceCard padding="md" size="lg">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-1">Diagnóstico — Experiencia previa</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">Total: {s.diagnostic.total} respuestas</p>
          <BarChart data={s.diagnostic.byExperience} />
        </SurfaceCard>
        <SurfaceCard padding="md" size="lg">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-1">Diagnóstico — Motivación</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">Más frecuentes</p>
          <BarChart data={s.diagnostic.byMotivation} />
        </SurfaceCard>
        <SurfaceCard padding="md" size="lg">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-1">Quiz final</h2>
          <p className="text-2xl font-bold text-[var(--ink)]">{s.quiz.averageScore.toFixed(1)}%</p>
          <p className="text-sm text-[var(--text-muted)]">Puntaje promedio</p>
          <p className="mt-2 text-[var(--ink)]">{s.quiz.passedCount} / {s.quiz.totalAttempts} aprobados ({s.quiz.passPercent.toFixed(0)}%)</p>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        <SurfaceCard padding="md" size="lg">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-1">NPS (encuesta de cierre)</h2>
          <p className="text-4xl font-bold text-[var(--primary)]">{s.nps.total ? s.nps.average.toFixed(1) : "—"}</p>
          <p className="text-sm text-[var(--text-muted)] mb-2">Promedio (n = {s.nps.total})</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="px-2 py-1 rounded-full bg-[var(--success)]/20 text-[var(--success)]">Promotores: {s.nps.promoterCount}</span>
            <span className="px-2 py-1 rounded-full bg-[var(--line)] text-[var(--text-muted)]">Pasivos: {s.nps.passiveCount}</span>
            <span className="px-2 py-1 rounded-full bg-[var(--error)]/20 text-[var(--error)]">Detractores: {s.nps.detractorCount}</span>
          </div>
        </SurfaceCard>
        <SurfaceCard padding="md" size="lg">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Promedios por bloque (1-5)</h2>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span className="text-[var(--text)]">Metodología</span>
              <span className="font-medium tabular-nums">{s.blockAverages.methodology.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-[var(--text)]">Contenido</span>
              <span className="font-medium tabular-nums">{s.blockAverages.content.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-[var(--text)]">Plataforma</span>
              <span className="font-medium tabular-nums">{s.blockAverages.platform.toFixed(2)}</span>
            </li>
          </ul>
        </SurfaceCard>
      </div>

      <SurfaceCard padding="md" size="lg">
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4">Comentarios abiertos</h2>
        {paginatedComments.length === 0 ? (
          <EmptyState title="Sin comentarios" description="Aún no hay comentarios en la encuesta de cierre." />
        ) : (
          <>
            <ul className="space-y-4">
              {paginatedComments.map((c, i) => (
                <li key={`${c.userId}-${c.completedAt}-${i}`} className="border-b border-[var(--line)] pb-4 last:border-0 last:pb-0">
                  <p className="text-[var(--text)] whitespace-pre-wrap">{c.comment}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{c.userId} · {c.completedAt ? new Date(c.completedAt).toLocaleString() : ""}</p>
                </li>
              ))}
            </ul>
            {totalCommentPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setCommentPage((p) => Math.max(0, p - 1))}
                  disabled={commentPage === 0}
                  className="px-3 py-1 rounded border border-[var(--line)] text-[var(--ink)] disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm text-[var(--text-muted)]">
                  {commentPage + 1} / {totalCommentPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCommentPage((p) => Math.min(totalCommentPages - 1, p + 1))}
                  disabled={commentPage >= totalCommentPages - 1}
                  className="px-3 py-1 rounded border border-[var(--line)] text-[var(--ink)] disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </SurfaceCard>
    </div>
  );
}
