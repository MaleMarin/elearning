"use client";

import { useState, useEffect } from "react";

const TODAY = new Date().toISOString().split("T")[0];

const OPTIONS = [
  { value: "bien", label: "Bien", color: "#00e5a0", emoji: "🟢" },
  { value: "regular", label: "Regular", color: "#f59e0b", emoji: "🟡" },
  { value: "mal", label: "Difícil", color: "#ef4444", emoji: "🔴" },
];

interface WellnessCheckinProps {
  userId: string | undefined;
}

export function WellnessCheckin({ userId }: WellnessCheckinProps) {
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetch(`/api/wellness/checkin?date=${TODAY}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { done?: boolean } | null) => {
        if (d?.done) setDone(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSelect = async (value: string) => {
    if (!userId) return;
    setSelected(value);
    const res = await fetch("/api/wellness/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ date: TODAY, mood: value }),
    });
    if (res.ok) setDone(true);
  };

  if (!userId || loading || done) return null;

  return (
    <div
      style={{
        background: "var(--neu-bg)",
        borderRadius: "16px",
        padding: "18px 22px",
        boxShadow: "var(--neu-shadow-out-sm)",
        marginBottom: "16px",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#9ca3af",
          marginBottom: "12px",
        }}
      >
        ¿Cómo llegaste hoy?
      </p>
      <div style={{ display: "flex", gap: "10px" }}>
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            style={{
              flex: 1,
              padding: "10px 8px",
              border: "none",
              borderRadius: "12px",
              background: "var(--neu-bg)",
              boxShadow:
                selected === opt.value
                  ? "inset 3px 3px 6px rgba(174,183,194,0.5), inset -3px -3px 6px rgba(255,255,255,0.75)"
                  : "var(--neu-shadow-out-sm)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500,
              color: selected === opt.value ? opt.color : "#6b7280",
              fontFamily: "var(--font)",
              transition: "box-shadow 0.15s",
            }}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
