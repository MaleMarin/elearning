"use client";

import { useState, useEffect } from "react";
import { SurfaceCard, PageSection, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

export type AuditLogEntry = {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resourceId: string;
  resourceName: string;
  timestamp: string | null;
  device: { browser: string; os: string; isMobile: boolean } | null;
  sessionId: string;
};

const ACTION_LABELS: Record<string, string> = {
  login: "Login",
  logout: "Logout",
  lesson_view: "Ver lección",
  lesson_complete: "Lección completada",
  course_view: "Ver curso",
};

function formatDevice(device: AuditLogEntry["device"]): string {
  if (!device) return "—";
  const parts = [device.browser, device.os];
  if (device.isMobile) parts.push("Móvil");
  return parts.join(" · ");
}

function exportToCsv(logs: AuditLogEntry[]) {
  const headers = ["Usuario", "Email", "Acción", "Recurso", "Fecha/hora", "Dispositivo"];
  const rows = logs.map((l) => [
    l.userId,
    l.userEmail,
    ACTION_LABELS[l.action] ?? l.action,
    l.resourceName || l.resourceId || "—",
    l.timestamp ?? "—",
    formatDevice(l.device),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface AuditTableProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  logs: AuditLogEntry[];
  userIdFilter: string;
  actionFilter: string;
  dateFromFilter: string;
  dateToFilter: string;
  onPageChange: (p: number) => void;
  onFiltersChange: (f: { userId?: string; action?: string; dateFrom?: string; dateTo?: string }) => void;
  onRefresh: () => void;
}

export function AuditTable({
  page,
  limit,
  total,
  totalPages,
  logs,
  userIdFilter,
  actionFilter,
  dateFromFilter,
  dateToFilter,
  onPageChange,
  onFiltersChange,
  onRefresh,
}: AuditTableProps) {
  const [userId, setUserId] = useState(userIdFilter);
  const [action, setAction] = useState(actionFilter);
  const [dateFrom, setDateFrom] = useState(dateFromFilter);
  const [dateTo, setDateTo] = useState(dateToFilter);

  useEffect(() => {
    setUserId(userIdFilter);
    setAction(actionFilter);
    setDateFrom(dateFromFilter);
    setDateTo(dateToFilter);
  }, [userIdFilter, actionFilter, dateFromFilter, dateToFilter]);

  const applyFilters = () => {
    onFiltersChange({ userId: userId || undefined, action: action || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
  };

  return (
    <PageSection title="Auditoría de accesos" subtitle="Registro de logins, vistas de curso/lección y completados.">
      <SurfaceCard padding="md" clickable={false}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-[var(--muted)]">Usuario (ID o email)</span>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Filtrar por usuario"
                className="input-base w-48 min-h-[40px]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-[var(--muted)]">Acción</span>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="input-base w-40 min-h-[40px]"
              >
                <option value="">Todas</option>
                {Object.entries(ACTION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-[var(--muted)]">Desde</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-base w-40 min-h-[40px]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-[var(--muted)]">Hasta</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-base w-40 min-h-[40px]"
              />
            </label>
            <SecondaryButton type="button" onClick={applyFilters} className="min-h-[40px]">
              Filtrar
            </SecondaryButton>
            <PrimaryButton type="button" onClick={onRefresh} className="min-h-[40px]">
              Actualizar
            </PrimaryButton>
            <SecondaryButton
              type="button"
              onClick={() => exportToCsv(logs)}
              className="min-h-[40px] inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </SecondaryButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="text-left py-2 px-2 font-medium text-[var(--muted)]">Usuario</th>
                  <th className="text-left py-2 px-2 font-medium text-[var(--muted)]">Acción</th>
                  <th className="text-left py-2 px-2 font-medium text-[var(--muted)]">Recurso</th>
                  <th className="text-left py-2 px-2 font-medium text-[var(--muted)]">Fecha/hora</th>
                  <th className="text-left py-2 px-2 font-medium text-[var(--muted)]">Dispositivo</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--muted)]">
                      No hay registros con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-[var(--line-subtle)]">
                      <td className="py-2 px-2">
                        <span className="font-medium">{log.userEmail || log.userId}</span>
                      </td>
                      <td className="py-2 px-2">{ACTION_LABELS[log.action] ?? log.action}</td>
                      <td className="py-2 px-2">{log.resourceName || log.resourceId || "—"}</td>
                      <td className="py-2 px-2">{log.timestamp ? new Date(log.timestamp).toLocaleString("es") : "—"}</td>
                      <td className="py-2 px-2">{formatDevice(log.device)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-[var(--muted)]">
                Página {page} de {totalPages} ({total} registros)
              </span>
              <div className="flex gap-2">
                <SecondaryButton
                  type="button"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                  className="min-h-[40px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </SecondaryButton>
                <SecondaryButton
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                  className="min-h-[40px]"
                >
                  <ChevronRight className="w-4 h-4" />
                </SecondaryButton>
              </div>
            </div>
          )}
        </div>
      </SurfaceCard>
    </PageSection>
  );
}
