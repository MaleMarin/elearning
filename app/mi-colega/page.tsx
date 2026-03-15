"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { FindColleague } from "@/components/community/FindColleague";
import { PairChat } from "@/components/community/PairChat";
import { ChevronLeft, CheckCircle, Loader2 } from "lucide-react";

function CompletePairButton({ pairId, onCompleted }: { pairId: string; onCompleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/learning-pairs/${pairId}/complete`, { method: "POST", credentials: "include" });
      if (res.ok) onCompleted();
    } finally {
      setLoading(false);
    }
  };
  return (
    <button type="button" onClick={handleComplete} disabled={loading} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
      Marcar módulo completado en equipo
    </button>
  );
}

interface Pair {
  id: string;
  userA: string;
  userB: string;
  moduleId: string;
  status: string;
  partnerId?: string;
  partnerName?: string;
}

export default function MiColegaPage() {
  const [pair, setPair] = useState<Pair | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/learning-pairs/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setPair(d.pair ?? null);
        setModuleTitle(d.moduleTitle ?? null);
      })
      .catch(() => setPair(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUserId(d.uid ?? null))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl w-full space-y-6">
      <nav className="text-sm text-[var(--ink-muted)]" aria-label="Breadcrumb">
        <Link href="/inicio" className="hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded">
          Inicio
        </Link>
        {" · "}
        <span className="text-[var(--ink)] font-medium">Mi colega</span>
      </nav>

      <Link
        href="/inicio"
        className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden />
        Volver
      </Link>

      <SurfaceCard padding="lg" clickable={false}>
        <h1 className="text-xl font-semibold text-[var(--ink)] mb-2">Aprendo con un colega</h1>
        <p className="text-sm text-[var(--ink-muted)] mb-6">
          Activa la búsqueda para que te emparejemos con otro alumno y completen un módulo juntos. Tienen 7 días y un chat privado para coordinarse.
        </p>

        <FindColleague onMatched={(p) => setPair(p)} />

        {!loading && pair && pair.status === "active" && userId && (
          <div className="mt-6 space-y-4">
            <PairChat pairId={pair.id} currentUserId={userId} pollIntervalMs={30000} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/curso/modulos/${pair.moduleId}/recursos`}
                className="text-sm text-[var(--primary)] font-medium hover:underline"
              >
                Ir al módulo asignado →
              </Link>
              <CompletePairButton pairId={pair.id} onCompleted={() => setPair((p) => (p ? { ...p, status: "completed" } : null))} />
            </div>
          </div>
        )}

        {!loading && pair && pair.status === "completed" && (
          <div className="mt-6 p-4 rounded-xl border border-green-200 bg-green-50/50 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-[var(--ink)]">Módulo completado en equipo</p>
              <p className="text-sm text-[var(--ink-muted)]">Ambos recibieron el badge &quot;Aprendí en equipo&quot;.</p>
            </div>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
