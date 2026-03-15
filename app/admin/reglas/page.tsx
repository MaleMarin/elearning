"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ListChecks, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  SurfaceCard,
  PageSection,
  PrimaryButton,
  SecondaryButton,
  Badge,
  Alert,
} from "@/components/ui";
import type { EnrollmentRule, EnrollmentRuleTrigger } from "@/lib/services/enrollment-rules";

type Course = { id: string; title: string; status?: string };
type Cohort = { id: string; nombre?: string; name?: string };

export default function AdminReglasPage() {
  const [rules, setRules] = useState<EnrollmentRule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    trigger: "course_completed" as EnrollmentRuleTrigger,
    completedCourseId: "",
    enrollInCourseId: "",
    assignCohortId: "",
    enviarNotificacion: true,
    active: true,
  });

  const loadRules = useCallback(async () => {
    const res = await fetch("/api/admin/reglas", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      setError("Debes iniciar sesión");
      setRules([]);
      return;
    }
    if (res.status === 403) {
      setError("No tienes permisos de admin");
      setRules([]);
      return;
    }
    if (!res.ok) {
      setError((data as { error?: string }).error ?? `Error ${res.status}`);
      setRules([]);
      return;
    }
    setRules(Array.isArray((data as { rules?: EnrollmentRule[] }).rules) ? (data as { rules: EnrollmentRule[] }).rules : []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [rulesRes, coursesRes, cohortsRes] = await Promise.all([
          fetch("/api/admin/reglas", { credentials: "include" }),
          fetch("/api/admin/courses", { credentials: "include" }),
          fetch("/api/admin/cohorts", { credentials: "include" }),
        ]);
        if (cancelled) return;
        const rulesData = await rulesRes.json().catch(() => ({}));
        const coursesData = await coursesRes.json().catch(() => ({}));
        const cohortsData = await cohortsRes.json().catch(() => ({}));
        if (rulesRes.ok) setRules(Array.isArray(rulesData.rules) ? rulesData.rules : []);
        if (coursesRes.ok) setCourses(Array.isArray(coursesData.courses) ? coursesData.courses : []);
        if (cohortsRes.ok) setCohorts(Array.isArray(cohortsData) ? cohortsData : Array.isArray((cohortsData as { cohorts?: Cohort[] }).cohorts) ? (cohortsData as { cohorts: Cohort[] }).cohorts : []);
        if (!rulesRes.ok && rulesRes.status !== 401 && rulesRes.status !== 403) {
          setError((rulesData as { error?: string }).error ?? "Error al cargar reglas");
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error de red");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !form.enrollInCourseId.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reglas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim() || "Al completar curso",
          trigger: form.trigger,
          conditions: form.trigger === "course_completed" ? { completedCourseId: form.completedCourseId.trim() || undefined } : {},
          action: {
            enrollInCourseId: form.enrollInCourseId.trim(),
            assignCohortId: form.assignCohortId.trim() || undefined,
            enviarNotificacion: form.enviarNotificacion,
          },
          active: form.active,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Error al crear");
        return;
      }
      if ((data as { rule?: EnrollmentRule }).rule) {
        setRules((prev) => [(data as { rule: EnrollmentRule }).rule, ...prev]);
      } else {
        await loadRules();
      }
      setForm({ name: "", trigger: "course_completed", completedCourseId: "", enrollInCourseId: "", assignCohortId: "", enviarNotificacion: true, active: true });
      setFormOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (rule: EnrollmentRule) => {
    try {
      const res = await fetch(`/api/admin/reglas/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !rule.active }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error);
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, active: !r.active } : r)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta regla?")) return;
    try {
      const res = await fetch(`/api/admin/reglas/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error);
      }
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  };

  const courseTitle = (id: string) => courses.find((c) => c.id === id)?.title ?? id;
  const cohortName = (id: string) => cohorts.find((c) => c.id === id)?.nombre ?? cohorts.find((c) => c.id === id)?.name ?? id;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        <PageSection
          title="Reglas de inscripción automática"
          subtitle="Al completar un curso, inscribir al alumno en otro curso o grupo."
        >
          {error && (
            <div className="mb-6">
              <Alert message={error} variant="error" />
              <SecondaryButton onClick={() => setError(null)} className="mt-2">Cerrar</SecondaryButton>
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--success-soft)] border border-[var(--success)]/30 text-[var(--success)] text-sm font-medium">
              {successMessage}
            </div>
          )}

          <SurfaceCard padding="lg" className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-[var(--ink)] flex items-center gap-2">
                <ListChecks className="w-5 h-5" />
                Reglas
              </h3>
              <div className="flex items-center gap-2">
                <SecondaryButton
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const res = await fetch("/api/admin/reglas/ejecutar", {
                        method: "POST",
                        credentials: "include",
                      });
                      const data = await res.json().catch(() => ({}));
                      if (res.ok && data.ejecutadas != null) {
                        setError(null);
                        setSuccessMessage(`Ejecutadas ${data.ejecutadas} reglas.`);
                        setTimeout(() => setSuccessMessage(""), 4000);
                      } else {
                        setError((data as { error?: string }).error ?? "Error al ejecutar");
                      }
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Error al ejecutar");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="inline-flex items-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" aria-hidden />
                  ) : (
                    <ListChecks className="w-4 h-4" aria-hidden />
                  )}
                  Ejecutar reglas ahora
                </SecondaryButton>
                <SecondaryButton onClick={loadRules} disabled={loading} className="inline-flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </SecondaryButton>
                <PrimaryButton onClick={() => setFormOpen((o) => !o)} className="inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva regla
                </PrimaryButton>
              </div>
            </div>

            {formOpen && (
              <form onSubmit={handleCreate} className="mt-6 p-4 rounded-xl bg-[var(--bg-soft)] border border-[var(--border)]">
                <h4 className="font-medium text-[var(--ink)] mb-4">Crear regla</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[var(--ink-muted)] mb-1">Nombre</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Ej. Al completar Intro → Curso Avanzado"
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--ink)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--ink-muted)] mb-1">Disparador</label>
                    <select
                      value={form.trigger}
                      onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value as EnrollmentRuleTrigger }))}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--ink)]"
                    >
                      <option value="course_completed">Al completar un curso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--ink-muted)] mb-1">Al completar este curso</label>
                    <select
                      value={form.completedCourseId}
                      onChange={(e) => setForm((f) => ({ ...f, completedCourseId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--ink)]"
                    >
                      <option value="">— Seleccionar —</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--ink-muted)] mb-1">Inscribir en curso *</label>
                    <select
                      value={form.enrollInCourseId}
                      onChange={(e) => setForm((f) => ({ ...f, enrollInCourseId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--ink)]"
                      required
                    >
                      <option value="">— Seleccionar —</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--ink-muted)] mb-1">Asignar a grupo (opcional)</label>
                    <select
                      value={form.assignCohortId}
                      onChange={(e) => setForm((f) => ({ ...f, assignCohortId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--ink)]"
                    >
                      <option value="">— Ninguna —</option>
                      {cohorts.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre ?? c.name ?? c.id}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <input
                      type="checkbox"
                      id="form-enviar-notif"
                      checked={form.enviarNotificacion}
                      onChange={(e) => setForm((f) => ({ ...f, enviarNotificacion: e.target.checked }))}
                      className="rounded border-[var(--border)]"
                    />
                    <label htmlFor="form-enviar-notif" className="text-sm text-[var(--ink)]">Enviar notificación al alumno (push)</label>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <input
                      type="checkbox"
                      id="form-active"
                      checked={form.active}
                      onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                      className="rounded border-[var(--border)]"
                    />
                    <label htmlFor="form-active" className="text-sm text-[var(--ink)]">Regla activa</label>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <PrimaryButton type="submit" disabled={submitting || !form.enrollInCourseId.trim()}>
                    {submitting ? "Guardando…" : "Crear regla"}
                  </PrimaryButton>
                  <SecondaryButton type="button" onClick={() => setFormOpen(false)}>Cancelar</SecondaryButton>
                </div>
              </form>
            )}

            {loading ? (
              <p className="mt-6 text-[var(--ink-muted)]">Cargando reglas…</p>
            ) : rules.length === 0 ? (
              <p className="mt-6 text-[var(--ink-muted)]">No hay reglas. Crea una para inscribir automáticamente al completar un curso.</p>
            ) : (
              <ul className="mt-6 space-y-3">
                {rules.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]"
                  >
                    <div>
                      <p className="font-medium text-[var(--ink)]">{r.name || "Sin nombre"}</p>
                      <p className="text-sm text-[var(--ink-muted)]">
                        {r.trigger === "course_completed" && r.conditions?.completedCourseId && (
                          <>Al completar <strong>{courseTitle(r.conditions.completedCourseId)}</strong> → inscribir en <strong>{courseTitle(r.action.enrollInCourseId)}</strong></>
                        )}
                        {r.action.assignCohortId && (
                          <> → grupo <strong>{cohortName(r.action.assignCohortId)}</strong></>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.active ? "completado" : "pendiente"}>{r.active ? "Activa" : "Inactiva"}</Badge>
                      <SecondaryButton
                        onClick={() => handleToggleActive(r)}
                        className="text-sm"
                      >
                        {r.active ? "Desactivar" : "Activar"}
                      </SecondaryButton>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="p-2 text-[var(--ink-muted)] hover:text-red-600 rounded"
                        aria-label="Eliminar regla"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SurfaceCard>
        </PageSection>
      </div>
    </div>
  );
}
