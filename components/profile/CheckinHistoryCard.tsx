"use client";

import { useState, useEffect } from "react";
import { SurfaceCard } from "@/components/ui";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Checkin } from "@/lib/services/checkin";

function getBestDayInsight(checkins: Checkin[]): string | null {
  if (checkins.length < 7) return null;
  const byDay: Record<number, { sum: number; count: number }> = {};
  for (let i = 0; i < 7; i++) byDay[i] = { sum: 0, count: 0 };
  checkins.forEach((c) => {
    const d = new Date(c.fecha).getDay();
    byDay[d].sum += c.energia + c.foco;
    byDay[d].count += 1;
  });
  let bestDay = 1;
  let bestAvg = 0;
  for (let i = 0; i < 7; i++) {
    const avg = byDay[i].count > 0 ? byDay[i].sum / byDay[i].count : 0;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestDay = i;
    }
  }
  if (bestAvg < 3) return null;
  const dayNames = ["domingos", "lunes", "martes", "miércoles", "jueves", "viernes", "sábados"];
  return `Aprendes mejor los ${dayNames[bestDay]} por la mañana.`;
}

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

  if (loading) {
    return (
      <SurfaceCard padding="lg" clickable={false}>
        <p className="text-sm text-[var(--ink-muted)]">Cargando historial de check-ins…</p>
      </SurfaceCard>
    );
  }

  if (checkins.length === 0) {
    return (
      <SurfaceCard padding="lg" clickable={false}>
        <p className="section-label mb-2">Energía y foco</p>
        <h2 className="heading-section mb-4">Check-in cognitivo</h2>
        <p className="text-[var(--ink-muted)] text-sm">
          Cuando completes el check-in diario en Inicio, aquí verás tu historial de energía y concentración.
        </p>
      </SurfaceCard>
    );
  }

  const chartData = [...checkins]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((c) => ({
      fecha: c.fecha.slice(5),
      energia: c.energia,
      foco: c.foco,
      total: c.energia + c.foco,
    }));

  const insight = getBestDayInsight(checkins);

  return (
    <SurfaceCard padding="lg" clickable={false}>
      <p className="section-label mb-2">Energía y foco</p>
      <h2 className="heading-section mb-4">Check-in cognitivo (últimas 4 semanas)</h2>
      <div className="h-56 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line-subtle)" />
            <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "var(--muted)" }} />
            <YAxis domain={[0, 6]} tick={{ fontSize: 10, fill: "var(--muted)" }} />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "var(--ink)" }}
              formatter={(value) => [Number(value ?? 0), ""]}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            <Legend />
            <Line type="monotone" dataKey="energia" name="Energía" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="foco" name="Foco" stroke="var(--acento)" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {insight && (
        <p className="text-sm text-[var(--ink)] rounded-lg bg-[var(--surface-soft)] p-3 border border-[var(--line-subtle)]">
          <strong>Insight:</strong> {insight}
        </p>
      )}
    </SurfaceCard>
  );
}
