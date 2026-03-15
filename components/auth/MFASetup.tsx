"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { PrimaryButton, SecondaryButton, Alert } from "@/components/ui";
import {
  getTotpSecretForEnrollment,
  enrollTotpWithSecret,
  unenrollTotp,
  listEnrolledFactors,
  type TotpSecretHandle,
} from "@/lib/auth/mfa";
import type { User } from "firebase/auth";

interface MFASetupProps {
  user: User;
  onError: (message: string) => void;
  onSuccess: () => void;
}

export function MFASetup({ user, onError, onSuccess }: MFASetupProps) {
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [factors, setFactors] = useState<{ uid: string; displayName?: string }[]>([]);
  const [step, setStep] = useState<"idle" | "qr" | "verifying">("idle");
  const [totpHandle, setTotpHandle] = useState<TotpSecretHandle | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [unenrollConfirm, setUnenrollConfirm] = useState(false);
  const [unenrollingId, setUnenrollingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { hasMfaEnrolled, listEnrolledFactors: list } = await import("@/lib/auth/mfa");
        const has = await hasMfaEnrolled(user);
        if (cancelled) return;
        setEnrolled(has);
        if (has) {
          const listFactors = await list(user);
          if (!cancelled) setFactors(listFactors);
        }
      } catch {
        if (!cancelled) setEnrolled(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleStartEnroll = async () => {
    setLoading(true);
    onError("");
    try {
      const handle = await getTotpSecretForEnrollment(user);
      setTotpHandle(handle);
      setStep("qr");
      setCode("");
    } catch (e) {
      onError(e instanceof Error ? e.message : "No se pudo generar el código. Comprueba que TOTP esté habilitado en tu proyecto Firebase.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteEnroll = async () => {
    if (!totpHandle || code.length !== 6) {
      onError("Introduce el código de 6 dígitos de tu app de autenticación.");
      return;
    }
    setLoading(true);
    onError("");
    try {
      await enrollTotpWithSecret(user, totpHandle, code);
      setStep("idle");
      setTotpHandle(null);
      setEnrolled(true);
      const listFactors = await listEnrolledFactors(user);
      setFactors(listFactors);
      onSuccess();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Código incorrecto o expirado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (factorUid: string) => {
    if (!unenrollConfirm) {
      setUnenrollConfirm(true);
      return;
    }
    setUnenrollingId(factorUid);
    onError("");
    try {
      await unenrollTotp(user, factorUid);
      setEnrolled(false);
      setFactors([]);
      setUnenrollConfirm(false);
      onSuccess();
    } catch (e) {
      onError(e instanceof Error ? e.message : "No se pudo desactivar.");
    } finally {
      setUnenrollingId(null);
    }
  };

  if (enrolled === null) {
    return <p className="text-sm text-[var(--muted)]">Comprobando estado de MFA…</p>;
  }

  if (step === "qr" && totpHandle) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--ink)]">
          Escanea este código con Google Authenticator o Authy:
        </p>
        <div className="flex justify-center p-4 bg-white rounded-xl border border-[var(--line)]">
          <QRCodeSVG value={totpHandle.qrCodeUrl} size={200} level="M" />
        </div>
        <p className="text-xs text-[var(--muted)]">
          Si no puedes escanear, introduce esta clave manualmente:{" "}
          <code className="bg-[var(--surface-soft)] px-2 py-1 rounded">{totpHandle.secretKey}</code>
        </p>
        <label className="block">
          <span className="text-sm font-medium text-[var(--ink)]">Código de 6 dígitos</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="input-base mt-1.5 block w-full min-h-[48px] font-mono text-lg tracking-widest"
          />
        </label>
        <div className="flex gap-2">
          <PrimaryButton onClick={handleCompleteEnroll} disabled={loading || code.length !== 6} className="min-h-[48px]">
            {loading ? "Comprobando…" : "Activar"}
          </PrimaryButton>
          <SecondaryButton onClick={() => { setStep("idle"); setTotpHandle(null); }} className="min-h-[48px]">
            Cancelar
          </SecondaryButton>
        </div>
      </div>
    );
  }

  if (enrolled && factors.length > 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--success)] font-medium">Verificación en dos pasos activada.</p>
        <ul className="text-sm text-[var(--ink)] space-y-2">
          {factors.map((f) => (
            <li key={f.uid} className="flex items-center justify-between gap-4">
              <span>{f.displayName ?? "Authenticator"}</span>
              <div className="flex gap-2">
                <SecondaryButton
                  onClick={() => handleUnenroll(f.uid)}
                  disabled={unenrollingId !== null}
                  className="min-h-[40px]"
                >
                  {unenrollConfirm && unenrollingId !== f.uid ? "¿Seguro? Pulsa de nuevo" : unenrollingId === f.uid ? "Desactivando…" : "Desactivar"}
                </SecondaryButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">No tienes verificación en dos pasos activada.</p>
      <PrimaryButton onClick={handleStartEnroll} disabled={loading} className="min-h-[48px]">
        {loading ? "Generando…" : "Activar verificación en dos pasos"}
      </PrimaryButton>
    </div>
  );
}
