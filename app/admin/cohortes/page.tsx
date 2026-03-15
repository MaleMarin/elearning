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
import { Copy, Plus, KeyRound, ChevronLeft, Users, Trophy, Bell, Download } from "lucide-react";

type Cohort = {
  id: string;
  name: string;
  nombre?: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  timezone: string;
  capacity: number;
  is_active: boolean;
  courseId?: string | null;
  facilitadorId?: string | null;
  estado?: string | null;
  alumnos?: string[];
  codigoInvitacion?: string | null;
  configuracion?: { permitirAutoInscripcion?: boolean; maxAlumnos?: number; esPrivada?: boolean } | null;
  created_at: string;
  updated_at: string;
};

type CourseOption = { id: string; title: string };
type MentorOption = { userId: string; fullName: string };

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
  const [createWithCourse, setCreateWithCourse] = useState(true);
  const [createCourseId, setCreateCourseId] = useState("");
  const [createFacilitadorId, setCreateFacilitadorId] = useState("");
  const [createFechaInicio, setCreateFechaInicio] = useState("");
  const [createFechaFin, setCreateFechaFin] = useState("");
  const [createMaxAlumnos, setCreateMaxAlumnos] = useState("0");
  const [createPermitirAuto, setCreatePermitirAuto] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [progressByCohort, setProgressByCohort] = useState<Record<string, { userId: string; displayName: string | null; progressPct: number }[]>>({});
  const [rankingByCohort, setRankingByCohort] = useState<Record<string, { userId: string; displayName: string | null; progressPct: number; rank: number }[]>>({});
  const [notifyCohortId, setNotifyCohortId] = useState<string | null>(null);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [notifySubmitting, setNotifySubmitting] = useState(false);

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

  useEffect(() => {
    fetch("/api/admin/courses", { credentials: "include" })
      .then((r) => r.ok ? r.json() : { courses: [] })
      .then((data) => setCourses((data.courses ?? []).map((c: { id: string; title: string }) => ({ id: c.id, title: c.title }))))
      .catch(() => {});
  }, []);
  useEffect(() => {
    fetch("/api/mentors")
      .then((r) => r.ok ? r.json() : { mentors: [] })
      .then((data) => setMentors(data.mentors ?? []))
      .catch(() => {});
  }, []);

  const fetchProgress = useCallback((cohortId: string) => {
    fetch(`/api/admin/cohorts/${cohortId}/progress`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.progress) setProgressByCohort((prev) => ({ ...prev, [cohortId]: d.progress }));
      })
      .catch(() => {});
  }, []);
  const fetchRanking = useCallback((cohortId: string) => {
    fetch(`/api/admin/cohorts/${cohortId}/ranking`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.ranking) setRankingByCohort((prev) => ({ ...prev, [cohortId]: d.ranking }));
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreateSubmitting(true);
    try {
      const body = createWithCourse && createCourseId && createFacilitadorId && createFechaInicio && createFechaFin
        ? {
            nombre: createName.trim(),
            courseId: createCourseId,
            facilitadorId: createFacilitadorId,
            fechaInicio: createFechaInicio,
            fechaFin: createFechaFin,
            maxAlumnos: createMaxAlumnos === "" ? 0 : parseInt(createMaxAlumnos, 10),
            permitirAutoInscripcion: createPermitirAuto,
            esPrivada: true,
          }
        : {
            name: createName.trim(),
            startsAt: createStartsAt || null,
            endsAt: createEndsAt || null,
            capacity: createCapacity === "" ? 0 : parseInt(createCapacity, 10),
            isActive: createIsActive,
          };
      const res = await fetch("/api/admin/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear");
      setCohorts((prev) => [data, ...prev]);
      setCreateName("");
      setCreateStartsAt("");
      setCreateEndsAt("");
      setCreateCapacity("");
      setCreateIsActive(true);
      setCreateCourseId("");
      setCreateFacilitadorId("");
      setCreateFechaInicio("");
      setCreateFechaFin("");
      setCreateMaxAlumnos("0");
      setCreatePermitirAuto(false);
      setCreateOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear cohorte");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyCohortId) return;
    setNotifySubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cohorts/${notifyCohortId}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: notifyTitle, body: notifyBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      setNotifyCohortId(null);
      setNotifyTitle("");
      setNotifyBody("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar notificación");
    } finally {
      setNotifySubmitting(false);
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

        <PageSection title="Cohortes e invitaciones" subtitle="Crea cohortes, asigna curso y facilitador, y gestiona progreso y notificaciones.">
          {error && (
            <Alert message={error} variant="error" className="mb-4" />
          )}

          {notifyCohortId && (
            <SurfaceCard padding="lg" clickable={false} className="mb-6 border-2 border-[var(--primary)]">
              <h4 className="text-lg font-semibold text-[var(--ink)] mb-3">Enviar notificación a la cohorte</h4>
              <form onSubmit={handleNotify} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">Asunto</label>
                  <input
                    type="text"
                    value={notifyTitle}
                    onChange={(e) => setNotifyTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                    placeholder="Título del mensaje"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">Mensaje</label>
                  <textarea
                    value={notifyBody}
                    onChange={(e) => setNotifyBody(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                    placeholder="Texto para todos los alumnos de la cohorte"
                  />
                </div>
                <div className="flex gap-2">
                  <PrimaryButton type="submit" disabled={notifySubmitting}>
                    {notifySubmitting ? "Enviando…" : "Enviar a toda la cohorte"}
                  </PrimaryButton>
                  <SecondaryButton type="button" onClick={() => { setNotifyCohortId(null); setNotifyTitle(""); setNotifyBody(""); }}>
                    Cancelar
                  </SecondaryButton>
                </div>
              </form>
            </SurfaceCard>
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createWithCourse}
                    onChange={(e) => setCreateWithCourse(e.target.checked)}
                    className="rounded border-[var(--line)]"
                  />
                  <span className="text-sm text-[var(--ink)]">Cohorte con curso y facilitador (fechas y código 6 caracteres)</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] input-premium"
                    placeholder="Ej. Cohorte 2025-I SHCP"
                  />
                </div>
                {createWithCourse && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[var(--ink)] mb-1">Curso *</label>
                      <select
                        value={createCourseId}
                        onChange={(e) => setCreateCourseId(e.target.value)}
                        required={createWithCourse}
                        className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                      >
                        <option value="">Seleccionar curso</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--ink)] mb-1">Facilitador *</label>
                      <select
                        value={createFacilitadorId}
                        onChange={(e) => setCreateFacilitadorId(e.target.value)}
                        required={createWithCourse}
                        className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                      >
                        <option value="">Seleccionar facilitador</option>
                        {mentors.map((m) => (
                          <option key={m.userId} value={m.userId}>{m.fullName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--ink)] mb-1">Fecha inicio *</label>
                        <input
                          type="date"
                          value={createFechaInicio}
                          onChange={(e) => setCreateFechaInicio(e.target.value)}
                          required={createWithCourse}
                          className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] input-premium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--ink)] mb-1">Fecha fin *</label>
                        <input
                          type="date"
                          value={createFechaFin}
                          onChange={(e) => setCreateFechaFin(e.target.value)}
                          required={createWithCourse}
                          className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] input-premium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--ink)] mb-1">Límite de alumnos (0 = sin límite)</label>
                      <input
                        type="number"
                        min={0}
                        value={createMaxAlumnos}
                        onChange={(e) => setCreateMaxAlumnos(e.target.value)}
                        className="w-24 px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] input-premium"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createPermitirAuto}
                        onChange={(e) => setCreatePermitirAuto(e.target.checked)}
                        className="rounded border-[var(--line)]"
                      />
                      <span className="text-sm text-[var(--ink)]">Permitir autoinscripción con código de 6 caracteres</span>
                    </label>
                  </>
                )}
                {!createWithCourse && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--ink)] mb-1">Inicio (fecha)</label>
                        <input type="date" value={createStartsAt} onChange={(e) => setCreateStartsAt(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] input-premium" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--ink)] mb-1">Fin (fecha)</label>
                        <input type="date" value={createEndsAt} onChange={(e) => setCreateEndsAt(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] input-premium" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--ink)] mb-1">Capacidad (0 = sin límite)</label>
                        <input type="number" min={0} value={createCapacity} onChange={(e) => setCreateCapacity(e.target.value)} className="w-24 px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] input-premium" />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={createIsActive} onChange={(e) => setCreateIsActive(e.target.checked)} className="rounded border-[var(--line)]" />
                        <span className="text-sm text-[var(--ink)]">Activa</span>
                      </label>
                    </div>
                  </>
                )}
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
                      <h3 className="text-lg font-semibold text-[var(--ink)]">{cohort.nombre ?? cohort.name}</h3>
                      {cohort.description && (
                        <p className="text-sm text-[var(--ink-muted)] mt-1">{cohort.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 items-center">
                        {cohort.estado && (
                          <Badge variant={cohort.estado === "activa" ? "completado" : cohort.estado === "finalizada" ? "pendiente" : "en-curso"}>
                            {cohort.estado}
                          </Badge>
                        )}
                        {(cohort.fechaInicio || cohort.starts_at) && (
                          <span className="text-xs text-[var(--ink-muted)]">
                            Inicio: {new Date((cohort.fechaInicio ?? cohort.starts_at) as string).toLocaleDateString()}
                          </span>
                        )}
                        {(cohort.fechaFin || cohort.ends_at) && (
                          <span className="text-xs text-[var(--ink-muted)]">
                            Fin: {new Date((cohort.fechaFin ?? cohort.ends_at) as string).toLocaleDateString()}
                          </span>
                        )}
                        {(cohort.capacity > 0 || (cohort.configuracion?.maxAlumnos ?? 0) > 0) && (
                          <span className="text-xs text-[var(--ink-muted)]">
                            Límite: {cohort.configuracion?.maxAlumnos ?? cohort.capacity}
                          </span>
                        )}
                        {cohort.alumnos && <span className="text-xs text-[var(--ink-muted)]">Alumnos: {cohort.alumnos.length}</span>}
                        {!cohort.is_active && !cohort.estado && (
                          <Badge variant="pendiente">Inactiva</Badge>
                        )}
                      </div>
                    </div>
                    {cohort.codigoInvitacion && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--surface-soft)] border border-[var(--line-subtle)]">
                        <span className="text-xs text-[var(--muted)]">Código 6 chars</span>
                        <span className="font-mono font-semibold text-[var(--ink)]">{cohort.codigoInvitacion}</span>
                        <SecondaryButton type="button" onClick={() => copyCode(cohort.codigoInvitacion!)} className="min-h-0 py-1 px-2 text-sm">
                          <Copy className="w-4 h-4" /> {copiedCode === cohort.codigoInvitacion ? "Copiado" : "Copiar"}
                        </SecondaryButton>
                      </div>
                    )}
                  </div>

                  {(cohort.courseId || cohort.codigoInvitacion) && (
                    <div className="mt-6 pt-6 border-t border-[var(--line)]">
                      <h4 className="text-base font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[var(--primary)]" />
                        Progreso del grupo
                      </h4>
                      <SecondaryButton type="button" onClick={() => { fetchProgress(cohort.id); fetchRanking(cohort.id); }} className="mb-3">
                        Cargar progreso y ranking
                      </SecondaryButton>
                      {progressByCohort[cohort.id] && (
                        <div className="overflow-x-auto rounded-xl border border-[var(--line-subtle)] mb-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-[var(--line-subtle)] bg-[var(--bg)]">
                                <th className="text-left py-2 px-3 font-semibold text-[var(--ink)]">Alumno</th>
                                <th className="text-right py-2 px-3 font-semibold text-[var(--ink)]">Avance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {progressByCohort[cohort.id].map((r) => (
                                <tr key={r.userId} className="border-b border-[var(--line-subtle)] last:border-b-0">
                                  <td className="py-2 px-3 text-[var(--ink)]">{r.displayName || r.userId}</td>
                                  <td className="py-2 px-3 text-right font-medium">{r.progressPct}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {rankingByCohort[cohort.id] && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-[var(--ink)] mb-2 flex items-center gap-1">
                            <Trophy className="w-4 h-4" /> Ranking
                          </h5>
                          <ol className="list-decimal list-inside text-sm text-[var(--ink)] space-y-1">
                            {rankingByCohort[cohort.id].slice(0, 10).map((r) => (
                              <li key={r.userId}>{r.displayName || r.userId} — {r.progressPct}%</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <SecondaryButton href={`/admin/cohortes/${cohort.id}/retos`}>
                          <Trophy className="w-4 h-4" /> Retos
                        </SecondaryButton>
                        <SecondaryButton type="button" onClick={() => { setNotifyCohortId(cohort.id); setNotifyTitle(""); setNotifyBody(""); }}>
                          <Bell className="w-4 h-4" /> Enviar notificación
                        </SecondaryButton>
                        <SecondaryButton
                          type="button"
                          onClick={() => {
                            fetch(`/api/admin/cohorts/${cohort.id}/export`, { credentials: "include" })
                              .then((r) => r.blob())
                              .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `cohorte-${cohort.id}-progreso.csv`;
                                a.click();
                                URL.revokeObjectURL(url);
                              })
                              .catch(() => setError("Error al exportar"));
                          }}
                        >
                          <Download className="w-4 h-4" /> Exportar CSV
                        </SecondaryButton>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-[var(--line)]">
                    <h4 className="text-base font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[var(--primary)]" />
                      Códigos de invitación (legacy)
                    </h4>

                    {generateCohortId === cohort.id ? (
                      <SurfaceCard variant="soft" padding="sm" clickable={false} className="mb-4">
                        <form onSubmit={handleGenerateCode} className="space-y-3">
                        <div className="flex flex-wrap gap-3 items-end">
                          <div>
                            <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                              Usos máximos
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={generateMaxUses}
                              onChange={(e) => setGenerateMaxUses(e.target.value)}
                              className="w-20 px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] input-premium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                              Caduca (opcional)
                            </label>
                            <input
                              type="datetime-local"
                              value={generateExpiresAt}
                              onChange={(e) => setGenerateExpiresAt(e.target.value)}
                              className="px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] input-premium"
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
                      </SurfaceCard>
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
                      <div className="mb-4 p-3 rounded-[20px] bg-[var(--surface-soft)] border border-[var(--line)] flex items-center justify-between gap-2 shadow-[var(--shadow-card-inset)]">
                        <span className="font-mono font-semibold text-[var(--ink)]">{lastGeneratedCode}</span>
                        <SecondaryButton
                          type="button"
                          onClick={() => copyCode(lastGeneratedCode)}
                          className="text-sm inline-flex items-center gap-1"
                        >
                          <Copy className="w-4 h-4" />
                          Copiar
                        </SecondaryButton>
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
                                  <SecondaryButton
                                    type="button"
                                    onClick={() => copyCode(inv.code)}
                                    className="text-sm min-h-0 py-1.5 px-2"
                                    title="Copiar código"
                                  >
                                    <Copy className="w-4 h-4" />
                                    {copiedCode === inv.code ? "Copiado" : "Copiar"}
                                  </SecondaryButton>
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
