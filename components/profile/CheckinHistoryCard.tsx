"use client";

import { useState, useEffect } from "react";
import type { Checkin } from "@/lib/services/checkin";

export function CheckinHistoryCard() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/checkin/history?weeks=4", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { checkins?: Checkin[] } | null) => {
        if (d?.checkins) setCheckins(d.checkins);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const last7 = [...checkins]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 7)
    .reverse();

  if (loading) {
    return (
      <div>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#0a0f8a", marginBottom: 12, fontFamily: "'Syne', sans-serif" }}>Mi historial de energía</p>
        <p style={{ fontSize: 12, color: "#8892b0" }}>Cargando historial…</p>
      </div>
    );
  }

  if (checkins.length === 0) {
    return (
      <div>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#0a0f8a", marginBottom: 12, fontFamily: "'Syne', sans-serif" }}>Mi historial de energía</p>
        <p style={{ fontSize: 13, color: "#8892b0", lineHeight: 1.5 }}>
          Completa el check-in diario en Inicio para ver tu historial.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 14, fontWeight: 800, color: "#0a0f8a", marginBottom: 12, fontFamily: "'Syne', sans-serif" }}>Mi historial de energía</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {last7.map((c) => {
          const total = c.energia + c.foco;
          const pct = Math.round((total / 6) * 100);
          return (
            <div key={c.fecha} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11, color: "#4a5580", fontFamily: "'Space Mono', monospace", minWidth: 56 }}>{c.fecha}</span>
              <div style={{ flex: 1, height: 12, background: "#e8eaf0", borderRadius: 6, boxShadow: "inset 2px 2px 5px #c2c8d6", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #1428d4, #2b4fff)", borderRadius: 6 }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#1428d4", fontFamily: "'Space Mono', monospace", minWidth: 32 }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
