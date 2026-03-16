"use client";

import { useState, useEffect } from "react";

interface DayActivity {
  date: string;
  count: number;
}

export default function ActivityHeatmap({ userId }: { userId: string }) {
  const [data, setData] = useState<DayActivity[]>([]);

  useEffect(() => {
    fetch("/api/profile/activity-heatmap", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { activity?: DayActivity[] }) => setData(d.activity ?? []))
      .catch(() => setData([]));
  }, [userId]);

  const weeks: DayActivity[][] = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 363);

  for (let w = 0; w < 52; w++) {
    const week: DayActivity[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(date.getDate() + w * 7 + d);
      const dateStr = date.toISOString().split("T")[0];
      const found = data.find((a) => a.date === dateStr);
      week.push({ date: dateStr, count: found?.count ?? 0 });
    }
    weeks.push(week);
  }

  const getColor = (count: number) => {
    if (count === 0) return "inset 2px 2px 4px #c2c8d6, inset -2px -2px 4px #ffffff";
    return "none";
  };

  const getBg = (count: number) => {
    if (count === 0) return "#e8eaf0";
    if (count <= 2) return "rgba(0,229,160,0.3)";
    if (count <= 5) return "rgba(0,229,160,0.6)";
    return "#00e5a0";
  };

  return (
    <div style={{ fontFamily: "var(--font-heading)" }}>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#8892b0",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          marginBottom: 12,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        Tu actividad · Último año
      </p>
      <div style={{ display: "flex", gap: 3, overflowX: "auto" }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {week.map((day, di) => (
              <div
                key={di}
                title={`${day.date}: ${day.count} acciones`}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: getBg(day.count),
                  boxShadow: getColor(day.count),
                  cursor: "default",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <span style={{ fontSize: 10, color: "#8892b0" }}>Menos</span>
        {[0, 2, 4, 6].map((c) => (
          <div
            key={c}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: getBg(c),
              boxShadow: c === 0 ? "inset 2px 2px 4px #c2c8d6, inset -2px -2px 4px #ffffff" : "none",
            }}
          />
        ))}
        <span style={{ fontSize: 10, color: "#8892b0" }}>Más</span>
      </div>
    </div>
  );
}
