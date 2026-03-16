"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard, PageSection, EmptyState } from "@/components/ui";
import { ChevronLeft, Download } from "lucide-react";

type Row = { userId: string; email: string | null; finalGrade: number | null; progressPercent: number };

export default function AdminCalificacionesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);
  const [cohortId, setCohortId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/cohorts", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setCohorts(list.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
        if (list[0]) setCohortId(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!cohortId) { setRows([]); setLoading(false); return; }
    setLoading(true);
    fetch(`/api/admin/grades?cohortId=${encodeURIComponent(cohortId)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [cohortId]);

  const [exportingCsv, setExportingCsv] = useState(false);
  const exportCsv = async () => {
    if (!cohortId) return;
    setExportingCsv(true);
    try {
      const res = await fetch(`/api/admin/calificaciones/exportar?cohortId=${encodeURIComponent(cohortId)}`, { credentials: "include" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `calificaciones-${cohortId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/admin" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--ink)] mb-6">
        <ChevronLeft className="w-5 h-5" /> Admin
      </Link>
      <PageSection title="Libro de calificaciones" subtitle="Notas por cohorte. Exportar a CSV.">
        <></>
      </PageSection>
      <div className="flex flex-wrap gap-4 mb-4">
        <select value={cohortId} onChange={(e) => setCohortId(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]">
          {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="button" onClick={exportCsv} disabled={exportingCsv || !cohortId} className="btn-primary inline-flex items-center gap-2">
          <Download className="w-4 h-4" /> {exportingCsv ? "Exportando…" : "Exportar CSV"}
        </button>
      </div>
      {loading ? (
        <p className="text-[var(--text-muted)]">Cargando…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Sin datos" description="Selecciona una cohorte o no hay alumnos con calificaciones." />
      ) : (
        <SurfaceCard padding="none" clickable={false}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)]">
                <th className="p-3 font-medium text-[var(--ink)]">Usuario</th>
                <th className="p-3 font-medium text-[var(--ink)]">Email</th>
                <th className="p-3 font-medium text-[var(--ink)]">Nota final</th>
                <th className="p-3 font-medium text-[var(--ink)]">Progreso %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.userId} className="border-b border-[var(--line)] last:border-0">
                  <td className="p-3 font-mono text-[var(--ink)]">{r.userId}</td>
                  <td className="p-3 text-[var(--ink)]">{r.email ?? "—"}</td>
                  <td className="p-3">{r.finalGrade ?? "—"}</td>
                  <td className="p-3">{Math.round(r.progressPercent)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SurfaceCard>
      )}
    </div>
  );
}
