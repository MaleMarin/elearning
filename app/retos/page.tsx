"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RetoCard from "@/components/retos/RetoCard";
import Leaderboard from "@/components/retos/Leaderboard";
import EquipoCard from "@/components/retos/EquipoCard";
import type { RetoActivo } from "@/app/api/retos/route";
import type { LeaderboardEntry } from "@/app/api/retos/leaderboard/route";

type TabId = "activos" | "leaderboard" | "equipo" | "historial";

const TABS: { id: TabId; label: string }[] = [
  { id: "activos", label: "Retos activos" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "equipo", label: "Mi equipo" },
  { id: "historial", label: "Historial" },
];

const baseLayout = {
  flex: 1,
  padding: "24px 32px",
  background: "#e8eaf0",
  minHeight: "100vh",
  fontFamily: "'Raleway', sans-serif",
  maxWidth: 1100,
  margin: "0 auto",
  width: "100%",
} as const;

export default function RetosPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("activos");
  const [retos, setRetos] = useState<RetoActivo[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/retos", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/retos/leaderboard", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([retosRes, lbRes]) => {
        setRetos(retosRes.retos ?? []);
        setLeaderboard(lbRes.leaderboard ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleParticipar = (id: string) => {
    fetch(`/api/retos/${id}/participar`, { method: "POST", credentials: "include" })
      .then((r) => r.json())
      .then(() => {});
  };

  const tabButtonStyle = (active: boolean) => ({
    padding: "10px 16px",
    borderRadius: 12,
    border: "none" as const,
    cursor: "pointer" as const,
    fontFamily: "'Raleway', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    background: "#e8eaf0",
    color: active ? "#0a0f8a" : "#4a5580",
    boxShadow: active ? "inset 2px 2px 5px #c2c8d6, inset -2px -2px 5px #ffffff" : "4px 4px 10px #c2c8d6, -4px -4px 10px #ffffff",
  });

  return (
    <div style={baseLayout}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a0f8a", marginBottom: 4 }}>Retos del grupo</h1>
      <p style={{ fontSize: 13, color: "#8892b0", marginBottom: 24 }}>Participa en retos y compite con tu grupo</p>

      <div role="tablist" aria-label="Secciones de retos" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            id={`tab-${t.id}`}
            type="button"
            onClick={() => setTab(t.id)}
            style={tabButtonStyle(tab === t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontSize: 14, color: "#4a5580" }}>Cargando…</p>
      ) : (
        <>
          <div id="panel-activos" role="tabpanel" aria-labelledby="tab-activos" hidden={tab !== "activos"} style={tab !== "activos" ? { display: "none" } : undefined}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {retos.length === 0 ? (
                <p style={{ fontSize: 14, color: "#4a5580" }}>No hay retos activos en este momento.</p>
              ) : (
                retos.map((reto) => (
                  <RetoCard
                    key={reto.id}
                    reto={reto}
                    onParticipar={handleParticipar}
                    onVerDetalles={(id) => router.push(`/retos/${id}`)}
                  />
                ))
              )}
            </div>
          </div>

          <div id="panel-leaderboard" role="tabpanel" aria-labelledby="tab-leaderboard" hidden={tab !== "leaderboard"} style={tab !== "leaderboard" ? { display: "none" } : undefined}>
            <Leaderboard entries={leaderboard} />
          </div>

          <div id="panel-equipo" role="tabpanel" aria-labelledby="tab-equipo" hidden={tab !== "equipo"} style={tab !== "equipo" ? { display: "none" } : undefined}>
            <EquipoCard tieneEquipo={true} onVerEquipos={() => {}} onCreateEquipo={() => {}} />
          </div>

          <div id="panel-historial" role="tabpanel" aria-labelledby="tab-historial" hidden={tab !== "historial"} style={tab !== "historial" ? { display: "none" } : undefined}>
            <div style={{ background: "#e8eaf0", borderRadius: 16, padding: 20, boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff" }}>
              <p style={{ margin: 0, fontSize: 14, color: "#4a5580" }}>Historial de retos completados del grupo. (Próximamente)</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
