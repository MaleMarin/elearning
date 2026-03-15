"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SurfaceCard, PrimaryButton, SecondaryButton } from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { ChevronLeft, Shield, Check, X, UserX, Clock } from "lucide-react";

type QueueItem = {
  id: string;
  source: string;
  contentId: string;
  authorId: string;
  authorEmail?: string;
  texto: string;
  nivel: string;
  razon: string;
  createdAt: string;
};

type HistoryItem = {
  id: string;
  source: string;
  contentId: string;
  authorId: string;
  texto: string;
  nivel: string;
  razon: string;
  decision: string;
  decidedBy: string;
  decidedAt: string;
};

type BanItem = {
  userId: string;
  reason: string;
  bannedUntil: string;
  bannedBy: string;
  createdAt: string;
};

const SOURCE_LABEL: Record<string, string> = {
  comunidad_post: "Post comunidad",
  comunidad_comment: "Comentario",
  glosario_term: "Glosario",
  showntell_submission: "Show & Tell",
};

export default function AdminModeracionPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bans, setBans] = useState<BanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banUserId, setBanUserId] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDays, setBanDays] = useState(7);
  const [banning, setBanning] = useState(false);

  const fetchAll = useCallback(() => {
    Promise.all([
      fetch("/api/admin/moderacion/queue", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/moderacion/history?limit=50", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/moderacion/bans", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([q, h, b]) => {
        setQueue(q.queue ?? []);
        setHistory(h.history ?? []);
        setBans(b.bans ?? []);
      })
      .catch(() => setError("Error al cargar"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleResolve = (queueId: string, resolution: "aprobado" | "rechazado") => {
    setError(null);
    fetch("/api/admin/moderacion/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ queueId, resolution }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        fetchAll();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  };

  const handleBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!banUserId.trim()) return;
    setError(null);
    setBanning(true);
    const d = new Date();
    d.setDate(d.getDate() + banDays);
    fetch("/api/admin/moderacion/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userId: banUserId.trim(),
        reason: banReason.trim() || "Moderación",
        bannedUntil: d.toISOString(),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setBanUserId("");
        setBanReason("");
        fetchAll();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setBanning(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-[var(--ink-muted)]">Cargando moderación…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-2 flex items-center gap-2">
          <Shield className="w-7 h-7 text-[var(--primary)]" /> Moderación
        </h1>
        <p className="text-[var(--ink-muted)] mb-6">
          Cola de contenido en revisión, historial de decisiones y baneos temporales.
        </p>

        {error && <Alert message={error} variant="error" className="mb-4" />}

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-3">Contenido en revisión</h2>
          {queue.length === 0 ? (
            <SurfaceCard padding="lg" clickable={false}>
              <p className="text-[var(--ink-muted)] text-center py-6">No hay ítems en la cola.</p>
            </SurfaceCard>
          ) : (
            <div className="space-y-4">
              {queue.map((item) => (
                <SurfaceCard key={item.id} padding="lg" clickable={false} className="border-l-4 border-l-[var(--amber)]">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-medium text-[var(--ink-muted)]">
                      {SOURCE_LABEL[item.source] ?? item.source} · {item.authorEmail ?? item.authorId}
                    </span>
                    <span className="text-xs text-[var(--amber)]">{item.nivel}</span>
                  </div>
                  <p className="text-sm text-[var(--ink-muted)] mb-2">Razón IA: {item.razon}</p>
                  <p className="text-sm text-[var(--ink)] whitespace-pre-wrap break-words mb-3 line-clamp-3">{item.texto}</p>
                  <div className="flex gap-2">
                    <PrimaryButton onClick={() => handleResolve(item.id, "aprobado")} className="!bg-[var(--green)]">
                      <Check className="w-4 h-4" /> Aprobar
                    </PrimaryButton>
                    <SecondaryButton onClick={() => handleResolve(item.id, "rechazado")} className="!text-[var(--coral)]">
                      <X className="w-4 h-4" /> Rechazar
                    </SecondaryButton>
                    <SecondaryButton
                      onClick={() => {
                        setBanUserId(item.authorId);
                        setBanReason(item.razon);
                      }}
                    >
                      <UserX className="w-4 h-4" /> Banear autor
                    </SecondaryButton>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Banear usuario temporalmente
          </h2>
          <SurfaceCard padding="lg" clickable={false}>
            <form onSubmit={handleBan} className="flex flex-wrap items-end gap-4">
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">User ID (Firebase/Supabase)</label>
                <input
                  type="text"
                  value={banUserId}
                  onChange={(e) => setBanUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                  placeholder="uid o user id"
                />
              </div>
              <div className="min-w-[120px]">
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Días</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={banDays}
                  onChange={(e) => setBanDays(Number(e.target.value) || 7)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Motivo</label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                  placeholder="Opcional"
                />
              </div>
              <PrimaryButton type="submit" disabled={banning || !banUserId.trim()}>
                {banning ? "Banear…" : "Banear"}
              </PrimaryButton>
            </form>
          </SurfaceCard>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-3">Baneos activos</h2>
          {bans.length === 0 ? (
            <SurfaceCard padding="lg" clickable={false}>
              <p className="text-[var(--ink-muted)] text-center py-4">Ningún baneo activo.</p>
            </SurfaceCard>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--line-subtle)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--line-subtle)] bg-[var(--bg)]">
                    <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Usuario</th>
                    <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Motivo</th>
                    <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Hasta</th>
                    <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Por</th>
                  </tr>
                </thead>
                <tbody>
                  {bans.map((b, i) => (
                    <tr key={i} className="border-b border-[var(--line-subtle)] last:border-b-0">
                      <td className="py-2 px-3 font-mono text-[var(--ink)]">{b.userId}</td>
                      <td className="py-2 px-3 text-[var(--ink-muted)]">{b.reason}</td>
                      <td className="py-2 px-3 text-[var(--ink)]">{new Date(b.bannedUntil).toLocaleDateString("es")}</td>
                      <td className="py-2 px-3 text-[var(--ink-muted)]">{b.bannedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)] mb-3">Historial de decisiones</h2>
          {history.length === 0 ? (
            <SurfaceCard padding="lg" clickable={false}>
              <p className="text-[var(--ink-muted)] text-center py-4">Aún no hay historial.</p>
            </SurfaceCard>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--line-subtle)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--line-subtle)] bg-[var(--bg)]">
                    <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Origen</th>
                    <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Decisión</th>
                    <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Razón</th>
                    <th className="text-left py-2 px-3 font-medium text-[var(--ink)]">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 30).map((h) => (
                    <tr key={h.id} className="border-b border-[var(--line-subtle)] last:border-b-0">
                      <td className="py-2 px-3 text-[var(--ink)]">{SOURCE_LABEL[h.source] ?? h.source}</td>
                      <td className="py-2 px-3">
                        <span
                          className={
                            h.decision === "bloqueado" || h.decision === "revisado_rechazado"
                              ? "text-[var(--coral)]"
                              : "text-[var(--green)]"
                          }
                        >
                          {h.decision}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[var(--ink-muted)] max-w-[200px] truncate">{h.razon}</td>
                      <td className="py-2 px-3 text-[var(--ink-muted)]">{new Date(h.decidedAt).toLocaleString("es")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
