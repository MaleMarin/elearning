"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AlumniDirectory } from "@/components/community/AlumniDirectory";

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
    <div style={{ flex: 1, padding: "20px 20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "'Syne', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/inicio" style={{ fontSize: 13, color: "#8892b0", marginBottom: 8, display: "inline-block" }}>← Inicio</Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", letterSpacing: "-0.5px" }}>Egresados</h1>
        <p style={{ fontSize: 13, color: "#8892b0", marginTop: 4 }}>Red de quienes completaron Política Digital. Filtra por institución, región o grupo.</p>
      </div>

      <div
        style={{
          background: "#e8eaf0",
          borderRadius: 20,
          padding: 24,
          boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
        }}
      >
        {loading ? (
          <p style={{ fontSize: 13, color: "#8892b0" }}>Cargando…</p>
        ) : (
          <AlumniDirectory
            alumni={alumni}
            suggested={suggested}
            filters={filters}
            onFilterChange={handleFilterChange}
            cohortOptions={cohortOptions}
          />
        )}
      </div>

      {!loading && alumni.length === 0 && suggested.length === 0 && (
        <div
          style={{
            background: "#e8eaf0",
            borderRadius: 16,
            padding: 24,
            marginTop: 16,
            textAlign: "center",
            boxShadow: "5px 5px 12px #c2c8d6, -5px -5px 12px #ffffff",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0a0f8a" }}>Los egresados del programa aparecerán aquí</p>
          <p style={{ fontSize: 13, color: "#8892b0", marginTop: 6 }}>Cuando haya egresados podrás ver el directorio.</p>
        </div>
      )}
    </div>
  );
}
