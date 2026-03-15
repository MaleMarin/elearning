"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SurfaceCard } from "@/components/ui";
import { AlumniDirectory } from "@/components/community/AlumniDirectory";
import { ChevronLeft, Award } from "lucide-react";

interface AlumniEntry {
  userId: string;
  fullName: string;
  institution: string | null;
  position: string | null;
  region: string | null;
  cohortId: string | null;
  cohortName: string | null;
  linkedIn: string | null;
}

export default function EgresadosPage() {
  const [alumni, setAlumni] = useState<AlumniEntry[]>([]);
  const [suggested, setSuggested] = useState<AlumniEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ institution: "", region: "", cohortId: "" });
  const [cohortOptions, setCohortOptions] = useState<{ id: string; name: string }[]>([]);

  const fetchAlumni = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.institution) params.set("institution", filters.institution);
    if (filters.region) params.set("region", filters.region);
    if (filters.cohortId) params.set("cohortId", filters.cohortId);
    fetch(`/api/alumni?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setAlumni(d.alumni ?? []))
      .catch(() => setAlumni([]));
  }, [filters.institution, filters.region, filters.cohortId]);

  useEffect(() => {
    setLoading(true);
    fetchAlumni();
    fetch("/api/alumni/suggested", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSuggested(d.suggested ?? []))
      .catch(() => setSuggested([]));
    fetch("/api/cohorts", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { cohorts: [] }))
      .then((d) => setCohortOptions((d.cohorts ?? []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))))
      .catch(() => setCohortOptions([]));
    setLoading(false);
  }, [fetchAlumni]);

  const handleFilterChange = (key: "institution" | "region" | "cohortId", value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const t = setTimeout(fetchAlumni, 300);
    return () => clearTimeout(t);
  }, [filters, fetchAlumni]);

  return (
    <div className="max-w-2xl w-full space-y-6">
      <nav className="text-sm text-[var(--ink-muted)]">
        <Link href="/inicio" className="hover:text-[var(--primary)] rounded">Inicio</Link>
        {" · "}
        <span className="text-[var(--ink)] font-medium">Egresados</span>
      </nav>
      <Link href="/inicio" className="inline-flex items-center gap-2 text-[var(--ink-muted)] hover:text-[var(--ink)] text-sm font-medium">
        <ChevronLeft className="w-4 h-4" /> Volver
      </Link>
      <SurfaceCard padding="lg" clickable={false}>
        <h1 className="text-xl font-semibold text-[var(--ink)] mb-2 flex items-center gap-2">
          <Award className="w-6 h-6 text-[var(--primary)]" />
          Red de egresados
        </h1>
        <p className="text-sm text-[var(--ink-muted)] mb-6">
          Directorio de quienes completaron Política Digital. Filtra por institución, región o cohorte. Los egresados llevan el badge &quot;Egresado Política Digital&quot;.
        </p>
        {loading ? (
          <p className="text-[var(--ink-muted)]">Cargando…</p>
        ) : (
          <AlumniDirectory
            alumni={alumni}
            suggested={suggested}
            filters={filters}
            onFilterChange={handleFilterChange}
            cohortOptions={cohortOptions}
          />
        )}
      </SurfaceCard>
    </div>
  );
}
