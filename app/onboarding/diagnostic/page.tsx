"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticWizard } from "@/components/evaluation/DiagnosticWizard";
import type { DiagnosticAnswers } from "@/lib/services/evaluation";
import { getDemoMode } from "@/lib/env";
import { encrypt } from "@/lib/crypto/encryption";

export default function OnboardingDiagnosticPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/evaluation/diagnostic", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.completed && !d.skipped) {
          setAlreadyCompleted(true);
          router.replace("/inicio");
        } else {
          setAlreadyCompleted(false);
        }
      })
      .catch(() => setAlreadyCompleted(false))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((me: { uid?: string } | null) => setUid(me?.uid ?? null))
      .catch(() => {});
  }, []);

  const handleComplete = async (answers: DiagnosticAnswers, skipped: boolean) => {
    const res = await fetch("/api/evaluation/diagnostic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ answers, skipped }),
    });
    if (!res.ok) throw new Error("Error al guardar");
    router.replace("/inicio");
  };

  const handleSaveLetter = async (content: string) => {
    if (!uid) throw new Error("Sesión no disponible");
    const encrypted = encrypt(content.trim(), uid);
    const res = await fetch("/api/onboarding/future-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: encrypted }),
    });
    if (!res.ok) throw new Error("Error al guardar la carta");
  };

  if (loading || alreadyCompleted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="heading-hero text-[var(--ink)] mb-2">Diagnóstico inicial</h1>
      <p className="text-[var(--text-muted)] mb-8">
        Responde unas breves preguntas para personalizar tu experiencia. Solo te tomará un momento.
      </p>
      <DiagnosticWizard onComplete={handleComplete} onSaveLetter={handleSaveLetter} demo={getDemoMode()} />
    </div>
  );
}
