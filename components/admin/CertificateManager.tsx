"use client";

import { useState, useEffect } from "react";
import { SurfaceCard, PrimaryButton, EmptyState } from "@/components/ui";

type Row = {
  userId: string;
  nombre: string;
  email: string | null;
  progressPercent: number;
  hasCertificate: boolean;
  issuedAt: string | null;
  idCert: string | null;
};

interface CertificateManagerProps {
  cohortId: string;
  cohorts: { id: string; name: string }[];
  onCohortChange: (id: string) => void;
}

export function CertificateManager({ cohortId, cohorts, onCohortChange }: CertificateManagerProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressFilter, setProgressFilter] = useState("");
  const [certFilter, setCertFilter] = useState("");
  const [emitting, setEmitting] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  const load = () => {
    if (!cohortId) return;
    setLoading(true);
    const params = new URLSearchParams({ cohortId });
    if (progressFilter) params.set("progressFilter", progressFilter);
    if (certFilter) params.set("certFilter", certFilter);
    fetch(`/api/admin/certificados/list?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setRows(Array.isArray(d?.rows) ? d.rows : []);
        setCourseId(d?.courseId ?? null);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  const emitOne = (userId: string, nombre: string) => {
    if (!courseId) return;
    if (!window.confirm(`¿Emitir certificado para ${nombre}? El alumno será notificado.`)) return;
    setEmitting(userId);
    fetch("/api/certificado/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId, courseId, forzar: true }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.idCert) load();
        else alert(d?.error ?? "Error");
      })
      .finally(() => setEmitting(null));
  };

  useEffect(() => {
    if (cohortId) load();
  }, [cohortId]);

  const reenviarEmail = (userId: string, courseId: string) => {
    fetch("/api/admin/certificados/reenviar-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId, courseId }),
    })
      .then((r) => r.json())
      .then((d) => (d?.ok ? alert("Email reenviado") : alert(d?.error ?? "Error")))
      .catch(() => alert("Error"));
  };

  const emitBatch = () => {
    if (!window.confirm("¿Emitir certificados a todos los alumnos con 100% que aún no tienen? (máx. 50)")) return;
    setBatchLoading(true);
    fetch("/api/admin/certificados/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ cohortId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) {
          alert(`Emitidos: ${d.emitted ?? 0}`);
          load();
        } else alert(d?.error ?? "Error");
      })
      .finally(() => setBatchLoading(false));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={cohortId}
          onChange={(e) => onCohortChange(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]"
        >
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={progressFilter}
          onChange={(e) => setProgressFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]"
        >
          <option value="">Progreso: todos</option>
          <option value="80">≥80%</option>
          <option value="90">≥90%</option>
          <option value="100">100%</option>
        </select>
        <select
          value={certFilter}
          onChange={(e) => setCertFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink)]"
        >
          <option value="">Certificado: todos</option>
          <option value="con">Emitido</option>
          <option value="sin">Pendiente</option>
        </select>
        <PrimaryButton onClick={load} disabled={loading}>
          {loading ? "Cargando…" : "Aplicar"}
        </PrimaryButton>
        <PrimaryButton onClick={emitBatch} disabled={batchLoading || !cohortId}>
          {batchLoading ? "Procesando…" : "Emitir a todos con 100%"}
        </PrimaryButton>
      </div>

      {loading ? (
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Sin datos" description="Selecciona cohorte y aplica filtros." />
      ) : (
        <SurfaceCard padding="none" clickable={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="p-3 font-medium text-[var(--ink)]">Nombre</th>
                  <th className="p-3 font-medium text-[var(--ink)]">Progreso</th>
                  <th className="p-3 font-medium text-[var(--ink)]">Certificado</th>
                  <th className="p-3 font-medium text-[var(--ink)]">Fecha</th>
                  <th className="p-3 font-medium text-[var(--ink)]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.userId} className="border-b border-[var(--line)] last:border-0">
                    <td className="p-3 text-[var(--ink)]">{r.nombre}</td>
                    <td className="p-3">{r.progressPercent}%</td>
                    <td className="p-3">{r.hasCertificate ? "Emitido" : "Pendiente"}</td>
                    <td className="p-3">{r.issuedAt ? new Date(r.issuedAt).toLocaleDateString("es") : "—"}</td>
                    <td className="p-3 space-x-2">
                      {r.hasCertificate ? (
                        <>
                          {r.idCert && (
                            <a href={`/verificar/${r.idCert}`} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline text-xs">
                              Ver
                            </a>
                          )}
                          {courseId && (
                            <button
                              type="button"
                              onClick={() => reenviarEmail(r.userId, courseId)}
                              className="text-[var(--primary)] hover:underline text-xs"
                            >
                              Reenviar email
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => emitOne(r.userId, r.nombre)}
                          disabled={emitting === r.userId}
                          className="text-[var(--primary)] hover:underline text-xs disabled:opacity-50"
                        >
                          {emitting === r.userId ? "Emitiendo…" : "Emitir certificado"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
