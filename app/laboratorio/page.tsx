"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LabHub } from "@/components/lab/LabHub";
import { EmptyState } from "@/components/ui";
import { getDemoMode } from "@/lib/env";

type ZoneCard = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  activeToday: number;
  hasNewContent: boolean;
};

export default function LaboratorioPage() {
  const [data, setData] = useState<{
    weeklyPhrase: string;
    zones: ZoneCard[];
    hablasHumano: ZoneCard & { name: string; description: string; href: string; icon: string };
    simulador?: ZoneCard & { name: string; description: string; href: string; icon: string; featured?: boolean };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lab/hub", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && !("error" in d) && setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <p className="text-[var(--ink-muted)]">Cargando…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <EmptyState
          title="Acceso al Laboratorio"
          description="Inicia sesión para entrar a El Laboratorio."
          ctaLabel="Ir a inicio"
          ctaHref="/inicio"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/inicio" className="text-[var(--primary)] hover:underline text-sm mb-6 inline-block">
        ← Inicio
      </Link>
      <LabHub
        weeklyPhrase={data.weeklyPhrase}
        zones={data.zones}
        hablasHumano={data.hablasHumano}
        simulador={data.simulador}
      />
      <Link href="/laboratorio/escape" className="mt-6 block">
        <div
          className="rounded-xl p-5 border border-[var(--primary)]/30 bg-[var(--primary-soft)]/20 hover:bg-[var(--primary-soft)]/30 transition-colors"
          style={{ boxShadow: "var(--neu-shadow-out-sm)" }}
        >
          <span className="text-lg" aria-hidden>🚨</span>
          <h2 className="text-base font-semibold text-[var(--ink)] mt-2">Simulador de crisis · Ciberseguridad</h2>
          <p className="text-sm text-[var(--ink-muted)] mt-1">Toma decisiones en un escenario de brecha de datos y cumple la LFPDPPP.</p>
        </div>
      </Link>
    </div>
  );
}
