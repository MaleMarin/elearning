"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/ui";
import { resolveSignInWithTotp } from "@/lib/auth/mfa";
import type { MultiFactorResolver } from "firebase/auth";
import type { UserCredential } from "firebase/auth";

interface MFAChallengeProps {
  resolver: MultiFactorResolver;
  onSuccess: (credential: UserCredential) => void;
  onError: (message: string) => void;
}

export function MFAChallenge({ resolver, onSuccess, onError }: MFAChallengeProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      onError("Introduce el código de 6 dígitos de tu app de autenticación.");
      return;
    }
    setLoading(true);
    onError("");
    try {
      const userCredential = await resolveSignInWithTotp(resolver, code);
      onSuccess(userCredential);
    } catch {
      onError("Código incorrecto o expirado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[var(--ink)]">
        Tu cuenta tiene verificación en dos pasos. Introduce el código de 6 dígitos de tu app (Google Authenticator o Authy).
      </p>
      <label className="block">
        <span className="text-[var(--ink)] text-sm font-medium">Código</span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          autoFocus
          className="input-base mt-1.5 block w-full min-h-[48px] font-mono text-lg tracking-widest"
        />
      </label>
      <PrimaryButton type="submit" disabled={loading || code.length !== 6} className="w-full min-h-[48px]">
        {loading ? "Comprobando…" : "Continuar"}
      </PrimaryButton>
    </form>
  );
}
