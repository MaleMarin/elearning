"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { ChevronLeft, Users, ClipboardList } from "lucide-react";

interface RequestRow {
  id: string;
  studentId: string;
  mentorId: string;
  studentName: string;
  mentorName: string;
  message: string | null;
  status: string;
  createdAt: string;
}

export default function AdminMentoresPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    fetch("/api/admin/mentors/requests", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setRequests(d.requests ?? []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/admin/mentors/requests/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      if (res.ok) fetchRequests();
    } catch {
      // ignore
    }
  };

  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="max-w-3xl w-full space-y-6">
      <nav className="text-sm text-[var(--ink-muted)]">
        <Link href="/admin" className="hover:text-[var(--primary)] rounded">Admin</Link>
        {" · "}
        <span className="text-[var(--ink)] font-medium">Mentores</span>
      </nav>
      <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] text-sm font-medium">
        <ChevronLeft className="w-4 h-4" /> Volver al admin
      </Link>

      <SurfaceCard padding="lg" clickable={false}>
        <h1 className="text-xl font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-[var(--primary)]" />
          Solicitudes de mentoría
        </h1>
        <p className="text-sm text-[var(--ink-muted)] mb-6">
          Aprueba o rechaza las solicitudes. Tras aprobar, la coordinación con el mentor (ej. WhatsApp) es externa.
        </p>

        {loading ? (
          <p className="text-[var(--ink-muted)]">Cargando…</p>
        ) : pending.length === 0 ? (
          <p className="text-[var(--ink-muted)]">No hay solicitudes pendientes.</p>
        ) : (
          <ul className="space-y-4 list-none">
            {pending.map((r) => (
              <li key={r.id} className="rounded-xl border border-[var(--line)] p-4">
                <p className="font-medium text-[var(--ink)]">{r.studentName} → {r.mentorName}</p>
                {r.message && <p className="text-sm text-[var(--ink-muted)] mt-1">{r.message}</p>}
                <p className="text-xs text-[var(--ink-muted)] mt-2">{new Date(r.createdAt).toLocaleString("es-CL")}</p>
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={() => handleAction(r.id, "approve")} className="btn-primary text-sm">Aprobar</button>
                  <button type="button" onClick={() => handleAction(r.id, "reject")} className="btn-ghost text-sm">Rechazar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SurfaceCard>
    </div>
  );
}
