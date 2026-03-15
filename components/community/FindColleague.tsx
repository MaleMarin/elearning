"use client";

import { useState, useEffect } from "react";
import { Users, Loader2 } from "lucide-react";

interface Pair {
  id: string;
  userA: string;
  userB: string;
  moduleId: string;
  status: string;
  partnerId?: string;
  partnerName?: string;
}

interface Preference {
  lookingForPartner: boolean;
  cohortId: string | null;
  updatedAt: string | null;
}

interface FindColleagueProps {
  onMatched?: (pair: Pair) => void;
}

export function FindColleague({ onMatched }: FindColleagueProps) {
  const [preference, setPreference] = useState<Preference | null>(null);
  const [pair, setPair] = useState<Pair | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [moduleTitle, setModuleTitle] = useState<string | null>(null);

  const fetchMe = async () => {
    const [prefRes, meRes] = await Promise.all([
      fetch("/api/learning-pairs/preference", { credentials: "include" }),
      fetch("/api/learning-pairs/me", { credentials: "include" }),
    ]);
    const prefData = await prefRes.json();
    const meData = await meRes.json();
    setPreference(prefData.preference ?? { lookingForPartner: false, cohortId: null, updatedAt: null });
    setPair(meData.pair ?? null);
    setModuleTitle(meData.moduleTitle ?? null);
  };

  useEffect(() => {
    fetchMe().finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    if (submitting || !preference) return;
    const next = !preference.lookingForPartner;
    setSubmitting(true);
    try {
      const res = await fetch("/api/learning-pairs/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lookingForPartner: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setPreference((p) => (p ? { ...p, lookingForPartner: next } : null));
      if (data.pair) {
        setPair(data.pair);
        onMatched?.(data.pair);
      }
      if (next && !data.pair) await fetchMe();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[var(--ink-muted)] text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
      </div>
    );
  }

  const hasCohort = preference?.cohortId != null;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="font-semibold text-[var(--ink)]">Aprendo con un colega</h3>
      </div>
      <p className="text-sm text-[var(--ink-muted)]">
        Activa la opción para que el sistema te empareje con otro alumno (diferente institución y cargo) y completen un módulo juntos en 7 días.
      </p>
      {!hasCohort && <p className="text-sm text-amber-700">Necesitas estar inscrito en una cohorte activa.</p>}
      {hasCohort && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={preference?.lookingForPartner ?? false}
            onChange={handleToggle}
            disabled={submitting || !!pair}
            className="rounded border-[var(--line)]"
          />
          <span className="text-sm text-[var(--ink)]">
            {pair ? "Ya estás emparejado" : preference?.lookingForPartner ? "Buscando colega…" : "Buscar colega de aprendizaje"}
          </span>
        </label>
      )}
      {pair && (
        <div className="text-sm text-[var(--ink)] bg-[var(--cream)]/50 rounded-lg p-3">
          <p className="font-medium">Te emparejamos con {pair.partnerName ?? "un compañero"}</p>
          {moduleTitle && <p className="text-[var(--ink-muted)] mt-1">Módulo: {moduleTitle}</p>}
          <p className="text-[var(--ink-muted)] mt-1">Tienen 7 días. Usa el chat en esta página.</p>
        </div>
      )}
    </div>
  );
}
