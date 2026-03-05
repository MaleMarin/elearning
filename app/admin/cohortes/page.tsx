"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  SurfaceCard,
  PageSection,
  PrimaryButton,
  SecondaryButton,
  Badge,
  EmptyState,
} from "@/components/ui";
import { Alert } from "@/components/ui/Alert";
import { Copy, Plus, KeyRound, ChevronLeft } from "lucide-react";

type Cohort = {
  id: string;
  name: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  timezone: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Invitation = {
  id: string;
  code: string;
  cohort_id: string;
  max_uses: number;
  uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export default function AdminCohortesPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [invitationsByCohort, setInvitationsByCohort] = useState<Record<string, Invitation[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createStartsAt, setCreateStartsAt] = useState("");
  const [createEndsAt, setCreateEndsAt] = useState("");
  const [createCapacity, setCreateCapacity] = useState("");
  const [createIsActive, setCreateIsActive] = useState(true);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [generateCohortId, setGenerateCohortId] = useState<string | null>(null);
  const [generateMaxUses, setGenerateMaxUses] = useState("1");
  const [generateExpiresAt, setGenerateExpiresAt] = useState("");
  const [generateIsActive, setGenerateIsActive] = useState(true);
  const [generateSubmitting, setGenerateSubmitting] = useState(false);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCohorts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cohorts");
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Error al cargar cohortes");
      }
      const data = await res.json();
      setCohorts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar cohortes");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInvitations = useCallback(async (cohortId: string) => {
    try {
      const res = await fetch(`/api/admin/cohorts/${cohortId}/invitations`);
      if (!res.ok) return;
      const data = await res.json();
      setInvitationsByCohort((prev) => ({ ...prev, [cohortId]: data }));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchCohorts();
  }, [fetchCohorts]);

  useEffect(() => {
    cohorts.forEach((c) => {
      fetchInvitations(c.id);
    });
  }, [cohorts, fetchInvitations]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreateSubmitting(true);
    try {
      const res = await fetch("/api/admin/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          startsAt: createStartsAt || null,
          endsAt: createEndsAt || null,
          capacity: createCapacity === "" ? 0 : parseInt(createCapacity, 10),
          isActive: createIsActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear");
      setCohorts((prev) => [data, ...prev]);
      setCreateName("");
      setCreateStartsAt("");
      setCreateEndsAt("");
      setCreateCapacity("");
      setCreateIsActive(true);
      setCreateOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear cohorte");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateCohortId) return;
    setError(null);
    setGenerateSubmitting(true);
    setLastGeneratedCode(null);
    try {
      const res = await fetch("/api/admin/invitations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cohortId: generateCohortId,
          maxUses: parseInt(generateMaxUses, 10) || 1,
          expiresAt: generateExpiresAt.trim() || null,
          isActive: generateIsActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar código");
      setInvitationsByCohort((prev) => ({
        ...prev,
        [generateCohortId]: [data, ...(prev[generateCohortId] ?? [])],
      }));
      setLastGeneratedCode(data.code);
      setGenerateMaxUses("1");
      setGenerateExpiresAt("");
      setGenerateIsActive(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al generar código");
    } finally {
      setGenerateSubmitting(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isInvitationExpired = (inv: Invitation) =>
    inv.expires_at ? new Date(inv.expires_at) < new Date() : false;

  const isInvitationExhausted = (inv: Invitation) => inv.uses >= inv.max_uses;

  const invitationState = (inv: Invitation): "activo" | "agotado" | "expirado" | "inactivo" => {
    if (!inv.is_active) return "inactivo";
    if (isInvitationExhausted(inv)) return "agotado";
    if (isInvitationExpired(inv)) return "expirado";
    return "activo";
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/inicio"
            className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        <PageSection title="Cohortes e invitaciones" subtitle="Crea cohortes y genera códigos para inscribir estudiantes.">
          {error && (
            <Alert message={error} variant="error" className="mb-4" />
          )}

          <SurfaceCard padding="lg" clickable={false} className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-[var(--ink)]">Crear cohorte</h3>
              {!createOpen ? (
                <PrimaryButton onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Crear cohorte
                </PrimaryButton>
              ) : (
                <SecondaryButton onClick={() => setCreateOpen(false)}>
                  Cancelar
                </SecondaryButton>
              )}
            </div>
            {createOpen && (
              <form onSubmit={handleCreate} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    placeholder="Ej. Cohorte Marzo 2026"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                      Inicio (fecha)
                    </label>
                    <input
                      type="date"
                      value={createStartsAt}
                      onChange={(e) => setCreateStartsAt(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                      Fin (fecha)
                    </label>
                    <input
                      type="date"
                      value={createEndsAt}
                      onChange={(e) => setCreateEndsAt(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                      Capacidad (0 = sin límite)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={createCapacity}
                      onChange={(e) => setCreateCapacity(e.target.value)}
                      className="w-24 px-4 py-2 rounded-xl border border-[var(--line-subtle)] bg-white text-[var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createIsActive}
                      onChange={(e) => setCreateIsActive(e.target.checked)}
                      className="rounded border-[var(--line)]"
                    />
                    <span className="text-sm text-[var(--ink)]">Activa</span>
                  </label>
                </div>
                <PrimaryButton type="submit" disabled={createSubmitting || !createName.trim()}>
                  {createSubmitting ? "Creando…" : "Crear cohorte"}
                </PrimaryButton>
              </form>
            )}
          </SurfaceCard>

          {loading ? (
            <p className="text-[var(--ink-muted)]">Cargando cohortes…</p>
          ) : cohorts.length === 0 ? (
            <EmptyState
              title="Sin cohortes"
              description="Crea tu primera cohorte para poder generar códigos de invitación."
            />
          ) : (
            <div className="space-y-8">
              {cohorts.map((cohort) => (
                <SurfaceCard key={cohort.id} padding="lg" clickable={false}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--ink)]">{cohort.name}</h3>
                      {cohort.description && (
                        <p className="text-sm text-[var(--ink-muted)] mt-1">{cohort.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {cohort.starts_at && (
                          <span className="text-xs text-[var(--ink-muted)]">
                            Inicio: {new Date(cohort.starts_at).toLocaleDateString()}
                          </span>
                        )}
                        {cohort.ends_at && (
                          <span className="text-xs text-[var(--ink-muted)]">
                            Fin: {new Date(cohort.ends_at).toLocaleDateString()}
                          </span>
                        )}
                        {cohort.capacity > 0 && (
                          <span className="text-xs text-[var(--ink-muted)]">
                            Capacidad: {cohort.capacity}
                          </span>
                        )}
                        {!cohort.is_active && (
                          <Badge variant="pendiente">Inactiva</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[var(--line)]">
                    <h4 className="text-base font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[var(--primary)]" />
                      Códigos de invitación
                    </h4>

                    {generateCohortId === cohort.id ? (
                      <form onSubmit={handleGenerateCode} className="mb-4 p-4 rounded-xl bg-[var(--bg)] space-y-3">
                        <div className="flex flex-wrap gap-3 items-end">
                          <div>
                            <label className="block text-xs font-medium text-[var(--ink-muted)] mb-1">
                              Usos máximos
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={generateMaxUses}
                              onChange={(e) => setGenerateMaxUses(e.target.value)}
                              className="w-20 px-3 py-2 rounded-lg border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[var(--ink-muted)] mb-1">
                              Caduca (opcional)
                            </label>
                            <input
                              type="datetime-local"
                              value={generateExpiresAt}
                              onChange={(e) => setGenerateExpiresAt(e.target.value)}
                              className="px-3 py-2 rounded-lg border border-[var(--line-subtle)] bg-white text-[var(--ink)]"
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer pb-2">
                            <input
                              type="checkbox"
                              checked={generateIsActive}
                              onChange={(e) => setGenerateIsActive(e.target.checked)}
                              className="rounded border-[var(--line)]"
                            />
                            <span className="text-sm text-[var(--ink)]">Activo</span>
                          </label>
                          <PrimaryButton type="submit" disabled={generateSubmitting}>
                            {generateSubmitting ? "Generando…" : "Generar código"}
                          </PrimaryButton>
                          <SecondaryButton type="button" onClick={() => setGenerateCohortId(null)}>
                            Cerrar
                          </SecondaryButton>
                        </div>
                      </form>
                    ) : (
                      <SecondaryButton
                        onClick={() => {
                          setGenerateCohortId(cohort.id);
                          setLastGeneratedCode(null);
                        }}
                        className="mb-4"
                      >
                        <KeyRound className="w-4 h-4" />
                        Generar código
                      </SecondaryButton>
                    )}

                    {lastGeneratedCode && generateCohortId === cohort.id && (
                      <div className="mb-4 p-3 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/30 flex items-center justify-between gap-2">
                        <span className="font-mono font-semibold text-[var(--ink)]">{lastGeneratedCode}</span>
                        <button
                          type="button"
                          onClick={() => copyCode(lastGeneratedCode)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
                        >
                          <Copy className="w-4 h-4" />
                          Copiar
                        </button>
                      </div>
                    )}

                    {invitationsByCohort[cohort.id]?.length ? (
                      <div className="overflow-x-auto rounded-xl border border-[var(--line-subtle)]">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[var(--line-subtle)] bg-[var(--bg)]">
                              <th className="text-left py-3 px-4 font-semibold text-[var(--ink)]">Código</th>
                              <th className="text-left py-3 px-4 font-semibold text-[var(--ink)]">Usos</th>
                              <th className="text-left py-3 px-4 font-semibold text-[var(--ink)]">Caduca</th>
                              <th className="text-left py-3 px-4 font-semibold text-[var(--ink)]">Estado</th>
                              <th className="text-right py-3 px-4 font-semibold text-[var(--ink)]">Copiar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invitationsByCohort[cohort.id].map((inv) => (
                              <tr
                                key={inv.id}
                                className="border-b border-[var(--line-subtle)] last:border-b-0 hover:bg-[var(--bg)]/50"
                              >
                                <td className="py-2 px-4 font-mono font-medium text-[var(--ink)]">{inv.code}</td>
                                <td className="py-2 px-4 text-[var(--ink-muted)]">
                                  {inv.uses} / {inv.max_uses}
                                </td>
                                <td className="py-2 px-4 text-[var(--ink-muted)]">
                                  {inv.expires_at
                                    ? new Date(inv.expires_at).toLocaleString("es", {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                      })
                                    : "—"}
                                </td>
                                <td className="py-2 px-4">
                                  {invitationState(inv) === "activo" && (
                                    <Badge variant="completado">Activo</Badge>
                                  )}
                                  {invitationState(inv) === "agotado" && (
                                    <Badge variant="pendiente">Agotado</Badge>
                                  )}
                                  {invitationState(inv) === "expirado" && (
                                    <Badge variant="pendiente">Expirado</Badge>
                                  )}
                                  {invitationState(inv) === "inactivo" && (
                                    <Badge variant="pendiente">Inactivo</Badge>
                                  )}
                                </td>
                                <td className="py-2 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => copyCode(inv.code)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[var(--primary)] hover:bg-[var(--primary-soft)] font-medium"
                                    title="Copiar código"
                                  >
                                    <Copy className="w-4 h-4" />
                                    {copiedCode === inv.code ? "Copiado" : "Copiar"}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--ink-muted)]">Aún no hay códigos. Genera uno arriba.</p>
                    )}
                  </div>
                </SurfaceCard>
              ))}
            </div>
          )}
        </PageSection>
      </div>
    </div>
  );
}
