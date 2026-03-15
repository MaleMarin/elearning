"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AuditTable, type AuditLogEntry } from "@/components/admin/AuditTable";

export default function AdminAuditoriaPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (userIdFilter) params.set("userId", userIdFilter);
    if (actionFilter) params.set("action", actionFilter);
    if (dateFromFilter) params.set("dateFrom", dateFromFilter);
    if (dateToFilter) params.set("dateTo", dateToFilter);
    try {
      const res = await fetch(`/api/admin/audit-logs?${params}`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        setError(res.status === 403 ? "No tienes permisos de admin" : "Debes iniciar sesión");
        setLogs([]);
        return;
      }
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Error al cargar");
        setLogs([]);
        return;
      }
      setLogs((data as { logs: AuditLogEntry[] }).logs ?? []);
      setTotal((data as { total?: number }).total ?? 0);
      setTotalPages((data as { totalPages?: number }).totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page, limit, userIdFilter, actionFilter, dateFromFilter, dateToFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFiltersChange = (f: { userId?: string; action?: string; dateFrom?: string; dateTo?: string }) => {
    setUserIdFilter(f.userId ?? "");
    setActionFilter(f.action ?? "");
    setDateFromFilter(f.dateFrom ?? "");
    setDateToFilter(f.dateTo ?? "");
    setPage(1);
  };

  return (
    <div className="max-w-5xl w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--ink)] no-underline"
        >
          <ChevronLeft className="w-5 h-5" />
          Volver al panel
        </Link>
      </div>
      {error && (
        <p className="text-[var(--coral)] text-sm" role="alert">
          {error}
        </p>
      )}
      <AuditTable
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        logs={logs}
        userIdFilter={userIdFilter}
        actionFilter={actionFilter}
        dateFromFilter={dateFromFilter}
        dateToFilter={dateToFilter}
        onPageChange={setPage}
        onFiltersChange={handleFiltersChange}
        onRefresh={fetchLogs}
      />
      {loading && (
        <p className="text-sm text-[var(--muted)]" aria-busy="true">
          Cargando…
        </p>
      )}
    </div>
  );
}
