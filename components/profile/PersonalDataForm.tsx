"use client";

import { useState, useEffect } from "react";
import { COUNTRIES, getRegionsForCountry } from "@/lib/constants/countries";

const CARD_STYLE = {
  background: "#e8eaf0",
  borderRadius: 20,
  padding: 24,
  boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
} as const;

const INPUT_STYLE = {
  background: "#e8eaf0",
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  fontFamily: "'Syne', sans-serif",
  fontSize: 13,
  color: "#0a0f8a",
  outline: "none",
  boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
  width: "100%",
} as const;

export interface PersonalDataValues {
  fullName: string;
  photoURL: string | null;
  institution: string;
  position: string;
  country: string;
  region: string;
  linkedIn: string;
}

interface PersonalDataFormProps {
  initial: Partial<PersonalDataValues>;
  email: string;
  onSave: (data: Partial<PersonalDataValues>) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<void>;
  demo?: boolean;
}

export function PersonalDataForm({
  initial,
  email,
  onSave,
  onAvatarUpload: _onAvatarUpload,
  demo = false,
}: PersonalDataFormProps) {
  const [fullName, setFullName] = useState(initial.fullName ?? "");
  const [institution, setInstitution] = useState(initial.institution ?? "");
  const [position, setPosition] = useState(initial.position ?? "");
  const [country, setCountry] = useState(initial.country ?? "");
  const [region, setRegion] = useState(initial.region ?? "");
  const [linkedIn, setLinkedIn] = useState(initial.linkedIn ?? "");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastError, setToastError] = useState(false);

  useEffect(() => {
    setFullName(initial.fullName ?? "");
    setInstitution(initial.institution ?? "");
    setPosition(initial.position ?? "");
    setCountry(initial.country ?? "");
    setRegion(initial.region ?? "");
    setLinkedIn(initial.linkedIn ?? "");
  }, [initial]);

  const regions = getRegionsForCountry(country);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        fullName: fullName.trim() || undefined,
        institution: institution.trim() || undefined,
        position: position.trim() || undefined,
        country: country || undefined,
        region: region || undefined,
        linkedIn: linkedIn.trim() || undefined,
      });
      setToastError(false);
      setToast("Perfil actualizado");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={CARD_STYLE}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>Datos personales</p>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0a0f8a", marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Información de tu perfil</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a" }}>Nombre completo</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre y apellidos" style={INPUT_STYLE} />
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a" }}>Institución</label>
          <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Ej: Ministerio de Educación" style={INPUT_STYLE} />
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a" }}>País</label>
          <select value={country} onChange={(e) => { setCountry(e.target.value); setRegion(""); }} style={INPUT_STYLE}>
            <option value="">Selecciona</option>
            {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a" }}>LinkedIn (opcional)</label>
          <input type="url" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="https://linkedin.com/in/..." style={INPUT_STYLE} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a" }}>Correo</label>
          <input type="email" value={email} readOnly style={{ ...INPUT_STYLE, color: "#8892b0" }} />
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a" }}>Cargo</label>
          <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Ej: Jefe de División" style={INPUT_STYLE} />
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a" }}>Región</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)} style={INPUT_STYLE}>
            <option value="">Selecciona</option>
            {regions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {toast && (
        <p style={{ fontSize: 12, marginBottom: 12, color: toastError ? "#d84040" : "#00b87d" }} role={toastError ? "alert" : "status"}>{toast}</p>
      )}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || demo}
        style={{
          padding: "11px 24px",
          borderRadius: 14,
          border: "none",
          cursor: saving || demo ? "not-allowed" : "pointer",
          fontFamily: "'Syne', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
          color: "white",
          boxShadow: "5px 5px 12px rgba(10,15,138,0.35)",
        }}
      >
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
}
