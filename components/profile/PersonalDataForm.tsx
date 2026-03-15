"use client";

import { useState, useEffect } from "react";
import { AvatarUpload } from "./AvatarUpload";
import { COUNTRIES, getRegionsForCountry } from "@/lib/constants/countries";

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
  onAvatarUpload,
  demo = false,
}: PersonalDataFormProps) {
  const [fullName, setFullName] = useState(initial.fullName ?? "");
  const [institution, setInstitution] = useState(initial.institution ?? "");
  const [position, setPosition] = useState(initial.position ?? "");
  const [country, setCountry] = useState(initial.country ?? "");
  const [region, setRegion] = useState(initial.region ?? "");
  const [linkedIn, setLinkedIn] = useState(initial.linkedIn ?? "");
  const [photoURL, setPhotoURL] = useState<string | null>(initial.photoURL ?? null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastError, setToastError] = useState(false);

  useEffect(() => {
    setFullName(initial.fullName ?? "");
    setInstitution(initial.institution ?? "");
    setPosition(initial.position ?? "");
    setCountry(initial.country ?? "");
    setRegion(initial.region ?? "");
    setLinkedIn(initial.linkedIn ?? "");
    setPhotoURL(initial.photoURL ?? null);
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

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    setToast(null);
    try {
      await onAvatarUpload(file);
      setToastError(false);
      setToast("Foto actualizada");
      setTimeout(() => setToast(null), 3000);
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.photoURL) setPhotoURL(data.photoURL);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al subir la foto";
      setToastError(true);
      setToast(message);
      setTimeout(() => { setToast(null); setToastError(false); }, 5000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card-premium p-6">
      <p className="section-label mb-2">Datos personales</p>
      <h2 className="heading-section mb-4">Información de tu perfil</h2>

      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <AvatarUpload
          photoURL={photoURL}
          fullName={fullName || null}
          email={email || null}
          onUpload={handleAvatarUpload}
          uploading={uploading}
        />
        <div className="flex-1 space-y-4">
          <label className="block">
            <span className="font-medium text-[var(--text)]">Nombre completo</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre y apellidos"
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-[var(--line)] text-[var(--text)] bg-[var(--surface)] input-premium min-h-[48px]"
            />
          </label>
          <label className="block">
            <span className="font-medium text-[var(--text)]">Correo electrónico</span>
            <input
              type="email"
              value={email}
              readOnly
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--muted)] min-h-[48px]"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        <label className="block">
          <span className="font-medium text-[var(--text)]">Institución / Organismo público</span>
          <input
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Ej: Ministerio de Educación"
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-[var(--line)] text-[var(--text)] bg-[var(--surface)] input-premium min-h-[48px]"
          />
        </label>
        <label className="block">
          <span className="font-medium text-[var(--text)]">Cargo</span>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Ej: Jefe de División"
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-[var(--line)] text-[var(--text)] bg-[var(--surface)] input-premium min-h-[48px]"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        <label className="block">
          <span className="font-medium text-[var(--text)]">País</span>
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setRegion("");
            }}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-[var(--line)] text-[var(--text)] bg-[var(--surface)] input-premium min-h-[48px]"
          >
            <option value="">Selecciona</option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-medium text-[var(--text)]">Región</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-[var(--line)] text-[var(--text)] bg-[var(--surface)] input-premium min-h-[48px]"
          >
            <option value="">Selecciona</option>
            {regions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block mb-4">
        <span className="font-medium text-[var(--text)]">LinkedIn (opcional)</span>
        <input
          type="url"
          value={linkedIn}
          onChange={(e) => setLinkedIn(e.target.value)}
          placeholder="https://linkedin.com/in/..."
          className="mt-1 block w-full px-4 py-3 rounded-lg border border-[var(--line)] text-[var(--text)] bg-[var(--surface)] input-premium min-h-[48px]"
        />
      </label>

      {toast && (
        <p className={`text-sm mb-4 ${toastError ? "text-[#b91c1c]" : "text-[var(--success)]"}`} role={toastError ? "alert" : "status"}>
          {toast}
        </p>
      )}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || demo}
        className="btn-primary disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
}
