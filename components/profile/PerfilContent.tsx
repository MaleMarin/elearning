"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { PreferredChannel } from "@/lib/types/whatsapp";
import { PersonalDataForm } from "@/components/profile/PersonalDataForm";
import { LearningPreferences } from "@/components/profile/LearningPreferences";
import { AccessibilityPreferences } from "@/components/profile/AccessibilityPreferences";
import { SecuritySection } from "@/components/profile/SecuritySection";
import { PushNotificationBlock } from "@/components/profile/PushNotificationBlock";
import { PrivacySection } from "@/components/profile/PrivacySection";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";
import { CheckinHistoryCard } from "@/components/profile/CheckinHistoryCard";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import type { ProgressData } from "@/components/profile/ProgressAndBadges";
import type { LastLoginData } from "@/components/profile/SecuritySection";

const DEMO_MODE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEMO_MODE === "true";

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
  fontFamily: "var(--font-heading)",
  fontSize: 13,
  color: "#0a0f8a",
  outline: "none",
  boxShadow: "inset 3px 3px 8px #c2c8d6, inset -3px -3px 8px #ffffff",
} as const;

export function PerfilContent() {
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [lastLogin, setLastLogin] = useState<LastLoginData | null>(null);
  const [channels, setChannels] = useState({
    phone: "",
    optIn: false,
    preferredChannel: "in_app" as PreferredChannel,
  });
  const [loading, setLoading] = useState(true);
  const [channelsSaving, setChannelsSaving] = useState(false);
  const [channelsMessage, setChannelsMessage] = useState<string | null>(null);
  const [competencias, setCompetencias] = useState<{ nombre: string; valueEntrada: number; valueSalida: number }[]>([]);
  const sectionDatosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/profile/progress").then((r) => r.json()),
      fetch("/api/user/channels").then((r) => r.json()),
    ])
      .then(([me, prof, prog, ch]) => {
        const m = me as { uid?: string; email?: string; mfaEnabled?: boolean };
        if (m?.uid) setUid(m.uid);
        if (m?.email) setEmail(m.email);
        if (m?.mfaEnabled) setMfaEnabled(m.mfaEnabled);
        if (prof && !prof.error) setProfile(prof);
        if (prog && !prog.error) setProgress(prog as ProgressData);
        if (ch.channel) {
          setChannels({
            phone: ch.channel.whatsapp_number_e164 ?? "",
            optIn: !!ch.channel.whatsapp_opt_in,
            preferredChannel: ch.channel.preferred_channel ?? "in_app",
          });
        }
        return fetch("/api/profile/last-login").then((r) => r.json());
      })
      .then((last) => {
        if (last && !last.error) setLastLogin(last);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/profile/competencias", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { competencias?: { nombre: string; valueEntrada: number; valueSalida: number }[] } | null) => {
        if (d?.competencias && Array.isArray(d.competencias)) setCompetencias(d.competencias.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const saveProfile = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    if (profile) setProfile({ ...profile, ...data });
  };

  const saveAvatar = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
  };

  const saveChannels = () => {
    setChannelsSaving(true);
    setChannelsMessage(null);
    fetch("/api/user/channels", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        whatsapp_number_e164: channels.phone.trim() || null,
        whatsapp_opt_in: channels.optIn,
        preferred_channel: channels.preferredChannel,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setChannelsMessage(d.error);
        else setChannelsMessage("Preferencias guardadas.");
      })
      .catch(() => setChannelsMessage("Error al guardar"))
      .finally(() => setChannelsSaving(false));
  };

  if (loading) {
    return (
      <div style={{ padding: "20px 20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "var(--font-heading)" }}>
        <p style={{ fontSize: 13, color: "#8892b0" }}>Cargando…</p>
      </div>
    );
  }

  const profileData = profile ?? {};
  const initialPersonal = {
    fullName: (profileData.fullName as string) ?? "",
    photoURL: (profileData.photoURL as string) ?? null,
    institution: (profileData.institution as string) ?? "",
    position: (profileData.position as string) ?? "",
    country: (profileData.country as string) ?? "",
    region: (profileData.region as string) ?? "",
    linkedIn: (profileData.linkedIn as string) ?? "",
  };
  const fullName = (profileData.fullName as string) ?? "";
  const institution = (profileData.institution as string) ?? "";
  const position = (profileData.position as string) ?? "";

  return (
    <div style={{ flex: 1, padding: "20px 20px", background: "#e8eaf0", minHeight: "100vh", fontFamily: "var(--font-heading)" }}>
      {/* SECCIÓN 1 — HERO DEL PERFIL */}
      <div style={{ ...CARD_STYLE, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20, marginBottom: 24 }}>
        <div style={{ position: "relative" }}>
          <AvatarUpload
            photoURL={(profileData.photoURL as string) ?? null}
            fullName={fullName || null}
            email={email || null}
            onUpload={saveAvatar}
            uploading={false}
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0a0f8a", marginBottom: 4, fontFamily: "var(--font-heading)" }}>
            {fullName || "Sin nombre"}
          </h1>
          <p style={{ fontSize: 12, color: "#8892b0", fontFamily: "'Space Mono', monospace", marginBottom: 2 }}>{email}</p>
          <p style={{ fontSize: 13, color: "#4a5580", marginBottom: 12 }}>{institution || "—"} {position ? `· ${position}` : ""}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#00b87d", padding: "4px 10px", borderRadius: 20, background: "rgba(0,184,125,0.15)", fontFamily: "'Space Mono', monospace" }}>
              En línea
            </span>
            <button
              type="button"
              onClick={() => sectionDatosRef.current?.scrollIntoView({ behavior: "smooth" })}
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-heading)",
                fontSize: 12,
                fontWeight: 600,
                background: "#e8eaf0",
                color: "#1428d4",
                boxShadow: "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff",
              }}
            >
              Editar perfil
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2 — DATOS PERSONALES */}
      <div ref={sectionDatosRef} style={{ marginBottom: 24 }}>
        <PersonalDataForm
          initial={initialPersonal}
          email={email}
          onSave={saveProfile}
          onAvatarUpload={saveAvatar}
          demo={DEMO_MODE}
        />
      </div>

      {/* SECCIÓN 3 — PREFERENCIAS (2 columnas) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24, alignItems: "start" }}>
        <div style={CARD_STYLE}>
          <LearningPreferences
            preferredLanguage={(profileData.preferredLanguage as "es" | "en") ?? "es"}
            reminderFrequency={(profileData.reminderFrequency as "daily" | "weekly" | "live_only" | "never") ?? "weekly"}
            contentMode={(profileData.contentMode as "leer" | "escuchar" | "ver") ?? "leer"}
            onSave={saveProfile}
            demo={DEMO_MODE}
          />
        </div>
        <div style={CARD_STYLE}>
          <AccessibilityPreferences
            initial={{
              fontSize: (profileData.accessibilityFontSize as "normal" | "large") ?? "normal",
              reduceMotion: !!profileData.accessibilityReduceMotion,
              highContrast: !!profileData.accessibilityHighContrast,
            }}
            onSaveToProfile={async (prefs) =>
              saveProfile({
                accessibilityFontSize: prefs.fontSize,
                accessibilityReduceMotion: prefs.reduceMotion,
                accessibilityHighContrast: prefs.highContrast,
              })
            }
            demo={DEMO_MODE}
          />
        </div>
      </div>

      {/* SECCIÓN 4 — COMUNICACIÓN */}
      <div style={{ ...CARD_STYLE, marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#8892b0", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>Comunicación</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a", marginBottom: 6 }}>Teléfono (WhatsApp)</label>
            <input
              type="tel"
              value={channels.phone}
              onChange={(e) => setChannels((c) => ({ ...c, phone: e.target.value }))}
              placeholder="+34 612 345 678"
              style={{ ...INPUT_STYLE, width: "100%", maxWidth: 220 }}
            />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={channels.optIn}
              onChange={(e) => setChannels((c) => ({ ...c, optIn: e.target.checked }))}
              style={{ width: 18, height: 18, accentColor: "#1428d4" }}
            />
            <span style={{ fontSize: 13, color: "#0a0f8a", fontWeight: 500 }}>Acepto notificaciones WhatsApp</span>
          </label>
          <div style={{ flex: "1 1 180px" }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0a0f8a", marginBottom: 6 }}>Canal preferido</label>
            <select
              value={channels.preferredChannel}
              onChange={(e) => setChannels((c) => ({ ...c, preferredChannel: e.target.value as PreferredChannel }))}
              style={{ ...INPUT_STYLE, width: "100%", maxWidth: 200 }}
            >
              <option value="in_app">En la plataforma</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Correo</option>
            </select>
          </div>
          <PushNotificationBlock demo={DEMO_MODE} />
        </div>
        {channelsMessage && (
          <p style={{ fontSize: 12, marginTop: 12, color: channelsMessage.startsWith("Error") ? "#d84040" : "#00b87d" }}>{channelsMessage}</p>
        )}
        <button
          type="button"
          onClick={saveChannels}
          disabled={channelsSaving}
          style={{
            marginTop: 16,
            padding: "11px 24px",
            borderRadius: 14,
            border: "none",
            cursor: channelsSaving ? "wait" : "pointer",
            fontFamily: "var(--font-heading)",
            fontSize: 13,
            fontWeight: 700,
            background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
            color: "white",
            boxShadow: "5px 5px 12px rgba(10,15,138,0.35)",
          }}
        >
          {channelsSaving ? "Guardando…" : "Guardar preferencias"}
        </button>
      </div>

      {/* SECCIÓN 5 — COMPETENCIAS SPC */}
      <div style={{ ...CARD_STYLE, marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#0a0f8a", marginBottom: 12, fontFamily: "var(--font-heading)" }}>Competencias del Servicio Civil</p>
        <Link
          href="/perfil/competencias"
          style={{
            display: "inline-block",
            marginBottom: 16,
            padding: "9px 18px",
            borderRadius: 12,
            background: "#e8eaf0",
            color: "#1428d4",
            fontFamily: "var(--font-heading)",
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff",
          }}
        >
          Ver mi radar de competencias
        </Link>
        {competencias.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {competencias.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0a0f8a", minWidth: 120 }}>{c.nombre}</span>
                <div style={{ flex: 1, height: 8, background: "#e8eaf0", borderRadius: 4, boxShadow: "inset 2px 2px 5px #c2c8d6", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (c.valueSalida ?? 0) * 20)}%`, background: "linear-gradient(90deg, #1428d4, #2b4fff)", borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#1428d4", fontFamily: "'Space Mono', monospace", minWidth: 36 }}>{Math.round((c.valueSalida ?? 0) * 20)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN 6 — ENERGÍA Y FOCO */}
      <div style={{ ...CARD_STYLE, marginBottom: 24 }}>
        <CheckinHistoryCard />
      </div>

      {/* SECCIÓN 7 — PRIVACIDAD Y SEGURIDAD (2 columnas) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24, alignItems: "start" }}>
        <div style={CARD_STYLE}>
          <PrivacySection userId={uid} demo={DEMO_MODE} />
        </div>
        <div style={CARD_STYLE}>
          <SecuritySection email={email} mfaEnabled={mfaEnabled} lastLogin={lastLogin} demo={DEMO_MODE} />
        </div>
      </div>

      {/* SECCIÓN 8 — ZONA PELIGROSA */}
      {!DEMO_MODE && (
        <div style={{ ...CARD_STYLE, border: "1px solid rgba(216,64,64,0.2)", marginBottom: 24 }}>
          <DeleteAccountSection />
        </div>
      )}
    </div>
  );
}
