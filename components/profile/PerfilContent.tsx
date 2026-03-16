"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { PreferredChannel } from "@/lib/types/whatsapp";
import { PersonalDataForm } from "@/components/profile/PersonalDataForm";
import { LearningPreferences } from "@/components/profile/LearningPreferences";
import { ProgressAndBadges } from "@/components/profile/ProgressAndBadges";
import { AccessibilityPreferences } from "@/components/profile/AccessibilityPreferences";
import { SecuritySection } from "@/components/profile/SecuritySection";
import { PushNotificationBlock } from "@/components/profile/PushNotificationBlock";
import { PrivacySection } from "@/components/profile/PrivacySection";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";
import { CheckinHistoryCard } from "@/components/profile/CheckinHistoryCard";
import type { ProgressData } from "@/components/profile/ProgressAndBadges";
import type { LastLoginData } from "@/components/profile/SecuritySection";

const DEMO_MODE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/** Contenido completo del perfil del alumno (datos, preferencias, seguridad, competencias). Reutilizable en /perfil y /mi-perfil. */
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
      <div className="max-w-2xl">
        <p className="text-[var(--text-muted)]">Cargando…</p>
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

  return (
    <div className="max-w-4xl">
      <header className="mb-5">
        <h1 className="heading-hero text-[var(--ink)]">Mi perfil</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1.5 max-w-xl">
          Completa tu perfil cuando quieras; así personalizamos tu experiencia y podemos acompañarte mejor en el curso.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <PersonalDataForm
            initial={initialPersonal}
            email={email}
            onSave={saveProfile}
            onAvatarUpload={saveAvatar}
            demo={DEMO_MODE}
          />
        </div>

        <div className="card-premium p-5 md:col-span-2">
        <p className="section-label mb-1.5">Comunicación</p>
        <h2 className="heading-section mb-3">WhatsApp y notificaciones</h2>
        <p className="text-[var(--text-muted)] text-sm mb-3">
          Indica tu número en formato internacional (E.164), por ejemplo +34912345678 o +56912345678.
        </p>
        <label className="block mb-4">
          <span className="font-medium text-[var(--text)]">Teléfono (WhatsApp)</span>
          <input
            type="tel"
            value={channels.phone}
            onChange={(e) => setChannels((c) => ({ ...c, phone: e.target.value }))}
            placeholder="+34 612 345 678"
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-[var(--line)] text-[var(--text)] bg-[var(--surface)] input-premium min-h-[48px]"
          />
        </label>
        <label className="flex items-center gap-3 mb-4 min-h-[48px]">
          <input
            type="checkbox"
            checked={channels.optIn}
            onChange={(e) => setChannels((c) => ({ ...c, optIn: e.target.checked }))}
            className="w-5 h-5 rounded border-[var(--line)]"
          />
          <span className="text-[var(--text)]">Acepto recibir recordatorios y avisos por WhatsApp</span>
        </label>
        <PushNotificationBlock demo={DEMO_MODE} />
        <label className="block mb-4">
          <span className="font-medium text-[var(--text)]">Canal preferido para notificaciones</span>
          <select
            value={channels.preferredChannel}
            onChange={(e) =>
              setChannels((c) => ({ ...c, preferredChannel: e.target.value as PreferredChannel }))
            }
            className="mt-1 block w-full max-w-xs px-4 py-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] input-premium min-h-[48px]"
          >
            <option value="in_app">En la plataforma</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Correo electrónico</option>
          </select>
        </label>
        {channelsMessage && (
          <p
            className={`text-sm mb-4 ${channelsMessage.startsWith("Error") ? "text-[var(--error)]" : "text-[var(--success)]"}`}
            role="alert"
          >
            {channelsMessage}
          </p>
        )}
        <button
          type="button"
          onClick={saveChannels}
          disabled={channelsSaving}
          className="btn-primary disabled:opacity-50"
        >
          {channelsSaving ? "Guardando…" : "Guardar preferencias"}
        </button>
      </div>

        <div className="min-w-0">
          <LearningPreferences
            preferredLanguage={(profileData.preferredLanguage as "es" | "en") ?? "es"}
            reminderFrequency={
              (profileData.reminderFrequency as "daily" | "weekly" | "live_only" | "never") ?? "weekly"
            }
            contentMode={(profileData.contentMode as "leer" | "escuchar" | "ver") ?? "leer"}
            onSave={saveProfile}
            demo={DEMO_MODE}
          />
        </div>

        <div className="min-w-0">
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

        {progress && (
          <div className="min-w-0">
            <ProgressAndBadges data={progress} />
          </div>
        )}

        <div className="min-w-0">
          <CheckinHistoryCard />
        </div>

        <div className="min-w-0">
          <PrivacySection userId={uid} demo={DEMO_MODE} />
        </div>

        <div className="card-premium p-5 min-w-0">
          <p className="section-label mb-1.5">Servicio Profesional de Carrera</p>
          <h2 className="heading-section mb-3">Competencias SPC</h2>
          <p className="text-[var(--text-muted)] text-sm mb-3">
            Consulta tu radar de competencias del catálogo SPC (nivel al entrar vs al salir del programa).
          </p>
          <Link href="/perfil/competencias" className="btn-primary inline-block no-underline text-sm">
            Ver mis competencias
          </Link>
        </div>

        <div className="min-w-0 md:col-span-2">
          <SecuritySection
            email={email}
            mfaEnabled={mfaEnabled}
            lastLogin={lastLogin}
            demo={DEMO_MODE}
          />
        </div>

        {!DEMO_MODE && (
          <div className="mt-4 md:col-span-2">
            <DeleteAccountSection />
          </div>
        )}
      </div>
    </div>
  );
}
